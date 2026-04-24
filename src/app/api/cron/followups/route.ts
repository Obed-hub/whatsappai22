/**
 * GET /api/cron/followups
 *
 * Processes all due follow-up messages.
 * Secured with CRON_SECRET header.
 *
 * Vercel cron config (vercel.json):
 * { "crons": [{ "path": "/api/cron/followups", "schedule": "* * * * *" }] }
 */

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { FollowUpService } from '@/server/services/followup.service'
import { AlertService } from '@/server/services/alert.service'
import { WhatsAppService } from '@/server/services/whatsapp'
import { AnalyticsRepository } from '@/server/services/db/analytics.repository'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { processed: 0, sent: 0, failed: 0, skipped: 0 }

  try {
    // ── 1. Process due follow-ups ─────────────────────────────────────────
    const dueFollowUps = await FollowUpService.getDueFollowUps()
    results.processed = dueFollowUps.length

    const db = getSupabaseAdmin() as any

    for (const followUp of dueFollowUps) {
      try {
        // Get vendor WhatsApp connection
        const { data: conn } = await db
          .from('whatsapp_connections')
          .select('phone_number_id, access_token')
          .eq('vendor_id', followUp.vendor_id)
          .single()

        if (!conn?.phone_number_id || !conn?.access_token) {
          results.skipped++
          continue
        }

        // Get customer phone
        const { data: customer } = await db
          .from('customers')
          .select('phone')
          .eq('id', followUp.customer_id)
          .single()

        if (!customer?.phone) {
          results.skipped++
          continue
        }

        // Check 24h window — skip if expired
        if (followUp.conversation_id) {
          const { data: conv } = await db
            .from('conversations')
            .select('window_open_until')
            .eq('id', followUp.conversation_id)
            .single()

          if (conv?.window_open_until && new Date(conv.window_open_until) < new Date()) {
            await db
              .from('followups')
              .update({ cancelled_at: new Date().toISOString() })
              .eq('id', followUp.id)
            results.skipped++
            continue
          }
        }

        // Send follow-up message
        const message = FollowUpService.getMessage(followUp.type)
        await WhatsAppService.sendMessage(
          conn.phone_number_id,
          conn.access_token,
          customer.phone,
          message,
        )

        // Mark sent + log
        await FollowUpService.markSent(followUp.id)
        await AnalyticsRepository.logEvent(
          followUp.vendor_id,
          'followup_sent',
          followUp.customer_id,
          { type: followUp.type, followup_id: followUp.id },
        )

        results.sent++
      } catch (err) {
        console.error(`[Cron] Failed to send follow-up ${followUp.id}:`, err)
        results.failed++
      }
    }

    // ── 2. Check for unanswered customers ─────────────────────────────────
    await checkUnansweredCustomers(db)

    return NextResponse.json({ ok: true, ...results })
  } catch (err: any) {
    console.error('[Cron] followups job failed:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

/**
 * Finds vendors with 3+ unanswered customers and sends a WhatsApp alert.
 */
async function checkUnansweredCustomers(db: any) {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const { data: stalledConvos } = await db
      .from('conversations')
      .select('vendor_id')
      .lte('last_user_message_at', fifteenMinutesAgo)
      .gte('window_open_until', new Date().toISOString())

    if (!stalledConvos || stalledConvos.length === 0) return

    // Group by vendor
    const countByVendor = (stalledConvos as any[]).reduce<Record<string, number>>((acc, c) => {
      acc[c.vendor_id] = (acc[c.vendor_id] ?? 0) + 1
      return acc
    }, {})

    for (const [vendorId, count] of Object.entries(countByVendor)) {
      if (count < 3) continue

      const { data: vendor } = await db
        .from('vendors')
        .select('phone')
        .eq('id', vendorId)
        .single()

      const { data: conn } = await db
        .from('whatsapp_connections')
        .select('phone_number_id, access_token')
        .eq('vendor_id', vendorId)
        .single()

      if (!vendor?.phone || !conn?.phone_number_id || !conn?.access_token) continue

      await AlertService.sendUnansweredAlert({
        phoneNumberId: conn.phone_number_id,
        accessToken: conn.access_token,
        vendorPhone: vendor.phone,
        vendorId,
        count,
      })
    }
  } catch (err) {
    console.error('[Cron] checkUnansweredCustomers failed:', err)
  }
}
