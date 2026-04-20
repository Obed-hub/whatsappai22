'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, MessageSquare, AlertTriangle, Loader2, Link as LinkIcon } from 'lucide-react'
import { completeWhatsAppConnection } from '@/app/actions/whatsapp'

interface WhatsAppConnectProps {
  initialStatus?: string
  initialPhone?: string | null
}

export function WhatsAppConnect({ initialStatus = 'inactive', initialPhone }: WhatsAppConnectProps) {
  const [status, setStatus] = useState(initialStatus)
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Facebook SDK
    const loadSdk = () => {
      if (window.FB) return;
      
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_META_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        })
      }
      document.body.appendChild(script)
    }

    loadSdk()
  }, [])

  const handleConnect = () => {
    if (!window.FB) {
      setError('Facebook SDK not loaded. Check your internet connection or ad blocker.')
      return
    }

    setLoading(true)
    setError(null)

    // Trigger Meta Embedded Signup
    window.FB.login((response: any) => {
      if (response.authResponse) {
        // Exchange code for token
        const code = response.authResponse.code
        if (!code) {
           setError('No authorization code returned from Meta.')
           setLoading(false)
           return
        }

        completeWhatsAppConnection(code)
          .then((res) => {
            if (res.success) {
              setStatus('active')
              setPhone(res.phoneNumber)
            } else {
              setError(res.error || 'Failed to complete connection.')
            }
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false))
      } else {
        setError('User cancelled login or did not fully authorize.')
        setLoading(false)
      }
    }, {
      config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, // Use Meta Config ID for Embedded Signup
      response_type: 'code',
      override_default_response_type: true,
      scope: 'whatsapp_business_management,whatsapp_business_messaging'
    })
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            WhatsApp Business API
          </h2>
          <p className="text-slate-500 text-sm font-medium">Connect your official WhatsApp account via Meta.</p>
        </div>
        
        {status === 'active' ? (
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full text-green-600 border border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-slate-400 border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider">Disconnected</span>
          </div>
        )}
      </div>

      {status === 'active' ? (
        <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Number</p>
              <h4 className="text-sm font-bold text-slate-900">{phone || 'Unknown'}</h4>
            </div>
          </div>
          <button 
            disabled
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400"
          >
            Re-sync
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-800">
            <LinkIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              Connect your account to enable automated replies, AI sales assistance, and real-time customer conversations.
            </p>
          </div>

          <button 
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Connect WhatsApp Account'
            )}
          </button>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center bg-red-50 p-2 rounded-lg border border-red-100">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Meta WhatsApp Business API</p>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    FB: any;
  }
}
