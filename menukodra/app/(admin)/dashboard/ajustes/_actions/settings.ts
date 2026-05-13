'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SettingsInput = {
  name: string
  slug: string
  primaryColor: string
  currency: string
  timezone: string
  phone: string
  address: string
}

export async function updateSettings(input: SettingsInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('restaurants')
    .update({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      primary_color: input.primaryColor,
      currency: input.currency,
      timezone: input.timezone,
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
    })
    .eq('id', staff.restaurant_id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/ajustes')
  return { success: true }
}
