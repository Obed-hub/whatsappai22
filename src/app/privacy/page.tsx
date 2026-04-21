import { Bot, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-black font-outfit mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Welcome to WhatsStore AI, a service provided by <span className="font-bold text-slate-900">Adolo</span>. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform, including our automated WhatsApp messaging services and mobile storefronts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">2. Data We Collect</h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
              <p className="text-slate-600 leading-relaxed font-medium">
                We collect information to provide a better experience for our users and their customers:
              </p>
              <ul className="list-disc list-inside space-y-3 text-slate-600 font-medium">
                <li><span className="font-bold text-slate-900">Vendor Information:</span> Name, email address, business name, and payment details when you create an account.</li>
                <li><span className="font-bold text-slate-900">Customer Information via WhatsApp:</span> Phone numbers, display names, and message content sent to your WhatsApp Business numbers for the purpose of AI automation and order fulfillment.</li>
                <li><span className="font-bold text-slate-900">Transaction Data:</span> Details of products purchased, invoice amounts, and payment status via our integration with Paystack.</li>
                <li><span className="font-bold text-slate-900">Usage Data:</span> Technical data such as IP address, browser type, and interactions with our dashboard and storefronts.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">3. How We Use Your Data</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              The data we collect is used to:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-3 text-slate-600 font-medium">
              <li>Power the AI Assistant to provide automated responses to your customers on WhatsApp.</li>
              <li>Generate and manage your mobile storefront and product catalogs.</li>
              <li>Facilitate secure payments and order tracking.</li>
              <li>Improve our AI models and platform performance.</li>
              <li>Communicate service updates and provide customer support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">4. Sharing Your Information</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              We do not sell your personal data. We share information only with trusted third-party services necessary for the operation of WhatsStore AI:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-3 text-slate-600 font-medium">
              <li><span className="font-bold text-slate-900">Meta (WhatsApp):</span> To provide messaging services and maintain your WhatsApp Business API connection.</li>
              <li><span className="font-bold text-slate-900">Supabase:</span> For secure database storage and authentication.</li>
              <li><span className="font-bold text-slate-900">Paystack:</span> To process financial transactions securely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">5. Data Deletion & Your Rights</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              In compliance with Meta&apos;s Platform Terms and global privacy regulations, you have the right to access, correct, or delete your personal data.
            </p>
            <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <h4 className="font-black text-blue-900 mb-2">How to Request Data Deletion:</h4>
              <p className="text-blue-800 text-sm font-medium">
                To request the deletion of your account or any data collected through our service, please contact us at <span className="font-black underline">support@adolo.io</span>. We will process your request within 48 hours.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">6. Security</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              We implement industry-standard security measures, including encryption and secure API calls, to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="pt-10 border-t border-slate-200">
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-4">7. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              If you have any questions about this Privacy Policy, please reach out to us at:
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
