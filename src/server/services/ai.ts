import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIContext {
  vendorName: string
  storeUrl: string
  products: any[]
  userMessage: string
}

export class AIService {
  static async generateReply(context: AIContext) {
    const { storeUrl, userMessage } = context

    try {
      const systemPrompt = this.buildSystemPrompt(context)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 150, // Strict limit for WhatsApp
      })

      return response.choices[0]?.message?.content || this.getFallbackReply(storeUrl)
    } catch (error) {
      console.error('OpenAI Error:', error)
      return this.getFallbackReply(storeUrl)
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

  private static buildSystemPrompt({ vendorName, storeUrl, products }: AIContext): string {
    const recommended = products.slice(0, 3).map((p, i) => 
      `${i + 1}. ${p.name} — ₦${Number(p.price).toLocaleString()}`
    ).join('\n')

    return `You are a sales assistant for ${vendorName}. 
RULES:
- Replies MUST be short (WhatsApp-friendly, max 5-6 lines).
- No long paragraphs. No repetition.
- Sales-focused.
- ONLY use provided product data. No hallucinated inventory or prices.
- If user asks for best products or shows interest, recommend these max 3:
${recommended}
- Encourage browsing the full store at: ${storeUrl}
- Always end with store encouragement.`
  }

  private static getFallbackReply(storeUrl: string): string {
    return "Hi! Check out our latest products here: " + storeUrl
  }
}
