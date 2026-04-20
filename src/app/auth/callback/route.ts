import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Ensure vendor profile exists
        const { data: vendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!vendor) {
          await (supabase.from('vendors') as any).insert({
            id: user.id,
            email: user.email,
            business_name: user.email?.split('@')[0] || 'My Store'
          })
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
