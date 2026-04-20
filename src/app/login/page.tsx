'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LayoutGrid, Store, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Left side: Branding & Features */}
      <div className="w-full md:w-1/2 bg-blue-600 p-8 md:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-2xl font-bold font-outfit mb-12">
            <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            WhatsStore AI
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-outfit leading-tight mb-8">
            The Future of <br />
            <span className="text-blue-200">Social Commerce</span>
          </h1>

          <div className="space-y-6">
            <FeatureItem 
              icon={<Store className="w-5 h-5" />}
              title="Automated Web Store"
              description="A mobile storefront that opens seamlessly inside WhatsApp."
            />
            <FeatureItem 
              icon={<Sparkles className="w-5 h-5" />}
              title="AI Sales Assistant"
              description="Automate replies and close sales with Groq-powered AI."
            />
            <FeatureItem 
              icon={<MessageSquare className="w-5 h-5" />}
              title="Unified CRM"
              description="Track every customer and conversation at scale."
            />
          </div>
        </div>

        <div className="mt-12 text-sm text-blue-100 font-medium">
          &copy; 2026 WhatsStore AI. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold font-outfit text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8">Sign in with your email to access your dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Continue with Email'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${message.includes('Check') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse-slow">
        {icon}
      </div>
      <div>
        <h3 className="font-bold font-outfit text-lg">{title}</h3>
        <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
