import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { WhatsAppService } from '@/server/services/whatsapp'
import { getSupabaseAdmin } from '@/server/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, message, storeUrl } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 })
    }

    // Get vendor's WhatsApp connection
    const db = getSupabaseAdmin() as any
    const { data: conn } = await db
      .from('whatsapp_connections')
      .select('access_token, phone_number_id')
      .eq('vendor_id', user.id)
      .single()

    if (!conn?.access_token || !conn?.phone_number_id) {
      return NextResponse.json({ error: 'WhatsApp not connected' }, { status: 400 })
    }

    // Send the message
    await WhatsAppService.sendMessage(
      conn.phone_number_id,
      conn.access_token,
      to,
      message,
    )

    // Optionally send the store button too
    if (storeUrl) {
      await WhatsAppService.sendViewStoreButton(
        conn.phone_number_id,
        conn.access_token,
        to,
        storeUrl,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Send WhatsApp]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
