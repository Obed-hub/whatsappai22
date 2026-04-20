import { NextResponse } from 'next/server'
import { VendorRepository } from '@/server/services/db/vendor.repository'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text()
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET!)
    .update(body)
    .digest('hex')

  const signature = request.headers.get('x-paystack-signature')

  if (hash !== signature) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === 'charge.success') {
    const { vendor_id, type, order_id } = event.data.metadata

    try {
      if (type === 'order') {
        // Handle Customer Order Payment
        const { OrderRepository } = await import('@/server/services/db/order.repository')
        await OrderRepository.updateStatusByReference(event.data.reference, 'paid')
      } else {
        // Handle Vendor Subscription Upgrade
        const plan = event.data.amount >= 500000 ? 'pro' : 'basic'
        await VendorRepository.updatePlan(vendor_id, plan)
      }
      
      return NextResponse.json({ status: 'success' })
    } catch (error) {
      console.error('Payment processing error:', error)
      return NextResponse.json({ status: 'error' }, { status: 500 })
    }
  }

  return NextResponse.json({ status: 'ignored' })
}
