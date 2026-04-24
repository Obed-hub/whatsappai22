import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { AnalyticsRepository } from '@/server/services/db/analytics.repository'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const overview = await AnalyticsRepository.getVendorOverview(user.id)
    return NextResponse.json(overview)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
