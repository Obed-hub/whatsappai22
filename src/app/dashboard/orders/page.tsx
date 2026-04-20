import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OrderRepository } from '@/server/services/db/order.repository'
import { ShoppingCart, Clock, CheckCircle2, Truck, MoreHorizontal } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let orders = []
  try {
    orders = await OrderRepository.getOrdersByVendor(user.id)
    
    // DEMO DATA FALLBACK
    if (!orders || orders.length === 0) {
      orders = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          status: 'paid',
          total_amount: 15000,
          customer_details: { name: 'Sarah Jenkins', phone: '+234 812 345 6789' },
          order_items: [{ quantity: 1, products: { name: 'Premium Coffee Beans' } }]
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending',
          total_amount: 25000,
          customer_details: { name: 'David Mills', phone: '+234 701 234 5678' },
          order_items: [{ quantity: 1, products: { name: 'Ceramic Pour-over Set' } }]
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'shipped',
          total_amount: 18000,
          customer_details: { name: 'Grace Egbo', phone: '+234 908 765 4321' },
          order_items: [{ quantity: 1, products: { name: 'Stainless Steel Grinder' } }]
        }
      ] as any
    }
  } catch (err) {
    console.error('Orders Fetch Error:', err)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Orders</h1>
          <p className="text-slate-500 font-medium">Track and manage your customer transactions.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Order ID</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Customer</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Items</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Total</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-slate-900">#{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{order.customer_details?.name || 'Guest'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{order.customer_details?.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 font-medium">
                      {order.order_items?.[0]?.products?.name || 'Multiple items'}
                      {order.order_items?.length > 1 && ` +${order.order_items.length - 1}`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900 text-sm">₦{order.total_amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-bold text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    paid: { color: 'text-green-600 bg-green-50', icon: CheckCircle2, label: 'Paid' },
    pending: { color: 'text-amber-600 bg-amber-50', icon: Clock, label: 'Pending' },
    shipped: { color: 'text-blue-600 bg-blue-50', icon: Truck, label: 'Shipped' },
    cancelled: { color: 'text-red-600 bg-red-50', icon: CheckCircle2, label: 'Cancelled' }
  }

  const config = configs[status] || configs.pending
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}
