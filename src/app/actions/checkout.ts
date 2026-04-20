'use server'

import { createClient } from '@/utils/supabase/server'
import { OrderRepository, type Order } from '@/server/services/db/order.repository'
import { CustomerRepository } from '@/server/services/db/customer.repository'
import { PaystackService } from '@/server/services/paystack'
import crypto from 'crypto'

interface CheckoutData {
  storeId: string
  vendorId: string
  slug: string
  items: any[]
  total: number
  customer: {
    name: string
    phone: string
    address: string
  }
}

export async function processCheckout(data: CheckoutData) {
  const supabase = await createClient()

  // 1. Upsert Customer (using Repository for type safety)
  const customerRecord = await CustomerRepository.upsert(
    data.vendorId,
    data.customer.phone,
    data.customer.name
  )

  // 2. Create Order in DB (Pending)
  const paymentRef = `order_${crypto.randomUUID().split('-')[0]}`
  
  const order = await OrderRepository.createOrder({
    vendor_id: data.vendorId,
    store_id: data.storeId,
    customer_id: customerRecord.id,
    total_amount: data.total,
    shipping_address: data.customer.address,
    payment_reference: paymentRef,
    customer_details: {
      name: data.customer.name,
      phone: data.customer.phone
    },
    items: data.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }))
  })

  // 4. Initialize Paystack
  const payment = await PaystackService.initializeTransaction(
    `${data.customer.phone}@whatsstore.ai`, 
    data.total,
    data.vendorId,
    {
      order_id: order.id,
      type: 'order',
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/s/${data.slug}/checkout/success`
    }
  )

  return {
    authorization_url: payment.authorization_url,
    reference: paymentRef
  }
}
