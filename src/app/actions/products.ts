'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type ProductFormState = {
  error?: string
  success?: boolean
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in.' }

  const name = (formData.get('name') as string)?.trim()
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string) || 0
  const description = (formData.get('description') as string)?.trim() || null
  const storeId = formData.get('store_id') as string
  const imagesRaw = formData.get('images') as string

  let images: string[] = []
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : []
  } catch { images = [] }

  if (!name) return { error: 'Product name is required.' }
  if (isNaN(price) || price < 0) return { error: 'Enter a valid price.' }
  if (!storeId) return { error: 'No store found. Please create a store first.' }

  // Generate unique slug
  const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
  const uniqueSuffix = Date.now().toString(36)
  const slug = `${baseSlug}-${uniqueSuffix}`

  const { error } = await (supabase
    .from('products') as any)
    .insert([{
      vendor_id: user.id,
      store_id: storeId,
      name,
      slug,
      price,
      stock,
      description,
      images,
      is_published: true,
    }])

  if (error) {
    console.error('[createProduct]', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in.' }

  const name = (formData.get('name') as string)?.trim()
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string) || 0
  const description = (formData.get('description') as string)?.trim() || null
  const imagesRaw = formData.get('images') as string

  let images: string[] = []
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : []
  } catch { images = [] }

  if (!name) return { error: 'Product name is required.' }
  if (isNaN(price) || price < 0) return { error: 'Enter a valid price.' }

  const { error } = await (supabase
    .from('products') as any)
    .update({ name, price, stock, description, images })
    .eq('id', id)
    .eq('vendor_id', user.id) // safety — can only update own products

  if (error) {
    console.error('[updateProduct]', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}
