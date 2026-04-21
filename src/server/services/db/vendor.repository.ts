import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { Database } from '@/types/supabase'

export type Vendor = Database['public']['Tables']['vendors']['Row']

export class VendorRepository {
  static async getById(id: string): Promise<Vendor | null> {
    const { data, error } = await (getSupabaseAdmin()
      .from('vendors') as any)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  static async getByPhoneNumberId(phoneNumberId: string) {
    const { data, error } = await (getSupabaseAdmin()
      .from('whatsapp_connections') as any)
      .select('*, vendors(*)')
      .eq('phone_number_id', phoneNumberId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async updatePlan(id: string, plan: string) {
    const { error } = await (getSupabaseAdmin()
      .from('vendors') as any)
      .update({ plan })
      .eq('id', id)

    if (error) throw error
  }
}
