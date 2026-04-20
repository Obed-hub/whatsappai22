'use client'

import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'

export function CartDrawer({ storeSlug }: { storeSlug: string }) {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, total, count } = useCart()

  if (!isOpen && count === 0) return null

  // Floating Trigger when closed but has items
  if (!isOpen && count > 0) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[60] bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce shadow-blue-200 active:scale-95 transition-transform"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-blue-600">
            {count}
          </span>
        </div>
        <span className="font-bold text-sm">View Cart</span>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-[32px] shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh' }}
      >
        <div className="max-w-md mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <div>
              <h2 className="text-xl font-black font-outfit text-slate-900">Your Cart</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{count} items selected</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-blue-600 font-black text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-50 w-fit rounded-lg px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-slate-500 hover:text-blue-600 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-black text-slate-900 min-w-[20px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-slate-500 hover:text-blue-600 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 font-medium">Your cart is empty.</p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-blue-600 font-bold text-sm"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 rounded-b-[32px]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-bold">Subtotal</span>
                <span className="text-2xl font-black font-outfit text-slate-900">₦{total.toLocaleString()}</span>
              </div>
              <Link 
                href={`/s/${storeSlug}/checkout`}
                className="w-full h-14 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                Checkout Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
