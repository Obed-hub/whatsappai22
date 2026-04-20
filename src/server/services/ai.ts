import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface AIContext {
  vendorName: string
  storeUrl: string
  products: any[]
  faqs?: string
  userMessage: string
}

export class AIService {
  static async generateReply(context: AIContext) {
    const { storeUrl, userMessage } = context

    try {
      const systemPrompt = this.buildSystemPrompt(context)
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 300,
      })

      return chatCompletion.choices[0]?.message?.content || this.getFallbackReply(storeUrl)
    } catch (error) {
      console.error('Groq AI Error:', error)
      return this.getFallbackReply(storeUrl)
    }
  }

  private static buildSystemPrompt({ vendorName, storeUrl, products }: AIContext): string {
    const productsContext = products.slice(0, 5).map(p => 
      `- ${p.name}: ₦${p.price.toLocaleString()} (${p.stock > 0 ? 'In Stock' : 'Out of Stock'}). URL: ${storeUrl}/product/${p.slug}`
    ).join('\n')

    return `You are a professional, high-converting AI Sales Assistant for ${vendorName}. 
Your goal is to guide customers to browse the store, add items to their cart, and complete their checkout on the web.

STRATEGY:
1. Be enthusiastic and helpful. 
2. If they like a product, tell them: "You can add this to your cart and checkout here: ${storeUrl}"
3. Always include the Store URL (${storeUrl}) in your reply when discussing products.
4. If they ask how to order, explain they should use the "Chat to Order" button or "Checkout" on the website.

RULES:
1. ONLY use the provided product data.
2. Recommend specific products from the list below based on their query.
3. Keep replies SHORT (max 3 sentences), friendly, and extremely sales-focused.
4. If a product is out of stock, apologize and suggest an alternative or the store link.
5. Use emojis appropriately for a modern WhatsApp vibe. 🚀

AVAILABLE PRODUCTS:
${productsContext}

STORE URL: ${storeUrl}`
  }

  private static getFallbackReply(storeUrl: string): string {
    return "Hi! Please check our store for available products and pricing: " + storeUrl
  }
}
