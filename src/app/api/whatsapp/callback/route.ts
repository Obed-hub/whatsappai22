import { NextRequest, NextResponse } from 'next/server'
import { completeWhatsAppConnection } from '@/app/actions/whatsapp'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  console.log('[WhatsAppCallback] Received callback from Meta')
  
  if (error) {
    console.error('[WhatsAppCallback] Error from Meta:', error)
    return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    console.error('[WhatsAppCallback] No code provided in callback')
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code_provided', request.url))
  }

  try {
    console.log('[WhatsAppCallback] Processing connection for code:', code.substring(0, 10) + '...')
    const result = await completeWhatsAppConnection(code)

    if (result.success) {
      console.log('[WhatsAppCallback] Connection successful')
      return NextResponse.redirect(new URL('/dashboard/settings?success=whatsapp_connected', request.url))
    } else {
      console.error('[WhatsAppCallback] Connection failed:', result.error)
      return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(result.error || 'Failed to connect')}`, request.url))
    }
  } catch (err: any) {
    console.error('[WhatsAppCallback] Unexpected error:', err)
    return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(err.message)}`, request.url))
  }
}
