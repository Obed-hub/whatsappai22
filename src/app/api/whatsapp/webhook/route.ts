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
    
    // Await processing to ensure serverless environments don't terminate prematurely,
    // but catch any internal errors so we ALWAYS return 200 to Meta.
    await WhatsAppWebhookWorkflow.processIncomingMessage(body).catch(err => {
      console.error('Workflow Error:', err)
    })
    
    return new Response('OK', { status: 200 })
  } catch (error: any) {
    console.error('Webhook Route Payload Parse Error:', error)
    // Always return 200 to Meta to prevent retry loops
    return new Response('OK', { status: 200 })
  }
}
