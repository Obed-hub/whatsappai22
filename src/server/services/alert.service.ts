/**
 * AlertService — Dispatches WhatsApp alerts to vendors for hot leads,
 * demand spikes, and unanswered customers.
 * Alerts go to the VENDOR's own WhatsApp number, not the customer's.
 */

import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { WhatsAppService } from './whatsapp'

export type AlertType = 'hot_lead' | 'demand_spike' | 'unanswered_customers'

export class AlertService {
  /**
   * Send a hot lead alert to the vendor's WhatsApp.
   * Triggered immediately when buying intent is detected.
   */
  static async sendHotLeadAlert(params: {
    phoneNumberId: string
    accessToken: string
    vendorPhone: string
    customerPhone: string
    productName?: string
    customerMessage: string
  }): Promise<void> {
    const { phoneNumberId, accessToken, vendorPhone, customerPhone, productName, customerMessage } = params

    const alertText = [
      `🔥 *Hot Lead Alert*`,
      ``,
      `Customer: ${customerPhone}`,
      productName ? `Interested in: ${productName}` : null,
      `Message: "${customerMessage.slice(0, 80)}${customerMessage.length > 80 ? '...' : ''}"`,
      ``,
      `Reply *CHAT* to follow up now`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await WhatsAppService.sendMessage(phoneNumberId, accessToken, vendorPhone, alertText)
      await this.logAlert({ vendorPhone, type: 'hot_lead', message: alertText, customerPhone })
    } catch (err) {
      console.error('[AlertService] Hot lead alert failed:', err)
    }
  }

  /**
   * Send a demand spike alert when the same product is asked about 5+ times today.
   */
  static async sendDemandAlert(params: {
    phoneNumberId: string
    accessToken: string
    vendorPhone: string
    vendorId: string
    productName: string
    count: number
  }): Promise<void> {
    const { phoneNumberId, accessToken, vendorPhone, vendorId, productName, count } = params

    // Throttle: only once per hour per product
    const db = getSupabaseAdmin() as any
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentAlerts } = await db
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('type', 'demand_spike')
      .gte('created_at', oneHourAgo)

    if ((recentAlerts ?? 0) > 0) return

    const alertText = [
      `📈 *Demand Alert*`,
      ``,
      `${count} customers asked about "${productName}" today.`,
      `Consider updating your stock or adding a promotion!`,
    ].join('\n')

    try {
      await WhatsAppService.sendMessage(phoneNumberId, accessToken, vendorPhone, alertText)
      await this.logAlert({ vendorId, type: 'demand_spike', message: alertText })
    } catch (err) {
      console.error('[AlertService] Demand alert failed:', err)
    }
  }

  /**
   * Alert vendor that multiple customers are waiting for a reply.
   */
  static async sendUnansweredAlert(params: {
    phoneNumberId: string
    accessToken: string
    vendorPhone: string
    vendorId: string
    count: number
  }): Promise<void> {
    const { phoneNumberId, accessToken, vendorPhone, vendorId, count } = params

    // Throttle: only once per 2 hours
    const db = getSupabaseAdmin() as any
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const { count: recentAlerts } = await db
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('type', 'unanswered_customers')
      .gte('created_at', twoHoursAgo)

    if ((recentAlerts ?? 0) > 0) return

    const alertText = [
      `⚠️ *Attention Needed*`,
      ``,
      `${count} customer${count > 1 ? 's are' : ' is'} waiting for your reply.`,
      `Open WhatsStore to respond now.`,
    ].join('\n')

    try {
      await WhatsAppService.sendMessage(phoneNumberId, accessToken, vendorPhone, alertText)
      await this.logAlert({ vendorId, type: 'unanswered_customers', message: alertText })
    } catch (err) {
      console.error('[AlertService] Unanswered alert failed:', err)
    }
  }

  /**
   * Check if a product has crossed the demand spike threshold today (default: 5).
   */
  static async getDemandCount(vendorId: string, productName: string, threshold = 5): Promise<number> {
    const db = getSupabaseAdmin() as any
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await db
      .from('interests')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .ilike('raw_message', `%${productName}%`)
      .gte('created_at', today.toISOString())

    const total = count ?? 0
    return total >= threshold ? total : 0
  }

  private static async logAlert(params: {
    vendorPhone?: string
    vendorId?: string
    type: AlertType
    message: string
    customerPhone?: string
  }): Promise<void> {
    try {
      const db = getSupabaseAdmin() as any

      let vendorId = params.vendorId
      if (!vendorId && params.vendorPhone) {
        const { data } = await db
          .from('vendors')
          .select('id')
          .eq('phone', params.vendorPhone)
          .single()
        vendorId = data?.id
      }

      if (!vendorId) return

      await db.from('alerts').insert({
        vendor_id: vendorId,
        type: params.type,
        message: params.message,
        sent_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[AlertService] logAlert failed:', err)
    }
  }
}
