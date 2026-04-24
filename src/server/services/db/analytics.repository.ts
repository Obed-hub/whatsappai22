import { getSupabaseAdmin } from '@/server/lib/supabase-admin'

export class AnalyticsRepository {
  static async getVendorOverview(vendorId: string) {
    const supabase = getSupabaseAdmin()

    // 1. Chats Today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: chatsToday } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .gte('created_at', today.toISOString())

    // 2. Store Clicks
    const { count: storeClicks } = await supabase
      .from('button_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)

    // 3. AI Replies Sent
    const { count: aiReplies } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('event_type', 'outbound_ai_reply')

    // 4. Products Recommended
    const { count: productsRecommended } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('event_type', 'products_recommended')

    // 5. Recent Leads (Customers)
    const { data: recentLeads } = await supabase
      .from('customers')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('last_seen_at', { ascending: false })
      .limit(5)

    // 6. Top Clicked Products (via analytics events or button clicks metadata)
    const { data: topProducts } = await supabase
      .from('products')
      .select('name, price, popularity_score')
      .eq('vendor_id', vendorId)
      .order('popularity_score', { ascending: false })
      .limit(5)

    return {
      chatsToday: chatsToday || 0,
      storeClicks: storeClicks || 0,
      aiReplies: aiReplies || 0,
      productsRecommended: productsRecommended || 0,
      recentLeads: recentLeads || [],
      topProducts: topProducts || [],
      clickRate: aiReplies ? Math.round(((storeClicks || 0) / aiReplies) * 100) : 0
    }
  }

  static async logEvent(vendorId: string, eventType: string, customerId?: string, metadata: any = {}) {
    const db = getSupabaseAdmin() as any
    await db.from('analytics_events').insert({
      vendor_id: vendorId,
      event_type: eventType,
      customer_id: customerId,
      metadata_json: metadata
    })
  }

  static async logButtonClick(vendorId: string, customerId: string, buttonType: string, targetUrl: string) {
    const db = getSupabaseAdmin() as any
    await db.from('button_clicks').insert({
      vendor_id: vendorId,
      customer_id: customerId,
      button_type: buttonType,
      target_url: targetUrl
    })
  }
}
