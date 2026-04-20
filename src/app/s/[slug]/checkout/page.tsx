import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { CheckoutForm } from '@/components/store/CheckoutForm'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch store data
  const { data: store } = await (supabase
    .from('stores') as any)
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store) {
    notFound()
  }

  // 2. Fetch vendor info
  const { data: vendor } = await (supabase
    .from('vendors') as any)
    .select('*')
    .eq('id', (store as any)?.vendor_id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4">
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-2xl font-black font-outfit text-slate-900 mb-8 text-center italic">Checkout</h1>
        <CheckoutForm 
          store={store} 
          vendor={vendor} 
        />
      </div>
    </div>
  )
}
