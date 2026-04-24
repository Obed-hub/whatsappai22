/**
 * FollowUpService — Schedules, cancels, and checks follow-up eligibility.
 * Max 2 follow-ups per conversation (soft @ 2min, urgent @ 10min).
 * Reminders: 1h and 24h after interest detected.
 */

import { getSupabaseAdmin } from '@/server/lib/supabase-admin'

export type FollowUpType = 'soft' | 'urgent' | 'reminder_1h' | 'reminder_24h'

export interface PendingFollowUp {
  id: string
  vendor_id: string
  customer_id: string
  conversation_id: string | null
  type: FollowUpType
  scheduled_at: string
}

const FOLLOWUP_MESSAGES: Record<FollowUpType, string> = {
  soft: "Let me know if you want more details 👍",
  urgent: "This item is selling fast 👀 Want me to reserve one for you?",
  reminder_1h: "Hey! Still interested? Let us know — we're happy to help 😊",
  reminder_24h: "Still thinking about it? The item is still available for you 👌 Tap below to view our store.",
}

export class FollowUpService {
  /**
   * Schedule soft (2min) + urgent (10min) follow-ups for a conversation.
   * Skips if follow-ups already pending for this customer+vendor pair.
   */
  static async scheduleFollowUps(
    vendorId: string,
    customerId: string,
    conversationId: string,
  ): Promise<void> {
    const supabase = getSupabaseAdmin()
    const db = supabase as any
    const now = Date.now()

    // Guard: don't schedule if already pending
    const { count } = await db
      .from('followups')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('customer_id', customerId)
      .is('sent_at', null)
      .is('cancelled_at', null)

    if ((count ?? 0) > 0) return

    await db.from('followups').insert([
      {
        vendor_id: vendorId,
        customer_id: customerId,
        conversation_id: conversationId,
        type: 'soft',
        scheduled_at: new Date(now + 2 * 60 * 1000).toISOString(),
      },
      {
        vendor_id: vendorId,
        customer_id: customerId,
        conversation_id: conversationId,
        type: 'urgent',
        scheduled_at: new Date(now + 10 * 60 * 1000).toISOString(),
      },
    ])
  }

  /**
   * Schedule hour/day reminders when buying intent is detected.
   */
  static async scheduleReminders(
    vendorId: string,
    customerId: string,
    conversationId: string,
  ): Promise<void> {
    const supabase = getSupabaseAdmin()
    const db = supabase as any
    const now = Date.now()

    const { data: existing } = await db
      .from('followups')
      .select('type')
      .eq('vendor_id', vendorId)
      .eq('customer_id', customerId)
      .in('type', ['reminder_1h', 'reminder_24h'])
      .is('cancelled_at', null)

    const existingTypes = new Set(((existing as any[]) || []).map((r: any) => r.type))
    const toInsert: any[] = []

    if (!existingTypes.has('reminder_1h')) {
      toInsert.push({
        vendor_id: vendorId,
        customer_id: customerId,
        conversation_id: conversationId,
        type: 'reminder_1h',
        scheduled_at: new Date(now + 60 * 60 * 1000).toISOString(),
      })
    }

    if (!existingTypes.has('reminder_24h')) {
      toInsert.push({
        vendor_id: vendorId,
        customer_id: customerId,
        conversation_id: conversationId,
        type: 'reminder_24h',
        scheduled_at: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    if (toInsert.length > 0) {
      await db.from('followups').insert(toInsert)
    }
  }

  /**
   * Cancel all pending follow-ups for a customer+vendor pair.
   * Call this the moment a customer sends any new message.
   */
  static async cancelPendingFollowUps(vendorId: string, customerId: string): Promise<void> {
    const db = getSupabaseAdmin() as any
    await db
      .from('followups')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('vendor_id', vendorId)
      .eq('customer_id', customerId)
      .is('sent_at', null)
      .is('cancelled_at', null)
  }

  /**
   * Fetch all follow-ups that are due and not yet sent or cancelled.
   * Used by the cron job.
   */
  static async getDueFollowUps(): Promise<PendingFollowUp[]> {
    const db = getSupabaseAdmin() as any
    const { data, error } = await db
      .from('followups')
      .select('id, vendor_id, customer_id, conversation_id, type, scheduled_at')
      .lte('scheduled_at', new Date().toISOString())
      .is('sent_at', null)
      .is('cancelled_at', null)
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (error) throw error
    return (data || []) as PendingFollowUp[]
  }

  /**
   * Mark a follow-up as sent.
   */
  static async markSent(followUpId: string): Promise<void> {
    const db = getSupabaseAdmin() as any
    await db
      .from('followups')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', followUpId)
  }

  /** Get the WhatsApp message text for a follow-up type. */
  static getMessage(type: FollowUpType): string {
    return FOLLOWUP_MESSAGES[type]
  }
}
