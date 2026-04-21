import { Bot, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfService() {
  const lastUpdated = "April 21, 2026"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Simple Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black font-outfit tracking-tight">WhatsStore<span className="text-blue-600">AI</span></span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black font-outfit mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              By accessing or using WhatsStore AI, a service provided by <span className="font-bold text-slate-900">Adolo</span> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              WhatsStore AI provides an AI-powered automation platform for WhatsApp Business users, including automated customer responses, mobile storefronts, and payment processing integrations (the &quot;Service&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">3. User Responsibilities</h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm text-slate-600 font-medium">
              <p>As a user of WhatsStore AI, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-3">
                <li>You have the legal authority to connect your WhatsApp Business account.</li>
                <li>You will comply with all <span className="font-bold text-slate-900">Meta Business & WhatsApp Commerce Policies</span>.</li>
                <li>You will not use the service for spam, harassment, or illegal activities.</li>
                <li>You are responsible for the accuracy of the product information and pricing provided in your storefront.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">4. AI Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              WhatsStore AI utilizes artificial intelligence to generate automated responses. While we strive for accuracy, AI can occasionally generate incorrect or incomplete information. 
            </p>
            <div className="mt-4 p-5 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-orange-900 text-sm font-bold leading-relaxed">
                <span className="uppercase">Notice:</span> You are responsible for monitoring your AI-customer interactions. WhatsStore AI is not liable for any business losses, customer dissatisfaction, or legal issues resulting from AI-generated content.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">5. Payments & Subscriptions</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Service fees are billed monthly or annually as per your selected plan. All payments are processed through <span className="font-bold text-slate-900">Paystack</span>. 
            </p>
            <ul className="list-disc list-inside mt-4 space-y-3 text-slate-600 font-medium">
              <li>Fees are non-refundable except where required by law.</li>
              <li>You are responsible for all transaction fees associated with customer orders processed through Paystack.</li>
              <li>Failure to pay subscription fees may result in immediate suspension of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">6. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              WhatsStore AI and its original content, features, and functionality are and will remain the exclusive property of Adolo and its licensors. You retain ownership of the content (product images, descriptions) you upload to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              To the maximum extent permitted by law, Adolo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">8. Termination</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including a breach of these Terms.
            </p>
          </section>

          <section className="pt-10 border-t border-slate-200">
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">9. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Questions regarding these Terms should be sent to:
            </p>
            <p className="mt-4 font-black text-slate-900">Email: legal@adolo.io</p>
          </section>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">© 2026 Adolo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
