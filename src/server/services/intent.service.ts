/**
 * IntentService — Fast, zero-cost intent classification using keyword matching.
 * No LLM call. Runs synchronously inside the webhook hot path.
 */

export type IntentType =
  | 'greeting'
  | 'product_inquiry'
  | 'price_inquiry'
  | 'buying_intent'
  | 'complaint'
  | 'follow_up'
  | 'back_in_stock'
  | 'browsing'

export interface IntentResult {
  intent: IntentType
  /** 0-100 confidence / urgency score */
  score: number
  /** true when the customer is showing clear buying signals */
  isHotLead: boolean
  /** matched keywords for context */
  keywords: string[]
}

// ── keyword maps ────────────────────────────────────────────────────────────

const INTENT_PATTERNS: Record<IntentType, string[]> = {
  greeting: [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'howdy', 'sup', 'what\'s up', 'yo',
  ],
  price_inquiry: [
    'how much', 'price', 'cost', 'rate', 'fee', 'charge', 'naira', '₦',
    'expensive', 'cheap', 'affordable', 'discount', 'deal', 'offer', 'promo',
    'how much is', 'what is the price',
  ],
  buying_intent: [
    'i want', 'i need', 'i\'d like', 'i would like', 'let me get', 'i\'ll take',
    'add to cart', 'order', 'buy', 'purchase', 'place an order', 'i\'m interested',
    'can i get', 'send me', 'reserve', 'book',
  ],
  product_inquiry: [
    'do you have', 'available', 'in stock', 'stock', 'sizes', 'colors',
    'variants', 'tell me about', 'what is', 'describe', 'details', 'specs',
    'show me', 'what do you have',
  ],
  back_in_stock: [
    'out of stock', 'not available', 'when will', 'back in stock', 'restock',
    'notify me', 'inform me when', 'let me know when',
  ],
  complaint: [
    'bad', 'terrible', 'worst', 'broken', 'damaged', 'wrong', 'refund',
    'return', 'complain', 'problem', 'issue', 'not working', 'fake', 'scam',
  ],
  follow_up: [
    'still waiting', 'any update', 'what happened', 'did you get', 'following up',
    'checking in', 'hello again',
  ],
  browsing: [],
}

// Hot lead is a superset — price + buying signals
const HOT_LEAD_PATTERNS = [
  ...INTENT_PATTERNS.price_inquiry,
  ...INTENT_PATTERNS.buying_intent,
  'delivery', 'location', 'address', 'ship', 'courier', 'dispatch',
  'when can i get', 'how long', 'pay', 'payment', 'transfer',
]

// ── classifier ───────────────────────────────────────────────────────────────

export class IntentService {
  /**
   * Classify a customer message.
   * Returns intent type, urgency score, and whether this is a hot lead.
   */
  static classify(message: string): IntentResult {
    const lower = message.toLowerCase().trim()

    const matched: { intent: IntentType; matches: string[] }[] = []

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [IntentType, string[]][]) {
      const hits = patterns.filter(p => lower.includes(p))
      if (hits.length > 0) {
        matched.push({ intent, matches: hits })
      }
    }

    // Hot lead check (independent of intent bucket)
    const hotKeywords = HOT_LEAD_PATTERNS.filter(p => lower.includes(p))
    const isHotLead = hotKeywords.length > 0

    if (matched.length === 0) {
      return {
        intent: 'browsing',
        score: 10,
        isHotLead,
        keywords: hotKeywords,
      }
    }

    // Priority order: buying_intent > price_inquiry > product_inquiry > ...
    const priority: IntentType[] = [
      'buying_intent', 'price_inquiry', 'back_in_stock',
      'product_inquiry', 'complaint', 'follow_up', 'greeting', 'browsing',
    ]

    const best = matched.sort(
      (a, b) => priority.indexOf(a.intent) - priority.indexOf(b.intent)
    )[0]

    const score = this.computeScore(best.intent, best.matches.length, isHotLead)

    return {
      intent: best.intent,
      score,
      isHotLead,
      keywords: [...new Set([...best.matches, ...hotKeywords])],
    }
  }

  /** Generate a short, human-readable description for logging */
  static describe(result: IntentResult): string {
    return `${result.intent} (score: ${result.score}${result.isHotLead ? ', 🔥 HOT LEAD' : ''})`
  }

  private static computeScore(
    intent: IntentType,
    matchCount: number,
    isHotLead: boolean,
  ): number {
    const base: Record<IntentType, number> = {
      buying_intent: 85,
      price_inquiry: 75,
      back_in_stock: 60,
      product_inquiry: 50,
      follow_up: 40,
      complaint: 30,
      greeting: 20,
      browsing: 10,
    }
    let score = base[intent] + Math.min(matchCount * 3, 10)
    if (isHotLead) score = Math.min(score + 10, 100)
    return score
  }
}
