import { createClient } from '@/utils/supabase/server'
import { ShoppingBag, MessageSquare, ArrowLeft, Share2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/store/ProductCard'
import { CartDrawer } from '@/components/store/CartDrawer'

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  let store, products, vendor
  
  try {
    if (slug === 'coffee-shop') {
      store = {
        id: 'mock-store',
        vendor_id: 'mock-vendor',
        store_name: 'The Artisan Roast',
        slug: 'coffee-shop',
        primary_color: '#8b4513',
        description: 'Premium handcrafted coffee beans delivered to your doorstep. Chat with us on WhatsApp to order now.',
        delivery_info: 'Free delivery on orders over ₦20,000'
      }
      products = [
        { id: '1', name: 'Premium Coffee Beans', slug: 'coffee-beans', price: 15000, stock: 45, images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2670&auto=format&fit=crop'] },
        { id: '2', name: 'Ceramic Pour-over Set', slug: 'pour-over', price: 25000, stock: 12, images: ['https://images.unsplash.com/photo-1544787210-282713df8b03?q=80&w=2670&auto=format&fit=crop'] },
        { id: '3', name: 'Manual Burr Grinder', slug: 'grinder', price: 12000, stock: 8, images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2574&auto=format&fit=crop'] }
      ]
      vendor = { phone: '2348123456789' }
    } else {
      // 1. Fetch store data
      const { data: storeData, error: storeError } = await (supabase
        .from('stores') as any)
        .select('*')
        .eq('slug', slug)
        .single()

      if (storeError || !storeData) {
        if (storeError?.code === 'PGRST116') return notFound() // Not found
        throw storeError || new Error('Store not found')
      }
      store = storeData

      // 2. Fetch products for this store
      const { data: productsData, error: productsError } = await (supabase
        .from('products') as any)
        .select('*')
        .eq('store_id', (store as any).id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError
      products = productsData

      // 3. Fetch vendor info for WhatsApp link
      const { data: vendorData, error: vendorError } = await (supabase
        .from('vendors') as any)
        .select('phone')
        .eq('id', (store as any).vendor_id)
        .single()

      if (vendorError) throw vendorError
      vendor = vendorData
    }
  } catch (error: any) {
    console.error('Storefront Data Error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black font-outfit text-slate-900 mb-2">Store Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6">
            We couldn't load this store's data. Please check your database connection or try again later.
          </p>
          <Link href="/" className="inline-block px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      {/* Dynamic Header based on Store Primary Color */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                style={{ backgroundColor: store.primary_color }}
              >
                {store.store_name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-black font-outfit text-slate-900 leading-none">{store.store_name}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Store</p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero / Description */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <p className="text-slate-600 text-sm leading-relaxed">
            {store.description || `Welcome to ${store.store_name}! Browse our catalog and chat with us on WhatsApp to order.`}
          </p>
          {store.delivery_info && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-blue-600">
              <ShoppingBag className="w-4 h-4" />
              {store.delivery_info}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <h2 className="font-black font-outfit text-xl mb-6 text-slate-800">Our Products</h2>
        <div className="grid grid-cols-2 gap-4">
          {products?.map((product: any) => (
            <ProductCard key={product.id} product={product} slug={slug} />
          ))}
        </div>

        {(!products || products.length === 0) && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No products available yet.</p>
          </div>
        )}
      </div>

      {/* Floating UI Elements */}
      <div className="fixed bottom-6 left-0 w-full px-4 z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <CartDrawer storeSlug={slug} />
          
          <a
            href={`https://wa.me/${vendor?.phone}?text=Hi! I am browsing your store ${store.store_name}.`}
            target="_blank"
            className="w-full h-14 bg-green-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-200 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-6 h-6 fill-white" />
            Chat to Order
          </a>
        </div>
      </div>
    </div>
  )
}
