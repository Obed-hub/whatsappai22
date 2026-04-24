/**
 * WhatsAppWebhookWorkflow
 *
 * Full pipeline for incoming WhatsApp messages:
 * 1. Identify vendor by phone_number_id
 * 2. Upsert customer (CRM)
 * 3. Cancel pending follow-ups (customer replied — stop automation)
 * 4. Log inbound message
 * 5. Classify intent
 * 6. Log interest if buying intent detected
 * 7. Get product recommendations
 * 8. Generate AI reply
 * 9. Send reply + View Store button
 * 10. If hot lead → alert vendor immediately
 * 11. If demand spike → alert vendor
 * 12. Schedule follow-ups (soft @ 2min, urgent @ 10min)
 * 13. If buying intent → also schedule reminders (1h, 24h)
 * 14. Handle back-in-stock inquiry
 */

import { VendorRepository } from './db/vendor.repository'
import { CustomerRepository } from './db/customer.repository'
import { ConversationRepository } from './db/conversation.repository'
import { ProductRepository } from './db/product.repository'
import { AnalyticsRepository } from './db/analytics.repository'
import { WhatsAppService } from './whatsapp'
import { AIService } from './ai'
import { IntentService } from './intent.service'
import { FollowUpService } from './followup.service'
import { AlertService } from './alert.service'
import { StockService } from './stock.service'
import { getSupabaseAdmin } from '@/server/lib/supabase-admin'

