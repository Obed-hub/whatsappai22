import { createClient } from '@/utils/supabase/server'
import { Settings, CreditCard, Shield, Bell, User, MessageSquare } from 'lucide-react'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const WhatsAppConnect = dynamic(() => import('@/components/dashboard/WhatsAppConnect').then(mod => mod.WhatsAppConnect), {
  loading: () => <div className="p-8 bg-white rounded-2xl border border-slate-200 animate-pulse h-64" />
})

export default async function SettingsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const [{ data: vendor }, { data: whatsapp }] = await Promise.all([
    (supabase
      .from('vendors') as any)
      .select('*')
      .eq('id', user.id)
      .single(),
    (supabase
      .from('whatsapp_connections') as any)
      .select('*')
      .eq('vendor_id', user.id)
      .single()
  ])

  const searchParams = await props.searchParams
  const activeTab = searchParams?.tab || 'profile'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black font-outfit text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your subscription, profile, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <SettingsTab icon={<User className="w-4 h-4" />} label="Profile" href="/dashboard/settings?tab=profile" active={activeTab === 'profile'} />
          <SettingsTab icon={<MessageSquare className="w-4 h-4" />} label="Channels" href="/dashboard/settings?tab=channels" active={activeTab === 'channels'} />
          <SettingsTab icon={<CreditCard className="w-4 h-4" />} label="Billing" href="/dashboard/settings?tab=billing" active={activeTab === 'billing'} />
          <SettingsTab icon={<Shield className="w-4 h-4" />} label="Security" href="/dashboard/settings?tab=security" active={activeTab === 'security'} />
          <SettingsTab icon={<Bell className="w-4 h-4" />} label="Notifications" href="/dashboard/settings?tab=notifications" active={activeTab === 'notifications'} />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                <h2 className="text-xl font-black font-outfit text-slate-800">Business Profile</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Business Name</label>
                    <input 
                      type="text" 
                      defaultValue={vendor?.business_name || ''} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Business Email</label>
                    <input 
                      type="email" 
                      defaultValue={vendor?.email} 
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">WhatsApp Number</label>
                    <input 
                      type="text" 
                      defaultValue={vendor?.phone || ''} 
                      placeholder="+234..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">
                    Save Changes
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'channels' && (
            <WhatsAppConnect 
              initialStatus={whatsapp?.status} 
              initialPhone={vendor?.phone} 
            />
          )}

          {activeTab === 'billing' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black font-outfit text-slate-800">Subscription Plan</h2>
              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">WhatsStore {vendor?.plan === 'pro' ? 'Pro' : 'Basic'}</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                      {vendor?.plan === 'pro' ? '₦15,000 / month' : 'Free Forever'}
                    </p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-white text-blue-600 font-bold text-sm rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition">
                  {vendor?.plan === 'pro' ? 'Manage' : 'Upgrade'}
                </button>
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'notifications') && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Coming Soon</h3>
                <p className="text-sm text-slate-500">This settings module is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition",
        active ? "bg-white border border-slate-100 shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
