import { NextResponse } from 'next/server'
import { WhatsAppWebhookWorkflow } from '@/server/services/whatsapp-workflow.service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  
  return new Response(null, { status: 403 })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await WhatsAppWebhookWorkflow.processIncomingMessage(body)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Webhook Route Error:', error)
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
