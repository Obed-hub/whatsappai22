import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { Database, Json } from '@/types/supabase'

export type Customer = Database['public']['Tables']['customers']['Row']

export class CustomerRepository {
  static async upsert(vendorId: string, phone: string, name?: string, consentJson?: Json): Promise<Customer> {
    const { data, error } = await (getSupabaseAdmin()
      .from('customers') as any)
      .upsert({
        vendor_id: vendorId,
        phone,
        name: name || 'Customer',
        last_seen_at: new Date().toISOString(),
        consent_json: consentJson
      }, { onConflict: 'vendor_id, phone' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getByPhone(vendorId: string, phone: string): Promise<Customer | null> {
    const { data, error } = await (getSupabaseAdmin()
      .from('customers') as any)
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async updateMessageInfo(customerId: string, message: string) {
    const supabase = getSupabaseAdmin()
    
    // First, check if first_message is already set
    const { data: customer } = await (supabase
      .from('customers') as any)
      .select('first_message')
      .eq('id', customerId)
      .single()

    const updateData: any = {
      last_message: message,
      last_seen_at: new Date().toISOString()
    }

    if (!customer?.first_message) {
      updateData.first_message = message
    }

    return await (supabase
      .from('customers') as any)
      .update(updateData)
      .eq('id', customerId)
      .select()
      .single()
  }
}
