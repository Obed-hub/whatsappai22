'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, Loader2, ImageIcon, CheckCircle2, Upload, X } from 'lucide-react'

interface StoreSettingsFormProps {
  store: any
  vendorId: string
}

export function StoreSettingsForm({ store, vendorId }: StoreSettingsFormProps) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [storeName, setStoreName] = useState(store?.store_name || '')
  const [description, setDescription] = useState(store?.description || '')
  const [primaryColor, setPrimaryColor] = useState(store?.primary_color || '#3b82f6')
  const [deliveryInfo, setDeliveryInfo] = useState(store?.delivery_info || '')
  const [logoUrl, setLogoUrl] = useState<string | null>(store?.logo_url || null)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      setUploading(true)
      setError(null)

      const file = e.target.files[0]

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file (PNG, JPG, WEBP, etc.)')
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be smaller than 2MB')
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${vendorId}/logo.${fileExt}`

      const formData = new FormData()
      formData.append('file', file)
      formData.append('vendorId', vendorId)
      formData.append('bucket', 'store-assets')
      formData.append('filePath', filePath)

      const { uploadFileAction } = await import('@/app/actions/upload')
      const result = await uploadFileAction(formData)

      if (result.error) throw new Error(result.error)
      if (!result.publicUrl) throw new Error('Upload failed unexpectedly')

      setLogoUrl(result.publicUrl)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaved(false)
      setError(null)

      if (!storeName.trim()) throw new Error('Store name is required.')

      const payload = {
        store_name: storeName.trim(),
        description: description.trim() || null,
        primary_color: primaryColor,
        delivery_info: deliveryInfo.trim() || null,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      }

      const { error: dbError } = await (supabase
        .from('stores') as any)
        .update(payload)
        .eq('vendor_id', vendorId)

      if (dbError) throw dbError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-start gap-3">
          <X className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Store Name & Description */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
          Store Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Name *</label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="My Awesome Store"
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Info</label>
            <input
              type="text"
              value={deliveryInfo}
              onChange={e => setDeliveryInfo(e.target.value)}
              placeholder="e.g. Free delivery over ₦20,000"
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell customers what makes your store special..."
            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none outline-none"
          />
        </div>
      </div>

      {/* Visual Branding */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black font-outfit text-slate-900">Visual Branding</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Color Picker */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Color</label>
            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer">
                <div
                  className="w-16 h-16 rounded-2xl shadow-inner border-4 border-white ring-1 ring-slate-200 transition-transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400 font-bold">Click the swatch to pick a color</p>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Logo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={uploading}
            />

            {logoUrl ? (
              <div className="relative group">
                <img
                  src={logoUrl}
                  alt="Store Logo"
                  className="w-full h-28 object-contain bg-slate-50 rounded-2xl border border-slate-200 p-3"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 group-hover:text-blue-500 transition" />
                    <span className="text-xs font-bold group-hover:text-blue-500 transition">
                      Click to upload logo
                    </span>
                    <span className="text-[10px] text-slate-300">PNG, JPG, WEBP — max 2MB</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-2">
        {saved && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Changes saved!
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
