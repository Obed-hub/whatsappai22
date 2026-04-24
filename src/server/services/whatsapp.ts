export class WhatsAppService {
  private static baseUrl = 'https://graph.facebook.com/v19.0'

  static async sendMessage(phoneNumberId: string, accessToken: string, to: string, message: string, retries = 3) {
    const url = `${this.baseUrl}/${phoneNumberId}/messages`
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: { body: message },
          }),
        })

        const data = await response.json()
        if (response.ok) return data

        if (response.status === 429 && i < retries - 1) {
          // Rate limit - wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          continue
        }

        throw new Error(data.error?.message || 'Failed to send WhatsApp message')
      } catch (error) {
        if (i === retries - 1) throw error
        console.warn(`WhatsApp retry ${i + 1} failed:`, error)
      }
    }
  }

  static async sendTemplate(phoneNumberId: string, accessToken: string, to: string, templateName: string, languageCode: string = 'en_US') {
    const url = `${this.baseUrl}/${phoneNumberId}/messages`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      }),
    })

    return await response.json()
  }

  static async exchangeCodeForToken(code: string) {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID
    const appSecret = process.env.META_APP_SECRET
    const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/whatsapp/callback'
    
    if (!appId || !appSecret) {
      throw new Error('Meta App credentials missing')
    }

    console.log('[WhatsAppService] Exchanging code for token...')
    console.log('[WhatsAppService] Code:', code.substring(0, 10) + '...')
    console.log('[WhatsAppService] Redirect URI:', redirectUri)

    const url = `${this.baseUrl}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${redirectUri}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[WhatsAppService] Token exchange failed:', data.error)
      throw new Error(data.error?.message || 'Failed to exchange code for token')
    }
    
    console.log('[WhatsAppService] Token exchange successful')
    return data.access_token
  }

  static async getWabaAccounts(accessToken: string) {
    const url = `${this.baseUrl}/me/whatsapp_business_accounts`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch WABA accounts')
    }
    
    return data.data // Returns array of accounts
  }

  static async getPhoneNumbers(wabaId: string, accessToken: string) {
    const url = `${this.baseUrl}/${wabaId}/phone_numbers`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch phone numbers')
    }
    
    return data.data // Returns array of phone numbers
  }

  static async sendViewStoreButton(phoneNumberId: string, accessToken: string, to: string, storeUrl: string, text: string = 'View Store') {
    const url = `${this.baseUrl}/${phoneNumberId}/messages`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'cta_url',
            body: {
              text: "Tap the button below to browse our full catalog and shop online! 🛍️"
            },
            action: {
              name: "cta_url",
              parameters: {
                display_text: text,
                url: storeUrl
              }
            }
          }
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        // Log error but don't throw if it's just a button failure (maybe outside 24h window)
        console.error('WhatsApp Button Error:', data.error)
        return null
      }
      return data
    } catch (error) {
      console.error('WhatsApp Button Fetch Error:', error)
      return null
    }
  }
}
