/**
 * StockService — Handles back-in-stock registration and bulk notifications.
 */

import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { WhatsAppService } from './whatsapp'

export class StockService {
  /**
   * Register a customer's interest to be notified when a product is back in stock.
   * Safe to call multiple times — uses UNIQUE(customer_id, product_id).
   */
  static async registerBackInStockRequest(
    vendorId: string,
    customerId: string,
    productId: string,
  ): Promise<void> {
    const db = getSupabaseAdmin() as any
    await db
      .from('back_in_stock_requests')
      .upsert(
        { vendor_id: vendorId, customer_id: customerId, product_id: productId, status: 'pending' },
        { onConflict: 'customer_id, product_id', ignoreDuplicates: true },
      )
  }

  /**
   * Notify all pending customers when a product comes back in stock.
   * Call this from your product update webhook or admin API.
   * Returns how many notifications were sent.
   */
  static async notifyBackInStockCustomers(
    productId: string,
    storeBaseUrl: string,
  ): Promise<number> {
    const db = getSupabaseAdmin() as any

    // 1. Fetch product details
    const { data: product } = await db
      .from('products')
      .select('id, name, slug, vendor_id, stores(slug)')
      .eq('id', productId)
      .single()

    if (!product) return 0

    const storeSlug = product.stores?.slug
    const productUrl = storeSlug
      ? `${storeBaseUrl}/s/${storeSlug}/product/${product.slug}`
      : storeBaseUrl

    // 2. Fetch pending notification requests
    const { data: requests } = await db
      .from('back_in_stock_requests')
      .select('id, customer_id, vendor_id')
      .eq('product_id', productId)
      .eq('status', 'pending')

    if (!requests || requests.length === 0) return 0

    // 3. Fetch vendor WhatsApp connection
    const { data: conn } = await db
      .from('whatsapp_connections')
      .select('phone_number_id, access_token')
      .eq('vendor_id', product.vendor_id)
      .single()

    if (!conn?.phone_number_id || !conn?.access_token) return 0

    let sent = 0
    const notifiedIds: string[] = []

    for (const req of requests as any[]) {
      // Fetch customer phone
      const { data: customer } = await db
        .from('customers')
        .select('phone')
        .eq('id', req.customer_id)
        .single()

      if (!customer?.phone) continue

      const text = [
        `📦 *Back in Stock!*`,
        ``,
        `*${product.name}* is now available again.`,
        `Tap below to view 👇`,
      ].join('\n')

      try {
        await WhatsAppService.sendMessage(
          conn.phone_number_id,
          conn.access_token,
          customer.phone,
          text,
        )
        await WhatsAppService.sendViewStoreButton(
          conn.phone_number_id,
          conn.access_token,
          customer.phone,
          productUrl,
        )
        notifiedIds.push(req.id)
        sent++
      } catch (err) {
        console.error(`[StockService] Failed to notify customer ${customer.phone}:`, err)
      }
    }

    // 4. Mark notified requests
    if (notifiedIds.length > 0) {
      await db
        .from('back_in_stock_requests')
        .update({ status: 'notified', notified_at: new Date().toISOString() })
        .in('id', notifiedIds)
    }

    return sent
  }

  /**
   * Ask the customer if they want a back-in-stock notification.
   */
  static buildAskNotificationMessage(productName: string): string {
    return `😔 *${productName}* is currently out of stock.\n\nWould you like me to notify you when it's back? Reply *YES* and I'll let you know! 🔔`
  }
}
