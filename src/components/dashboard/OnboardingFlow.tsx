'use client'

import { useState } from 'react'
import { CheckCircle2, MessageSquare, Store, PackagePlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { WhatsAppConnect } from '@/components/dashboard/WhatsAppConnect'

interface OnboardingFlowProps {
  isWhatsAppConnected: boolean
  hasProducts: boolean
}

export function OnboardingFlow({ isWhatsAppConnected, hasProducts }: OnboardingFlowProps) {
  // Determine current active step
  const currentStep = !isWhatsAppConnected ? 1 : !hasProducts ? 2 : 3

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black font-outfit text-slate-900 mb-3">
          Welcome to WhatsStore AI 🎉
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Let's get your store set up so you can start selling on WhatsApp automatically. Complete these quick steps to launch your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StepIndicator 
          number={1} 
          title="Connect WhatsApp" 
          description="Link your business number"
          isActive={currentStep === 1} 
          isCompleted={isWhatsAppConnected} 
        />
        <StepIndicator 
          number={2} 
          title="Add a Product" 
          description="List your first item"
          isActive={currentStep === 2} 
          isCompleted={hasProducts} 
        />
        <StepIndicator 
          number={3} 
          title="Start Selling" 
          description="Share your store link"
          isActive={currentStep === 3} 
          isCompleted={false} 
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        {currentStep === 1 && (
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-outfit text-slate-900">Connect your WhatsApp</h2>
                <p className="text-slate-500 font-medium">This enables the AI to automatically reply to your customers and process orders.</p>
              </div>
            </div>
            
            <div className="max-w-2xl">
              <WhatsAppConnect initialStatus={isWhatsAppConnected ? 'active' : 'inactive'} />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
              <PackagePlus className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black font-outfit text-slate-900 mb-2">Add your first product</h2>
            <p className="text-slate-500 font-medium max-w-md mb-8">
              Your store needs at least one product before customers can start shopping. You can also customize your store's appearance along the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dashboard/store"
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition"
              >
                Customize Store First
              </Link>
              <Link 
                href="/dashboard/products/new"
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                Add Product <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ number, title, description, isActive, isCompleted }: { number: number, title: string, description: string, isActive: boolean, isCompleted: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : isCompleted ? 'bg-white border-green-100 opacity-70' : 'bg-slate-50 border-transparent opacity-50'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : number}
        </div>
        <div>
          <h3 className={`font-bold ${isActive ? 'text-blue-900' : isCompleted ? 'text-green-800' : 'text-slate-700'}`}>
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  )
}
