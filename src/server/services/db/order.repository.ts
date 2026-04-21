import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { Database } from '@/types/supabase'

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export interface CreateOrderData {
  vendor_id: string
  store_id: string
  customer_id: string
  total_amount: number
  shipping_address?: string
  customer_details: any
  payment_reference?: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
  }[]
}

export class OrderRepository {
  static async createOrder(data: CreateOrderData): Promise<Order> {
    // 1. Create the order
    const { data: order, error: orderError } = await (getSupabaseAdmin()
      .from('orders') as any)
      .insert({
        vendor_id: data.vendor_id,
        store_id: data.store_id,
        customer_id: data.customer_id,
        total_amount: data.total_amount,
        shipping_address: data.shipping_address || null,
        customer_details: data.customer_details,
        payment_reference: data.payment_reference || null,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError
    if (!order) throw new Error('Order creation failed to return data.')

    // 2. Create order items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))

    const { error: itemsError } = await (getSupabaseAdmin()
      .from('order_items') as any)
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  }

  static async getVendorStats(vendorId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Execute all queries in parallel
    const [
      revenueResult,
      totalOrdersResult,
      pendingOrdersResult,
      totalCustomersResult,
      activeConvResult
    ] = await Promise.all([
      // Total Revenue (Paid orders)
      getSupabaseAdmin()
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', vendorId)
        .eq('status', 'paid'),

      // Order Counts
      getSupabaseAdmin()
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId),

      // Pending Orders
      getSupabaseAdmin()
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('status', 'pending'),

      // Customers
      getSupabaseAdmin()
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId),

      // Active Conversations
      getSupabaseAdmin()
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
    ])

    // Check for errors
    if (revenueResult.error) throw revenueResult.error
    if (totalOrdersResult.error) throw totalOrdersResult.error
    if (pendingOrdersResult.error) throw pendingOrdersResult.error
    if (totalCustomersResult.error) throw totalCustomersResult.error
    if (activeConvResult.error) throw activeConvResult.error

    const totalRevenue = (revenueResult.data as any[])?.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0) || 0

    return {
      totalRevenue,
      totalOrders: totalOrdersResult.count || 0,
      pendingOrders: pendingOrdersResult.count || 0,
      totalCustomers: totalCustomersResult.count || 0,
      activeConversations: activeConvResult.count || 0
    }
  }

  static async getOrdersByVendor(vendorId: string, limit = 20) {
    const { data, error } = await (getSupabaseAdmin()
      .from('orders') as any)
      .select('*, order_items(*, products(*))')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  static async updateStatusByReference(reference: string, status: string) {
    const { error } = await (getSupabaseAdmin()
      .from('orders') as any)
      .update({ status })
      .eq('payment_reference', reference)

    if (error) throw error
  }
}
