import { Suspense } from 'react'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ShoppingCart, 
  Plus, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { OrderRepository } from '@/server/services/db/order.repository'
import { OnboardingFlow } from '@/components/dashboard/OnboardingFlow'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Layout guarantees auth — user is always present here
  const vendorId = user!.id

  let stats, uniqueConvs = []
  
  try {
    const [statsResult, messagesResult, whatsappResult, productsResult] = await Promise.all([
      OrderRepository.getVendorStats(vendorId),
      (supabase
        .from('messages') as any)
        .select('*, conversations(customers(name, phone))')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(10),
      (supabase
        .from('whatsapp_connections') as any)
        .select('phone_number_id')
        .eq('vendor_id', vendorId)
        .maybeSingle(),
      (supabase
        .from('products') as any)
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
    ])

    stats = statsResult
    const { data: recentMessages, error: msgError } = messagesResult
    
    // Check onboarding status
    const isWhatsAppConnected = !!(whatsappResult.data?.phone_number_id)
    const hasProducts = (productsResult.count || 0) > 0

    if (!isWhatsAppConnected || !hasProducts) {
      return <OnboardingFlow isWhatsAppConnected={isWhatsAppConnected} hasProducts={hasProducts} />
    }

    if (msgError) throw msgError

    // DEMO OVERRIDE: If no data, show mockup
    if (stats.totalOrders === 0) {
      stats = {
        totalRevenue: 1250000,
        totalOrders: 42,
        pendingOrders: 5,
        totalCustomers: 128,
        activeConversations: 12
      }
    }

    // Extract unique conversations
    const seenPhones = new Set()
    uniqueConvs = (recentMessages || [])
      .filter((m: any) => {
        const phone = (m as any).conversations?.customers?.phone
        if (!phone || seenPhones.has(phone)) return false
        seenPhones.add(phone)
        return true
      })
      .slice(0, 3)

    // DEMO OVERRIDE: If no convs, show mockup
    if (uniqueConvs.length === 0) {
      uniqueConvs = [
        { id: 'c1', content: "I'd like to order 2 bags of coffee beans.", created_at: new Date().toISOString(), direction: 'inbound', conversations: { customers: { name: 'Sarah J.', phone: '+234 812 345 6789' } } },
        { id: 'c2', content: "Does the pour-over set come in black?", created_at: new Date().toISOString(), direction: 'inbound', conversations: { customers: { name: 'David M.', phone: '+234 701 234 5678' } } },
        { id: 'c3', content: "Your order has been confirmed!", created_at: new Date().toISOString(), direction: 'outbound', conversations: { customers: { name: 'Grace E.', phone: '+234 908 765 4321' } } }
      ] as any
    }
  } catch (err: any) {
    const error = {
      message: err.message || 'Unknown error',
      code: err.code || 'NO_CODE',
      details: err.details || 'No details',
      hint: err.hint || 'Check if you have run the SQL setup script.',
      table: err.table || 'Unknown'
    }
    
    console.error('Dashboard Data Fetch Error:', error)
    
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-700 shadow-xl shadow-red-100/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black font-outfit text-xl">Database Connection Error</h2>
            <p className="text-sm opacity-80">We couldn't reach your store data.</p>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur border border-red-100 rounded-2xl p-6 mb-6">
          <p className="font-bold text-sm mb-2 text-red-800">Technical Details:</p>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono uppercase tracking-wider text-red-500 mb-4">
            <div>Code: {error.code}</div>
            <div>Table: {error.table}</div>
          </div>
          <p className="text-sm text-slate-700 font-medium bg-red-50/50 p-3 rounded-lg border border-red-100/50">
            {error.message}
          </p>
          {error.hint && (
            <p className="mt-4 text-xs text-slate-500 italic">
              Tip: {error.hint}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-slate-600">First time setting up?</p>
          <div className="flex gap-4">
            <a 
              href="https://supabase.com/dashboard/project/_/sql/new" 
              target="_blank"
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition"
            >
              Open SQL Editor
            </a>
            <Link 
              href="/"
              className="px-6 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome to your store's command center.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/store" 
            className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            Store Settings
          </Link>
          <Link 
            href="/dashboard/products/new" 
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Customers" 
          value={stats.totalCustomers.toString()} 
          change="Real-time count"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard 
          title="Active Conversations" 
          value={stats.activeConversations.toString()} 
          change={`${stats.activeConversations} open windows`}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <MetricCard 
          title="Total Sales" 
          value={`₦${stats.totalRevenue.toLocaleString()}`} 
          change="Paid orders total"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          change={`${stats.pendingOrders} pending`}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-black font-outfit text-slate-800">Recent Conversations</h2>
            <Link href="/dashboard/conversations" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {uniqueConvs.map((msg: any, i: number) => (
              <ActivityItem 
                key={msg.id || i}
                name={msg.conversations?.customers?.name || msg.conversations?.customers?.phone || 'Customer'} 
                message={msg.content} 
                time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                status={msg.direction === 'inbound' ? 'New Message' : 'AI Replied'}
                isHighlighted={msg.direction === 'inbound'}
              />
            ))}
            {uniqueConvs.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-medium">
                No recent conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / AI Status */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex flex-col gap-4 relative overflow-hidden">
            <Sparkles className="absolute top-[-10px] right-[-10px] w-24 h-24 opacity-10" />
            <h3 className="font-black font-outfit text-xl relative z-10">AI Sales Agent</h3>
            <p className="text-blue-100 text-sm leading-relaxed relative z-10">
              Your AI Assistant is monitoring all incoming messages to close sales for you.
            </p>
            <div className="flex items-center gap-2 mt-2 relative z-10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-300">Live & Monitoring</span>
            </div>
            <Link 
              href="/dashboard/automation" 
              className="mt-4 w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl text-center text-sm hover:bg-blue-50 transition relative z-10"
            >
              Automation Settings
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-black font-outfit text-slate-800 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <QuickLink href="/dashboard/products" label="Manage Inventory" />
              <QuickLink href="/dashboard/store" label="Store Customization" />
              <QuickLink href="/dashboard/conversations" label="Manual Inbox" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, change }: { title: string, value: string, icon: React.ReactNode, change: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-slate-500 font-bold text-sm">{title}</h3>
        <p className="text-2xl font-black font-outfit text-slate-900">{value}</p>
        <p className="text-xs font-bold text-green-600 flex items-center gap-1">
          {change}
        </p>
      </div>
    </div>
  )
}

function ActivityItem({ name, message, time, status, isHighlighted = false }: { name: string, message: string, time: string, status: string, isHighlighted?: boolean }) {
  return (
    <div className={`p-4 flex items-center justify-between hover:bg-slate-50 transition ${isHighlighted ? 'bg-blue-50/30' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-slate-600">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
          <p className="text-xs text-slate-500 line-clamp-1">{message}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{status}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  )
}

function QuickLink({ href, label }: { href: string, label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group"
    >
      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{label}</span>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
    </Link>
  )
}
