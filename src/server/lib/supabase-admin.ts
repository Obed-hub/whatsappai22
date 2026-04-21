import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

let supabase: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseAdmin = () => {
  if (supabase) return supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase Admin configuration missing (URL/Key)')
  }

  supabase = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabase
}
