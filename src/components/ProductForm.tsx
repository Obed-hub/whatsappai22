'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Upload, X, Save, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/server/lib/utils'
import { createProduct, updateProduct } from '@/app/actions/products'

interface ProductFormProps {
  initialData?: any
  storeId: string
  vendorId: string
}

export function ProductForm({ initialData, storeId, vendorId }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [uploading, setUploading] = useState(false)

  // Bind the id parameter to updateProduct if we are editing
  const action = initialData ? updateProduct.bind(null, initialData.id) : createProduct
  const [state, formAction, isPending] = useActionState(action, { error: undefined })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${vendorId}/${fileName}`

      const formData = new FormData()
      formData.append('file', file)
      formData.append('vendorId', vendorId)
      formData.append('bucket', 'product-images')
      formData.append('filePath', filePath)

      const { uploadFileAction } = await import('@/app/actions/upload')
      const result = await uploadFileAction(formData)

      if (result.error) throw new Error(result.error)
      if (!result.publicUrl) throw new Error('Upload failed unexpectedly')

      setImages([...images, result.publicUrl])
    } catch (error: any) {
      alert(`Image upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <form action={formAction} className="space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      {/* Hidden inputs to pass data to the Server Action */}
      <input type="hidden" name="store_id" value={storeId} />
      <input type="hidden" name="vendor_id" value={vendorId} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {state.error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-medium text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={initialData?.name}
              placeholder="e.g. Nike Air Max"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Price (₦)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={initialData?.price}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Stock Inventory</label>
              <input
                name="stock"
                type="number"
                required
                defaultValue={initialData?.stock || 0}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={initialData?.description}
              placeholder="Tell customers about your product..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Product Images</label>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={url} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition p-4 text-center",
                uploading && "opacity-50 cursor-wait"
              )}>
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{uploading ? 'Uploading...' : 'Add Image'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}

