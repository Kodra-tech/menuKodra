'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getRestaurantId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('staff')
    .select('restaurant_id')
    .eq('id', user.id)
    .single()

  return data?.restaurant_id ?? null
}

export async function createTable(number: number, label: string) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase.from('tables').insert({
    restaurant_id: restaurantId,
    number,
    label: label.trim() || `Mesa ${number}`,
    is_active: true,
  })

  if (error) {
    if (error.code === '23505') return { error: `La mesa #${number} ya existe` }
    return { error: error.message }
  }
  revalidatePath('/dashboard/mesas')
  return { success: true }
}

export async function updateTable(id: string, number: number, label: string, isActive: boolean) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tables')
    .update({ number, label: label.trim(), is_active: isActive })
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) {
    if (error.code === '23505') return { error: `La mesa #${number} ya existe` }
    return { error: error.message }
  }
  revalidatePath('/dashboard/mesas')
  return { success: true }
}

export async function deleteTable(id: string) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/mesas')
  return { success: true }
}
