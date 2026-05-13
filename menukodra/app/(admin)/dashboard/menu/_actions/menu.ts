'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const name = formData.get('name') as string
  const supabase = await createClient()

  // Calcula el siguiente display_order
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)

  const { error } = await supabase.from('categories').insert({
    restaurant_id: restaurantId,
    name: name.trim(),
    display_order: (count ?? 0) + 1,
    is_active: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const name = formData.get('name') as string
  const isActive = formData.get('is_active') === 'true'
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({ name: name.trim(), is_active: isActive })
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

// ── PLATILLOS ─────────────────────────────────────────────────────────────────

type ItemInput = {
  name: string
  description: string
  price: number
  categoryId: string
  imageUrl: string | null
  tags: string[]
  prepTimeMinutes: number
  isAvailable: boolean
}

export async function createItem(input: ItemInput) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()

  const { count } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', input.categoryId)

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: restaurantId,
      category_id: input.categoryId,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      image_url: input.imageUrl,
      tags: input.tags,
      prep_time_minutes: input.prepTimeMinutes,
      is_available: input.isAvailable,
      display_order: (count ?? 0) + 1,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true, id: data.id }
}

export async function updateItem(id: string, input: ItemInput) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .update({
      category_id: input.categoryId,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      image_url: input.imageUrl,
      tags: input.tags,
      prep_time_minutes: input.prepTimeMinutes,
      is_available: input.isAvailable,
    })
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function deleteItem(id: string) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function toggleItemAvailable(id: string, isAvailable: boolean) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

// ── MODIFICADORES ─────────────────────────────────────────────────────────────

type ModifierGroupInput = {
  name: string
  type: 'single' | 'multiple'
  isRequired: boolean
  minSelect: number
  maxSelect: number | null
}

export async function createModifierGroup(input: ModifierGroupInput) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modifier_groups')
    .insert({
      restaurant_id: restaurantId,
      name: input.name.trim(),
      type: input.type,
      is_required: input.isRequired,
      min_select: input.minSelect,
      max_select: input.maxSelect,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true, id: data.id }
}

export async function deleteModifierGroup(id: string) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('modifier_groups')
    .delete()
    .eq('id', id)
    .eq('restaurant_id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function createModifierOption(groupId: string, name: string, priceDelta: number) {
  const restaurantId = await getRestaurantId()
  if (!restaurantId) return { error: 'No autorizado' }

  const supabase = await createClient()

  // Valida que el grupo pertenezca al restaurante
  const { data: group } = await supabase
    .from('modifier_groups')
    .select('id')
    .eq('id', groupId)
    .eq('restaurant_id', restaurantId)
    .single()

  if (!group) return { error: 'Grupo no encontrado' }

  const { count } = await supabase
    .from('modifier_options')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  const { error } = await supabase.from('modifier_options').insert({
    group_id: groupId,
    name: name.trim(),
    price_delta: priceDelta,
    display_order: (count ?? 0) + 1,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function deleteModifierOption(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('modifier_options').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function linkModifierToItem(itemId: string, groupId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('item_modifier_groups')
    .insert({ item_id: itemId, group_id: groupId })
    .single()
  if (error && error.code !== '23505') return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}

export async function unlinkModifierFromItem(itemId: string, groupId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('item_modifier_groups')
    .delete()
    .eq('item_id', itemId)
    .eq('group_id', groupId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/menu')
  return { success: true }
}
