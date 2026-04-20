import { createClient } from '@/utils/supabase/server'
import { ShoppingBag, MessageSquare, ArrowLeft, Share2, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params
  const supabase = await createClient()

  // 1. Fetch store and product data
  const { data: product } = await (supabase
    .from('products') as any)
    .select('*, stores(*)')
    .eq('slug', productSlug)
    .single()

  if (!product || (product as any).stores.slug !== slug) {
    notFound()
  }

  const store = (product as any).stores

  // 2. Fetch vendor info for WhatsApp link
  const { data: vendor } = await (supabase
    .from('vendors') as any)
    .select('phone')
    .eq('id', (store as any).vendor_id)
    .single()

  const waLink = `https://wa.me/${vendor?.phone}?text=I%20want%20to%20order%20${encodeURIComponent(product.name)}.%20Price:%20₦${product.price.toLocaleString()}`

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      {/* Product Image Gallery (Full width on mobile) */}
      <div className="relative aspect-square bg-white border-b border-slate-100">
        <Link 
          href={`/s/${slug}`} 
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm transition active:scale-95">
          <Share2 className="w-5 h-5" />
        </button>

        <div className="w-full h-full overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
              <ShoppingBag className="w-20 h-20" />
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">In Stock</span>
            {product.stock < 10 && product.stock > 0 && (
              <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Limited Quantity</span>
            )}
          </div>
          <h1 className="text-3xl font-black font-outfit text-slate-900 leading-tight mb-2">{product.name}</h1>
          <p className="text-2xl font-black text-blue-600 font-outfit">₦{product.price.toLocaleString()}</p>
        </div>

        {/* Features / Badges */}
        <div className="grid grid-cols-2 gap-3">
          <Badge icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} label="Verified Product" />
          <Badge icon={<Sparkles className="w-4 h-4 text-blue-500" />} label="Fast Delivery" />
        </div>

        <div>
          <h2 className="font-black font-outfit text-sm uppercase tracking-wider text-slate-400 mb-3">Product Description</h2>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>
        </div>

        {/* Back in stock form if stock == 0 */}
        {product.stock === 0 && (
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Notify Me</h3>
                <p className="text-xs text-slate-500">Currently out of stock. We'll message you when it's back!</p>
              </div>
            </div>
            <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-100 transition active:scale-95">
              Email me when available
            </button>
          </div>
        )}
      </div>

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 px-6 z-50">
        <div className="max-w-md mx-auto flex gap-4">
          <a
            href={waLink}
            target="_blank"
            className="flex-1 h-14 bg-green-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-6 h-6 fill-white" />
            Buy on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

function Badge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
      {icon}
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
    </div>
  )
}

function Bell(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
  )
}
