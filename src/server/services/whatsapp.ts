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
    
    if (!appId || !appSecret) {
      throw new Error('Meta App credentials missing')
    }

    const url = `${this.baseUrl}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to exchange code for token')
    }
    
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
}
