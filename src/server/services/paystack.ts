export class PaystackService {
  private static readonly API_URL = 'https://api.paystack.co'

  private static get headers() {
    return {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    }
  }

  static async initializeTransaction(email: string, amount: number, vendorId: string, metadata: any = {}) {
    try {
      const response = await fetch(`${this.API_URL}/transaction/initialize`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack in kobo
          metadata: {
            vendor_id: vendorId,
            ...metadata
          },
          callback_url: metadata.callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing/success`,
        }),
      })

      const result = await response.json()
      if (!result.status) throw new Error(result.message)
      
      return result.data
    } catch (error) {
      console.error('Paystack init error:', error)
      throw error
    }
  }

  static async verifyTransaction(reference: string) {
    try {
      const response = await fetch(`${this.API_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: this.headers,
      })

      const result = await response.json()
      if (!result.status) throw new Error(result.message)
      
      return result.data
    } catch (error) {
      console.error('Paystack verify error:', error)
      throw error
    }
  }
}
