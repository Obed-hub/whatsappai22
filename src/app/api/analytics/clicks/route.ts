import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getSupabaseAdmin } from '@/server/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const { data: clicks } = await admin
      .from('button_clicks')
      .select('*')
      .eq('vendor_id', user.id)
      .order('clicked_at', { ascending: false })
      .limit(100)

    return NextResponse.json(clicks)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
