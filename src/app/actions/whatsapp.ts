'use server'

import { createClient } from '@/utils/supabase/server'
import { WhatsAppService } from '@/server/services/whatsapp'

export async function completeWhatsAppConnection(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // 1. Exchange code for access token
    const accessToken = await WhatsAppService.exchangeCodeForToken(code)

    // 2. Get WhatsApp Business Account (WABA)
    const wabaAccounts = await WhatsAppService.getWabaAccounts(accessToken)
    if (!wabaAccounts || wabaAccounts.length === 0) {
      throw new Error('No WhatsApp Business Account found')
    }
    const wabaId = wabaAccounts[0].id

    // 3. Get Phone Number ID
    const phoneNumbers = await WhatsAppService.getPhoneNumbers(wabaId, accessToken)
    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new Error('No phone numbers found in WABA')
    }
    const phoneNumberId = phoneNumbers[0].id
    const displayPhoneNumber = phoneNumbers[0].display_phone_number

    // 4. Store in database
    const { error } = await (supabase
      .from('whatsapp_connections') as any)
      .upsert({
        vendor_id: user.id,
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        status: 'active',
      }, { onConflict: 'vendor_id' })

    if (error) throw error

    // 5. Optional: Update vendor phone number if missing
    await (supabase
      .from('vendors') as any)
      .update({ phone: displayPhoneNumber })
      .eq('id', user.id)

    return { success: true, phoneNumber: displayPhoneNumber }
  } catch (error: any) {
    console.error('WhatsApp Connection Error:', error)
    return { success: false, error: error.message }
  }
}
