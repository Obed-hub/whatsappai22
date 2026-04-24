import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { AnalyticsRepository } from '@/server/services/db/analytics.repository'

export async function GET(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { vendorSlug } = await context.params
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('to')
  const customerId = searchParams.get('customer')

  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const db = getSupabaseAdmin() as any

    // Resolve vendor by slug to get ID
    const { data: store } = await db
      .from('stores')
      .select('vendor_id')
      .eq('slug', vendorSlug)
      .single()

    if (store && customerId) {
      // Log the click
      await AnalyticsRepository.logButtonClick(
        store.vendor_id,
        customerId,
        'view_store',
        targetUrl
      )
      
      // Also log as an analytics event
      await AnalyticsRepository.logEvent(
        store.vendor_id,
        'store_button_clicked',
        customerId,
        { target_url: targetUrl }
      )
    }

    // Redirect to the actual store URL
    // Ensure it's an absolute URL or prepend the app base URL
    const finalUrl = targetUrl.startsWith('http') 
      ? targetUrl 
      : `${process.env.NEXT_PUBLIC_APP_URL}${targetUrl}`

    return NextResponse.redirect(finalUrl)
  } catch (error) {
    console.error('Redirect Tracking Error:', error)
    return NextResponse.redirect(new URL(targetUrl, request.url))
  }
}
