import { VendorRepository } from './db/vendor.repository'
import { CustomerRepository } from './db/customer.repository'
import { ProductRepository } from './db/product.repository'
import { AnalyticsRepository } from './db/analytics.repository'
import { WhatsAppService } from './whatsapp'
import { AIService } from './ai'
import { getSupabaseAdmin } from '@/server/lib/supabase-admin'

export class WhatsAppWebhookWorkflow {
  static async processIncomingMessage(payload: any) {
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    // Ignore webhook events without messages or message_status events
    if (!message) return { status: 'ignored_no_message' }

    const message_id = message.id
    const phone_number_id = value?.metadata?.phone_number_id
    const customer_id_phone = message.from
    const message_body = message.text?.body

    if (!message_body || !message_id || !phone_number_id) return { status: 'ignored_invalid_format' }

    const supabase = getSupabaseAdmin() as any

    try {
      // 1. Deduplication: Prevent duplicate replies from webhook retries
      const { data: existingEvent } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_type', 'inbound_message')
        .contains('metadata_json', { message_id })
        .limit(1)
        .single()
        
      if (existingEvent) {
        console.log(`[Webhook] Duplicate message ignored: ${message_id}`)
        return { status: 'ignored_duplicate' }
      }

      // 2. Identify Vendor
      const connection = (await VendorRepository.getByPhoneNumberId(phone_number_id)) as any
      if (!connection) throw new Error(`Vendor not found for phone_number_id: ${phone_number_id}`)

      const vendor = connection.vendors
      const vendor_id = vendor.id

      // 3. Ignore messages sent by the business itself
      if (customer_id_phone === vendor.phone || customer_id_phone === vendor.whatsapp_number) {
        console.log(`[Webhook] Ignored message from business itself: ${customer_id_phone}`)
        return { status: 'ignored_self_message' }
      }

      // 4. Upsert Customer (CRM)
      const customerName = value?.contacts?.[0]?.profile?.name || 'Customer'
      const customer = await CustomerRepository.upsert(vendor_id, customer_id_phone, customerName)

      // 5. Log Inbound Message
      console.log(`[Webhook] Inbound message from ${customer_id_phone}: ${message_body}`)
      await AnalyticsRepository.logEvent(vendor_id, 'inbound_message', customer.id, {
        message_id,
        message: message_body,
      })

      // 6. Generate AI Reply
      const allProducts = await ProductRepository.getByVendorId(vendor_id)
      const recommendedProducts = AIService.getRecommendedProducts(allProducts, message_body)
      
      const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${vendor.stores?.[0]?.slug || 'store'}`
      
      const reply_content = await AIService.generateSalesReply({
        vendorName: vendor.stores?.[0]?.store_name || vendor.business_name,
        storeUrl,
        products: recommendedProducts,
        userMessage: message_body,
      })

      // 7. Send Text Reply
      console.log(`[Webhook] Sending AI reply to ${customer_id_phone}...`)
      await WhatsAppService.sendWhatsAppText({
        to: customer_id_phone,
        text: reply_content,
        phoneNumberId: phone_number_id
      })
      await AnalyticsRepository.logEvent(vendor_id, 'ai_reply_sent', customer.id, {
        reply: reply_content,
      })

      // 8. Send View Store Button
      const ctaStoreUrl = storeUrl
      
      console.log(`[Webhook] Sending CTA Button with URL: ${ctaStoreUrl}...`)
      await WhatsAppService.sendViewStoreButton({
        to: customer_id_phone,
        phoneNumberId: phone_number_id,
        storeUrl: ctaStoreUrl
      })
      await AnalyticsRepository.logEvent(vendor_id, 'store_button_sent', customer.id, {
        store_url: ctaStoreUrl,
      })

      console.log(`[Webhook] Workflow completed successfully for ${customer_id_phone}`)
      return { status: 'success' }
    } catch (error: any) {
      console.error('[WhatsAppWorkflow] Error:', error)
      
      // Fallback text if something breaks (AI fails, etc.)
      try {
        const fallbackUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL) + "/s/justoneguylikethat-75u3q"
        await WhatsAppService.sendWhatsAppText({
          to: customer_id_phone,
          text: "Hi! Check out our store here: " + fallbackUrl,
          phoneNumberId: phone_number_id
        })
        console.log(`[Webhook] Sent fallback message due to error.`)
      } catch (fallbackErr) {
        console.error('[WhatsAppWorkflow] Fallback also failed:', fallbackErr)
      }
      
      return { status: 'error', error: error.message }
    }
  }
}