export class WhatsAppWebhookWorkflow {
  static async processIncomingMessage(payload: any) {
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    if (!message) return { status: 'ignored' }

    const phone_number_id = value?.metadata?.phone_number_id
    const customer_id_phone = message.from
    const message_body = message.text?.body

    if (!message_body) return { status: 'ignored' }

    try {
      // ── 1. Identify Vendor & Connection ──────────────────────────────────
      const connection = (await VendorRepository.getByPhoneNumberId(phone_number_id)) as any
      if (!connection) throw new Error(`Vendor not found for phone_number_id: ${phone_number_id}`)

      const vendor = connection.vendors
      const vendor_id = vendor.id

      // ── 2. Upsert Customer (CRM) ─────────────────────────────────────────
      const customer = await CustomerRepository.upsert(
        vendor_id,
        customer_id_phone,
        value?.contacts?.[0]?.profile?.name,
      )
      await (CustomerRepository as any).updateMessageInfo(customer.id, message_body)

      // ── 3. Cancel any pending follow-ups (customer replied) ───────────────
      await FollowUpService.cancelPendingFollowUps(vendor_id, customer.id)

      // ── 4. Manage Conversation State ─────────────────────────────────────
      const conversation = await ConversationRepository.upsert(
        vendor_id,
        customer.id,
        phone_number_id,
      )

      // ── 5. Log Inbound Message ────────────────────────────────────────────
      await ConversationRepository.saveMessage(conversation.id, vendor_id, 'inbound', message_body)
      await AnalyticsRepository.logEvent(vendor_id, 'inbound_message', customer.id, {
        message: message_body,
      })

      // ── 6. Classify Intent ────────────────────────────────────────────────
      const intent = IntentService.classify(message_body)
      await AnalyticsRepository.logEvent(vendor_id, 'intent_classified', customer.id, {
        intent: intent.intent,
        score: intent.score,
        is_hot_lead: intent.isHotLead,
        keywords: intent.keywords,
      })

      // Update customer's last intent for CRM view
      const supabase = getSupabaseAdmin()
      await (supabase
        .from('customers') as any)
        .update({ last_intent: intent.intent, last_intent_at: new Date().toISOString() })
        .eq('id', customer.id)

      // ── 7. Check Automation Settings ─────────────────────────────────────
      const automation = await ConversationRepository.getAutomationSettings(vendor_id)
      if (!automation?.auto_reply_enabled) return { status: 'ok', intent: intent.intent }

      // ── 8. Load Products & Store ──────────────────────────────────────────
      const allProducts = await ProductRepository.getByVendorId(vendor_id)
      const recommendedProducts = AIService.getRecommendedProducts(allProducts, message_body)
      const store = await ConversationRepository.getStoreInfo(vendor_id)
      const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${store.slug}`

      // ── 9. Log Interest (for demand tracking) ────────────────────────────
      if (intent.score >= 50 && recommendedProducts.length > 0) {
        await (supabase
          .from('interests') as any)
          .insert({
            customer_id: customer.id,
            vendor_id,
            product_id: recommendedProducts[0].id,
            intent_score: intent.score,
            intent_type: intent.intent,
            raw_message: message_body.slice(0, 500),
          })
      }

      // ── 10. Handle Back-in-Stock Inquiry ─────────────────────────────────
      if (intent.intent === 'back_in_stock' && recommendedProducts.length > 0) {
        const outOfStockProduct = allProducts.find(
          p => p.name.toLowerCase().includes(message_body.toLowerCase()) && p.stock === 0,
        )
        if (outOfStockProduct) {
          const askMsg = StockService.buildAskNotificationMessage(outOfStockProduct.name)
          await WhatsAppService.sendMessage(phone_number_id, connection.access_token, customer_id_phone, askMsg)
          await ConversationRepository.saveMessage(conversation.id, vendor_id, 'outbound', askMsg)

          // If customer says YES in the message body, register them
          if (/\byes\b/i.test(message_body)) {
            await StockService.registerBackInStockRequest(vendor_id, customer.id, outOfStockProduct.id)
          }

          return { status: 'back_in_stock_handled' }
        }
      }

      // ── 11. Generate AI Reply ─────────────────────────────────────────────
      let reply_content = ''
      if (automation.ai_enabled) {
        reply_content = await AIService.generateReply({
          vendorName: store.store_name,
          storeUrl,
          products: recommendedProducts,
          userMessage: message_body,
        })
      } else {
        reply_content = automation.welcome_message || `Hi! Check out our products at ${storeUrl}`
      }

      // ── 12. Send Reply ────────────────────────────────────────────────────
      await WhatsAppService.sendMessage(
        phone_number_id,
        connection.access_token,
        customer_id_phone,
        reply_content,
      )
      await AnalyticsRepository.logEvent(vendor_id, 'outbound_ai_reply', customer.id, {
        reply: reply_content,
      })

      // ── 13. Log Products Recommended ─────────────────────────────────────
      if (recommendedProducts.length > 0) {
        await AnalyticsRepository.logEvent(vendor_id, 'products_recommended', customer.id, {
          product_ids: recommendedProducts.map(p => p.id),
        })
      }

      // ── 14. Send View Store Button with Tracking URL ──────────────────────
      const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${store.slug}?to=/s/${store.slug}&customer=${customer.id}`
      await WhatsAppService.sendViewStoreButton(
        phone_number_id,
        connection.access_token,
        customer_id_phone,
        trackingUrl,
      )
      await AnalyticsRepository.logEvent(vendor_id, 'store_button_sent', customer.id, {
        tracking_url: trackingUrl,
      })

      // ── 15. Log Outbound Message ──────────────────────────────────────────
      await ConversationRepository.saveMessage(conversation.id, vendor_id, 'outbound', reply_content)

      // ── 16. Hot Lead Alert → Vendor ───────────────────────────────────────
      if (intent.isHotLead && vendor.phone) {
        const topProduct = recommendedProducts[0]
        await AlertService.sendHotLeadAlert({
          phoneNumberId: phone_number_id,
          accessToken: connection.access_token,
          vendorPhone: vendor.phone,
          customerPhone: customer_id_phone,
          productName: topProduct?.name,
          customerMessage: message_body,
        })
        await AnalyticsRepository.logEvent(vendor_id, 'lead_detected', customer.id, {
          score: intent.score,
          product: topProduct?.name,
        })
      }

      // ── 17. Demand Spike Alert ────────────────────────────────────────────
      if (recommendedProducts.length > 0 && vendor.phone) {
        const topProduct = recommendedProducts[0]
        const demandCount = await AlertService.getDemandCount(vendor_id, topProduct.name)
        if (demandCount > 0) {
          await AlertService.sendDemandAlert({
            phoneNumberId: phone_number_id,
            accessToken: connection.access_token,
            vendorPhone: vendor.phone,
            vendorId: vendor_id,
            productName: topProduct.name,
            count: demandCount,
          })
        }
      }

      // ── 18. Schedule Follow-Ups ───────────────────────────────────────────
      await FollowUpService.scheduleFollowUps(vendor_id, customer.id, conversation.id)

      // Also schedule longer reminders if buying intent detected
      if (intent.intent === 'buying_intent' || intent.intent === 'price_inquiry') {
        await FollowUpService.scheduleReminders(vendor_id, customer.id, conversation.id)
      }

      return { status: 'success', intent: intent.intent, isHotLead: intent.isHotLead }
    } catch (error) {
      console.error('[WhatsAppWorkflow] Error:', error)
      throw error
    }
  }
}
