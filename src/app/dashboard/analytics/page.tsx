import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, Users, ShoppingCart, ArrowUp, ArrowDown, Sparkles, Zap } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mock data for analytics (to be replaced with real aggregation queries later)
  const analyticsData = {
    revenue: { total: 1250000, growth: 12.5, trend: 'up' },
    orders: { total: 42, growth: 8.2, trend: 'up' },
    conversion: { rate: 3.4, growth: -1.2, trend: 'down' },
    aiSavings: { hours: 124, efficiency: 94, trend: 'up' }
  }

  const topProducts = [
    { name: 'Premium Coffee Beans', sales: 45, revenue: 675000 },
    { name: 'Ceramic Pour-over Set', sales: 12, revenue: 300000 },
    { name: 'Stainless Steel Grinder', sales: 8, revenue: 144000 }
  ]

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
          title="Total Revenue" 
          value={`₦${analyticsData.revenue.total.toLocaleString()}`} 
          growth={analyticsData.revenue.growth} 
          trend={analyticsData.revenue.trend} 
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard 
          title="Total Orders" 
          value={analyticsData.orders.total.toString()} 
          growth={analyticsData.orders.growth} 
          trend={analyticsData.orders.trend} 
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${analyticsData.conversion.rate}%`} 
          growth={analyticsData.conversion.growth} 
          trend={analyticsData.conversion.trend} 
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard 
          title="AI Efficiency" 
          value={`${analyticsData.aiSavings.efficiency}%`} 
          growth={analyticsData.aiSavings.hours} 
          trend={analyticsData.aiSavings.trend} 
          icon={<Zap className="w-5 h-5" />}
          label="Hrs Saved"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BarChart3 className="w-40 h-40" />
          </div>
          <h3 className="font-black font-outfit text-slate-900 mb-8">Sales Performance</h3>
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
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black font-outfit text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Top Products
          </h3>
          <div className="space-y-6">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.sales} Sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">₦{p.revenue.toLocaleString()}</p>
                  <div className="w-16 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(p.revenue / 700000) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        <div className={`flex items-center gap-1 font-black text-[10px] uppercase tracking-wider ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {growth}%
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-black font-outfit text-slate-900">{value}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label} this month</p>
      </div>
    </div>
  )
}
