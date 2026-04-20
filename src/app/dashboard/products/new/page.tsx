import { createClient } from '@/utils/supabase/server'
import { ProductForm } from '@/components/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch the primary store for this vendor
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('vendor_id', user.id)
    .single() as { data: { id: string } | null }

  if (!store) {
    // If no store exists, they need to create one first
    redirect('/dashboard/store/new')
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/products" 
          className="p-2 border border-slate-200 rounded-xl hover:bg-white hover:shadow-sm transition text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">New Product</h1>
          <p className="text-slate-500 font-medium">Add a new item to your storefront catalog.</p>
        </div>
      </div>

      <ProductForm storeId={store.id} vendorId={user.id} />
    </div>
  )
}
