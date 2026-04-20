import { createClient } from '@/utils/supabase/server'
import { Sparkles, Zap, Bell, MessageSquare, Save, Bot } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Database } from '@/types/supabase'

type Automation = Database['public']['Tables']['automations']['Row']

export default async function AutomationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const vendorId = user?.id || '00000000-0000-0000-0000-000000000000'

  let { data: automation } = await (supabase
    .from('automations') as any)
    .select('*')
    .eq('vendor_id', vendorId)
    .single()

  if (!automation) {
    automation = {
      ai_enabled: true,
      auto_reply_enabled: true,
      followup_enabled: true,
      reminder_1: 24,
      reminder_2: 48,
      reminder_3: 72,
      welcome_message: "Hi! Welcome to our store. How can I help you today?"
    } as any
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black font-outfit text-slate-900">Automation</h1>
        <p className="text-slate-500 font-medium">Configure your AI Sales Assistant and automated replies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Toggle */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-outfit text-slate-800">AI Sales Assistant</h3>
                  <p className="text-sm text-slate-500 font-medium">Use Groq-powered AI to handle customer inquiries.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={automation?.ai_enabled} className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3 mb-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-800">Knowledge Base</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The AI automatically uses your catalog, pricing, and stock levels to answer customer questions accurately.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3 mb-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <h4 className="font-bold text-sm text-slate-800">Instant Replies</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Average response time is under 2 seconds, ensuring customers staying engaged during peak interest.
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up Engine */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-outfit text-slate-800">Follow-up Engine</h3>
                  <p className="text-sm text-slate-500 font-medium">Re-engage customers who haven't completed a purchase.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={automation?.followup_enabled} className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="space-y-4 pt-4">
              <label className="block text-sm font-bold text-slate-700">Follow-up Timing (Hours)</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Reminder 1</p>
                  <input type="number" defaultValue={automation?.reminder_1} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Reminder 2</p>
                  <input type="number" defaultValue={automation?.reminder_2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Reminder 3</p>
                  <input type="number" defaultValue={automation?.reminder_3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black font-outfit text-slate-800">Welcome Message</h3>
            <p className="text-xs text-slate-500">Sent automatically to first-time customers on WhatsApp.</p>
            <textarea 
              rows={4}
              placeholder="Hi! Welcome to our store. How can I help you today?"
              defaultValue={automation?.welcome_message || ''}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
