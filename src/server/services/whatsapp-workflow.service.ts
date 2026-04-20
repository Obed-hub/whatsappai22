import { VendorRepository } from './db/vendor.repository'
import { CustomerRepository } from './db/customer.repository'
import { ConversationRepository } from './db/conversation.repository'
import { ProductRepository } from './db/product.repository'
import { WhatsAppService } from './whatsapp'
import { AIService } from './ai'

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
      // 1. Identify Vendor & Connection
      const connection = (await VendorRepository.getByPhoneNumberId(phone_number_id)) as any
      if (!connection) throw new Error(`Vendor not found for ID: ${phone_number_id}`)

      const vendor = connection.vendors
      const vendor_id = vendor.id

      // 2. Identify/Create Customer (CRM)
      const customer = await CustomerRepository.upsert(
        vendor_id, 
        customer_id_phone, 
        value?.contacts?.[0]?.profile?.name
      )

      // 3. Manage Conversation State
      const conversation = await ConversationRepository.upsert(
        vendor_id, 
        customer.id, 
        phone_number_id
      )

      // 4. Log Incoming Message
      await ConversationRepository.saveMessage(
        conversation.id, 
        vendor_id, 
        'inbound', 
        message_body
      )

      // 5. Build Automation Response
      const automation = await ConversationRepository.getAutomationSettings(vendor_id)
      if (!automation?.auto_reply_enabled) return { status: 'ok' }

      let reply_content = automation.welcome_message || "Hi! How can we help you today?"

      if (automation.ai_enabled) {
        // Build context for AI
        const products = await ProductRepository.getByVendorId(vendor_id)
        const store = await ConversationRepository.getStoreInfo(vendor_id)
        const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${store.slug}`

        reply_content = await AIService.generateReply({
          vendorName: store.store_name,
          storeUrl,
          products: products || [],
          userMessage: message_body
        })
      }

      // 6. Send Reply
      await WhatsAppService.sendMessage(
        phone_number_id,
        connection.access_token,
        customer_id_phone,
        reply_content
      )

      // 7. Log Outbound Message
      await ConversationRepository.saveMessage(
        conversation.id, 
        vendor_id, 
        'outbound', 
        reply_content
      )

      return { status: 'success' }
    } catch (error) {
      console.error('WhatsAppWorkflow Error:', error)
      throw error
    }
  }
}
