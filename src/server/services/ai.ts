import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface AIContext {
  vendorName: string
  storeUrl: string
  products: any[]
  userMessage: string
}

export class AIService {
  static async generateSalesReply(context: AIContext) {
    const { storeUrl, userMessage } = context

    try {
      const systemPrompt = this.buildSystemPrompt(context)
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 150, // Strict limit for WhatsApp
      })

      return response.choices[0]?.message?.content || this.getFallbackReply()
    } catch (error) {
      console.error('Groq Error:', error)
      return this.getFallbackReply()
    }
  }

  static getRecommendedProducts(products: any[], userMessage: string) {
    const message = userMessage.toLowerCase()
    
    // 1. Keyword matching
    const matching = products.filter(p => 
      p.is_published && 
      (p.name.toLowerCase().includes(message) || 
       p.description?.toLowerCase().includes(message))
    )

    if (matching.length > 0) {
      return matching.slice(0, 3)
    }

    // 2. Fallback to best sellers (popularity_score)
    const popular = [...products]
      .filter(p => p.is_published)
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    
    if (popular.length > 0) {
      return popular.slice(0, 3)
    }

    // 3. Fallback to newest
    return products
      .filter(p => p.is_published)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
  }

  private static buildSystemPrompt({ vendorName, products }: AIContext): string {
    const recommended = products.slice(0, 3).map((p, i) => 
      `${i + 1}. ${p.name} — ₦${Number(p.price).toLocaleString()}`
    ).join('\n')

    const productContext = recommended 
      ? `We have these available right now:\n${recommended}`
      : `We have many great products available in our store.`

    return `You are a sales assistant for ${vendorName}.
RULES:
- Keep reply short (Maximum 5 lines).
- WhatsApp-friendly and conversational.
- No long paragraphs.
- Sales-focused and use simple English.
- Recommend browsing the store.
- Do not hallucinate products. ONLY mention products provided below.
- If no product data exists, give a general helpful reply.

${productContext}

Example format:
"Sure 👇
You can browse our available products in the store.
Tap the button below to view everything."`
  }

  private static getFallbackReply(): string {
    return "Sure 👇\nYou can browse our available products in the store.\nTap the button below to view everything."
  }
}
