import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Store, Globe } from 'lucide-react'
import { StoreSettingsForm } from '@/components/store/StoreSettingsForm'

export default async function StoreSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let { data: store } = await (supabase
    .from('stores') as any)
    .select('*')
    .eq('vendor_id', user.id)
    .single()

  // Auto-create a default store if it doesn't exist
  if (!store) {
    // Use admin client to bypass any RLS issues during initial creation
    const { getSupabaseAdmin } = await import('@/server/lib/supabase-admin')
    const supabaseAdmin = getSupabaseAdmin()
    
    // 1. Ensure vendor exists first to avoid Foreign Key errors
    const { data: vendor } = await (supabaseAdmin.from('vendors') as any)
      .select('id')
      .eq('id', user.id)
      .single()
      
    if (!vendor) {
      const businessName = user.email?.split('@')[0] || 'My Store'
      await (supabaseAdmin.from('vendors') as any).insert({
        id: user.id,
        email: user.email,
        business_name: businessName
      })
    }

    // 2. Create the store
    const defaultStoreName = user.email?.split('@')[0] || 'My Store'
    const baseSlug = defaultStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const randomSuffix = Math.random().toString(36).substring(2, 7)
    
    const { data: newStore, error: insertError } = await (supabaseAdmin
      .from('stores') as any)
      .insert({
        vendor_id: user.id,
        store_name: defaultStoreName,
        slug: `${baseSlug}-${randomSuffix}`
      })
      .select()
      .single()
      
    if (!insertError && newStore) {
      store = newStore
    } else {
      console.error('Failed to auto-create store:', insertError)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-black font-outfit text-slate-900">Store Customization</h1>
        <p className="text-slate-500 font-medium mt-1">Control your shop's identity and visual branding.</p>
        {store?.slug && (
          <a
            href={`/s/${store.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-blue-600 font-bold mt-2 hover:underline"
          >
            <Globe className="w-4 h-4" />
            /s/{store.slug}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {store ? (
            <StoreSettingsForm store={store} vendorId={user.id} />
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl text-center space-y-4">
              <Store className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h2 className="font-black text-slate-800 text-xl">No Store Found</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Your store hasn't been created yet. Make sure you've completed the sign-up flow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="font-outfit font-black text-lg mb-4 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Live Preview
            </h3>
            <div className="aspect-[9/16] bg-slate-50 rounded-2xl relative overflow-hidden text-slate-900 border-4 border-slate-800">
              {/* Header Mockup */}
              <div className="h-12 bg-white border-b border-slate-100 flex items-center px-4 gap-2">
                {store?.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: store?.primary_color || '#3b82f6' }} />
                )}
                <span className="text-[10px] font-black">{store?.store_name || 'Your Store'}</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-20 bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                  <p className="text-[8px] text-slate-500 leading-tight">
                    {store?.description || 'Your store description will appear here.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map(i => (
                    <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 p-2">
                      <div className="h-12 bg-slate-100 rounded-lg mb-2" />
                      <div className="h-2 bg-slate-200 w-full mb-1" />
                      <div className="h-2 bg-slate-100 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating Button Mockup */}
              <div
                className="absolute bottom-4 left-4 right-4 h-8 rounded-lg shadow-lg flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: store?.primary_color || '#3b82f6' }}
              >
                Chat to Order
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center font-bold">
              * This is how your store looks on mobile
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
