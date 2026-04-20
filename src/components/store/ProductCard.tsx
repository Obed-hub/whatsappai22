'use client'

import { ShoppingBag, Plus } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface ProductCardProps {
  product: any
  slug: string
}

export function ProductCard({ product, slug }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group active:scale-[0.98] transition-all flex flex-col h-full">
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded">Sold Out</span>
          </div>
        )}
        
        {/* Quick Add Button */}
        {product.stock > 0 && (
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addToCart(product)
            }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all active:scale-90"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-xs line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-blue-600 font-black text-sm">₦{product.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
