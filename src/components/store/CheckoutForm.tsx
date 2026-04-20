'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { processCheckout } from '@/app/actions/checkout'
import { Loader2, ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react'

export function CheckoutForm({ store, vendor }: { store: any, vendor: any }) {
  const { items, total, count, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    
    setLoading(true)
    try {
      const result = await processCheckout({
        storeId: store.id,
        vendorId: store.vendor_id,
        slug: store.slug,
        items,
        total,
        customer: formData
      })
      
      // Redirect to Paystack
      window.location.href = result.authorization_url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (count === 0 && !loading) {
    return (
      <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200">
        <p className="text-slate-500 font-medium mb-4">Your cart is empty.</p>
        <a href={`/s/${store.slug}`} className="text-blue-600 font-bold">Return to Store</a>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Order Summary Card */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <h3 className="font-black font-outfit text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          Order Summary
        </h3>
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">
                {item.quantity}x {item.name}
              </span>
              <span className="font-bold text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
          <span className="text-slate-500 font-bold">Total</span>
          <span className="text-2xl font-black font-outfit text-blue-600">₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Customer Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black font-outfit text-slate-800 mb-2 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          Delivery Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Phone Number</label>
            <input 
              required
              type="tel" 
              placeholder="e.g. 08012345678"
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Delivery Address</label>
            <textarea 
              required
              rows={3}
              placeholder="House Number, Street, City, State"
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition resize-none"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full mt-6 h-14 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              Pay ₦{total.toLocaleString()}
              <ArrowRight className="w-5 h-5 ml-auto" />
            </>
          )}
        </button>
        
        <p className="text-[10px] text-center text-slate-400 font-bold mt-4 uppercase tracking-tighter">
          Secure Payment processed via Paystack
        </p>
      </form>
    </div>
  )
}
