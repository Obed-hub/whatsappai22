/**
 * POST /api/products/[productId]/back-in-stock
 *
 * Called when a vendor updates product stock to > 0.
 * Triggers notifications to all waiting customers.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StockService } from '@/server/services/stock.service'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    const sent = await StockService.notifyBackInStockCustomers(productId, baseUrl)

    return NextResponse.json({ ok: true, notified: sent })
  } catch (err: any) {
    console.error('[back-in-stock route]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
