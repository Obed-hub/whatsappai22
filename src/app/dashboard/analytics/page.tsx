import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, Users, ShoppingCart, ArrowUp, ArrowDown, Sparkles, Zap, MessageSquare, MousePointer2 } from 'lucide-react'
import { AnalyticsRepository } from '@/server/services/db/analytics.repository'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const analyticsData = await AnalyticsRepository.getVendorOverview(user.id)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Analytics</h1>
          <p className="text-slate-500 font-medium">Deep insights into your shop performance and AI efficiency.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">
          Last 30 Days
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chats Today" 
          value={analyticsData.chatsToday.toString()} 
          growth={100} // Placeholder for growth
          trend="up"
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <StatCard 
          title="Store Clicks" 
          value={analyticsData.storeClicks.toString()} 
          growth={analyticsData.clickRate} 
          trend="up"
          icon={<MousePointer2 className="w-5 h-5" />}
          label="Click Rate %"
        />
        <StatCard 
          title="AI Replies" 
          value={analyticsData.aiReplies.toString()} 
          growth={100}
          trend="up"
          icon={<Zap className="w-5 h-5" />}
        />
        <StatCard 
          title="Products Recommended" 
          value={analyticsData.productsRecommended.toString()} 
          growth={100}
          trend="up"
          icon={<Sparkles className="w-5 h-5" />}
          label="Total Recs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BarChart3 className="w-40 h-40" />
          </div>
          <h3 className="font-black font-outfit text-slate-900 mb-8">Conversations Over Time</h3>
          <div className="h-64 flex items-end gap-3 mb-4">
            {[45, 60, 40, 75, 55, 90, 65, 80, 50, 95, 70, 85].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-all duration-500"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            <span>Last 12 Days</span>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black font-outfit text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Recent Leads
          </h3>
          <div className="space-y-6">
            {analyticsData.recentLeads.map((customer: any, i: number) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{customer.name || customer.phone}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Last seen {new Date(customer.last_seen_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
            {analyticsData.recentLeads.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No recent leads yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Clicked Products */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="font-black font-outfit text-slate-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Top Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsData.topProducts.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500 font-medium">₦{Number(p.price).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Pop. Score</p>
                <p className="text-lg font-black text-blue-600">{Math.round(p.popularity_score || 0)}</p>
              </div>
            </div>
          ))}
          {analyticsData.topProducts.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4 col-span-full">No product data available.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, growth, trend, icon, label = 'Growth' }: any) {
  const isUp = trend === 'up'
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
          {icon}
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 font-black text-[10px] uppercase tracking-wider ${isUp ? 'text-green-600' : 'text-red-600'}`}>
            {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {growth}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-black font-outfit text-slate-900">{value}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
      </div>
    </div>
  )
}
