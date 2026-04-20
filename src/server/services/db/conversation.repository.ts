import { supabaseAdmin } from '@/server/lib/supabase-admin'
import { Database } from '@/types/supabase'

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export class ConversationRepository {
  static async upsert(vendorId: string, customerId: string, phoneNumberId: string): Promise<Conversation> {
    const { data, error } = await (supabaseAdmin
      .from('conversations') as any)
      .upsert({
        vendor_id: vendorId,
        customer_id: customerId,
        phone_number_id: phoneNumberId,
        last_user_message_at: new Date().toISOString(),
        window_open_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'vendor_id, customer_id' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async saveMessage(conversationId: string, vendorId: string, direction: 'inbound' | 'outbound', content: string) {
    const { error } = await (supabaseAdmin
      .from('messages') as any)
      .insert({
        conversation_id: conversationId,
        vendor_id: vendorId,
        direction,
        content
      })

    if (error) throw error
  }

  static async getAutomationSettings(vendorId: string) {
    const { data, error } = await (supabaseAdmin
      .from('automations') as any)
      .select('*')
      .eq('vendor_id', vendorId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async getStoreInfo(vendorId: string) {
    const { data, error } = await (supabaseAdmin
      .from('stores') as any)
      .select('slug, name')
      .eq('vendor_id', vendorId)
      .single()

    if (error) throw error
    return data
  }
}
