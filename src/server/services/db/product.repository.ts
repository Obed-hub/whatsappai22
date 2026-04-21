import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { Database } from '@/types/supabase'

export type Product = Database['public']['Tables']['products']['Row']

export class ProductRepository {
  static async getByVendorId(vendorId: string, publishedOnly = true): Promise<Product[]> {
    let query = (getSupabaseAdmin()
      .from('products') as any)
      .select('*')
      .eq('vendor_id', vendorId)

    if (publishedOnly) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await (getSupabaseAdmin()
      .from('products') as any)
      .select('*, stores(*)')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async updateStock(id: string, newStock: number) {
    const { error } = await (getSupabaseAdmin()
      .from('products') as any)
      .update({ stock: newStock })
      .eq('id', id)

    if (error) throw error
  }
}
