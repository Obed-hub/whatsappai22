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
}
