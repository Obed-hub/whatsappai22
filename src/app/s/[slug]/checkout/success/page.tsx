'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Sparkles, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage({ params }: { params: { slug: string } }) {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-green-100 rounded-[32px] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black font-outfit text-slate-900 italic">Order Confirmed!</h1>
          <p className="text-slate-500 font-medium px-4">
            Your payment was successful. The store owner has been notified and will contact you via WhatsApp shortly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Next Steps</p>
          <div className="flex flex-col gap-3">
             <Link 
              href={`/s/${params.slug}`}
              className="w-full h-14 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-bold tracking-tight">
          ORDER #CONFIRMED • THANKS FOR YOUR PATRONAGE
        </p>
      </div>
    </div>
  )
}
