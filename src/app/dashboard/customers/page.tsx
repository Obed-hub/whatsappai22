import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Phone, Calendar, ShoppingBag, Search } from 'lucide-react'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetching real customers (with mock fallback)
  let customers = []
  try {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('vendor_id', user.id)
      .order('last_seen_at', { ascending: false })
    
    customers = data || []

    // DEMO DATA FALLBACK
    if (customers.length === 0) {
      customers = [
        { id: '1', name: 'Sarah Jenkins', phone: '+234 812 345 6789', last_seen_at: new Date().toISOString() },
        { id: '2', name: 'David Mills', phone: '+234 701 234 5678', last_seen_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', name: 'Grace Egbo', phone: '+234 908 765 4321', last_seen_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '4', name: 'Olawale Ade', phone: '+234 802 123 4567', last_seen_at: new Date(Date.now() - 172800000).toISOString() }
      ] as any
    }
  } catch (err) {
    console.error('Customers Fetch Error:', err)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Customers</h1>
          <p className="text-slate-500 font-medium">Manage and understand your buyer relationships.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer: any) => (
          <div key={customer.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {customer.name.charAt(0)}
              </div>
              <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                Active
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black font-outfit text-slate-900">{customer.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{customer.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    {new Date(customer.last_seen_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <ShoppingBag className="w-3 h-3 text-blue-500" />
                    WhatsApp Buyer
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
