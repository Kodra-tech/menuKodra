'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type OnboardingInput = {
  restaurantName: string
  slug: string
  primaryColor: string
  tablesCount: number
}

export async function createRestaurant(
  input: OnboardingInput,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Verificar que el slug no exista
  const { data: existing } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle()

  if (existing) return { error: 'Ese identificador ya está en uso. Elige otro.' }

  // Crear restaurante
  const { data: restaurant, error: rError } = await supabase
    .from('restaurants')
    .insert({
      name: input.restaurantName.trim(),
      slug: input.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      primary_color: input.primaryColor,
      currency: 'MXN',
      timezone: 'America/Monterrey',
    })
    .select('id')
    .single()

  if (rError || !restaurant) return { error: rError?.message ?? 'Error al crear el restaurante' }

  // Crear registro de staff (admin)
  const { error: sError } = await supabase.from('staff').insert({
    id: user.id,
    restaurant_id: restaurant.id,
    role: 'admin',
    name: user.email?.split('@')[0] ?? 'Admin',
  })

  if (sError) return { error: sError.message }

  // Crear mesas
  const tables = Array.from({ length: input.tablesCount }, (_, i) => ({
    restaurant_id: restaurant.id,
    number: i + 1,
    label: `Mesa ${i + 1}`,
  }))

  const { error: tError } = await supabase.from('tables').insert(tables)
  if (tError) return { error: tError.message }

  redirect('/dashboard/menu')
}
