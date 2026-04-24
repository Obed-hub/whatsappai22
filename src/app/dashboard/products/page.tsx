import { createClient } from '@/utils/supabase/server'
import { Plus, Search, Filter, Edit, Trash, Package } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cn } from '@/server/lib/utils'

export default async function ProductsPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    user = { id: '00000000-0000-0000-0000-000000000000', email: 'demo@example.com' } as any
  }
  const userId = user?.id || '00000000-0000-0000-0000-000000000000'

  let { data: products } = await (supabase
    .from('products') as any)
    .select('*')
    .eq('vendor_id', userId)
    .order('created_at', { ascending: false })

  // No demo data injection here so the real empty state can be shown.

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Inventory</h1>
          <p className="text-slate-500 font-medium">Manage your products and stock levels.</p>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(products as any[])?.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden border border-slate-100 flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{product.name}</h3>
                        <p className="text-xs text-slate-400">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 text-sm">₦{product.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                      product.stock > 10 ? "bg-green-50 text-green-700" : 
                      product.stock > 0 ? "bg-orange-50 text-orange-700" : 
                      "bg-red-50 text-red-700"
                    )}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.is_published ? "bg-green-500" : "bg-slate-300"
                      )} />
                      <span className="text-xs font-medium text-slate-600">
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Package className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-slate-800">No products found</h3>
                      <p className="text-xs text-slate-500">Get started by creating your first product to show on your store.</p>
                      <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                        Create a product <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ArrowRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}
