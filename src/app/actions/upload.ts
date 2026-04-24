'use server'

import { getSupabaseAdmin } from '@/server/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'

export async function uploadFileAction(formData: FormData) {
  const file = formData.get('file') as File | null
  const vendorId = formData.get('vendorId') as string | null
  const bucket = formData.get('bucket') as string | null
  const filePath = formData.get('filePath') as string | null
  
  if (!file || !vendorId || !bucket || !filePath) {
    return { error: 'Missing required fields' }
  }
  
  // Verify user is authenticated and matches the vendorId
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== vendorId) {
    return { error: 'Unauthorized' }
  }
  
  const supabaseAdmin = getSupabaseAdmin()
  
  // Need to convert File to Buffer or pass directly if supabase-js supports it
  // Supabase-js Node.js upload expects ArrayBuffer, Buffer, or Blob.
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, { 
      upsert: true,
      contentType: file.type
    })
    
  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return { error: uploadError.message }
  }
  
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath)
    
  return { publicUrl }
}
