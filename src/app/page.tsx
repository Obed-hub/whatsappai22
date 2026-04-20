'use client'

import { 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-4 bg-white/80 backdrop-blur-lg border-b border-slate-200' : 'py-6 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black font-outfit tracking-tight text-slate-900">WhatsStore<span className="text-blue-600">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-900 hover:text-blue-600 px-4 py-2 transition-colors">
              Login
            </Link>
            <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold mb-8 animate-pulse-slow">
            <Zap className="w-3.5 h-3.5 fill-blue-600" />
            THE FUTURE OF WHATSAPP COMMERCE
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-outfit text-slate-900 max-w-4xl mx-auto leading-[1.1] mb-8 tracking-tighter">
            Your WhatsApp Store, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Powered by AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Automate sales, manage inventory, and accept payments seamlessly on WhatsApp. The employee that never sleeps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/s/demo" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all">
              Explore Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-20 flex flex-col items-center gap-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Trusted by 2,000+ local vendors</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
              ))}
              <span className="ml-2 text-sm font-black text-slate-900">4.9/5 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Capabilities</h2>
            <p className="text-3xl md:text-5xl font-black font-outfit text-slate-900">Built for high-growth commerce</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
                title: "AI Sales Assistant",
                desc: "Automatically responds to product queries, recommends items, and closes sales 24/7.",
                color: "bg-blue-50"
              },
              {
                icon: <ShoppingBag className="w-8 h-8 text-emerald-600" />,
                title: "Premium Storefronts",
                desc: "High-speed, mobile-optimized catalogs that load instantly within any WhatsApp chat.",
                color: "bg-emerald-50"
              },
              {
                icon: <Zap className="w-8 h-8 text-orange-600" />,
                title: "Direct Checkout",
                desc: "Send digital invoices and accept payments via Paystack without leaving the browser.",
                color: "bg-orange-50"
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all group">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black font-outfit text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop / Secondary Highlight */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black font-outfit mb-8 leading-[1.2]">
              The Dashboard that <br/> <span className="text-blue-500">Drives Growth</span>
            </h2>
            <div className="space-y-6">
              {[
                "Track revenue and orders in real-time",
                "Monitor AI-to-customer chat history",
                "Manage inventory with zero maintenance",
                "Deep customer behavioral insights"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-slate-300 font-bold">{text}</span>
                </div>
              ))}
            </div>
            <Link href="/login" className="mt-12 inline-flex items-center gap-2 text-white font-black group">
              Explore Dashboard Logic <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-4 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="px-3 py-1 bg-slate-700/50 rounded-lg text-[10px] font-black text-slate-400">ANALYTICS ENGINE</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-24 bg-slate-900/50 rounded-2xl border border-slate-700 p-4">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Sales</p>
                  <p className="text-2xl font-black font-outfit">₦2.4M</p>
                </div>
                <div className="h-24 bg-blue-600/10 rounded-2xl border border-blue-600/20 p-4">
                  <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Conversion</p>
                  <p className="text-2xl font-black font-outfit text-blue-500">+12%</p>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-900/30 rounded-xl border border-slate-700/50 flex items-center px-4 justify-between">
                    <div className="w-20 h-2 bg-slate-700 rounded-full" />
                    <div className="w-8 h-2 bg-blue-600/30 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black font-outfit text-slate-900 mb-8 leading-[1.1]">
            Ready to scale your <br/> business with AI?
          </h2>
          <p className="text-lg text-slate-500 mb-12 font-medium max-w-xl mx-auto">
            Join thousands of vendors already using WhatsStore AI to automate their messaging and sales.
          </p>
          <Link href="/login" className="inline-flex items-center gap-3 px-12 py-5 bg-blue-600 text-white text-lg font-black rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all">
            Get Started Now <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-8 text-sm font-bold text-slate-400">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-black font-outfit text-slate-900">WhatsStoreAI</span>
          </div>
          
          <div className="flex gap-8">
            {['Twitter', 'LinkedIn', 'Support'].map(item => (
              <a key={item} href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
          
          <p className="text-sm font-bold text-slate-400">© 2026 WhatsStore AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
