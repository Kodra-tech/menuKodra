import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MenuView } from './_components/menu-view'

interface Props {
  params: Promise<{ restaurantSlug: string; tableId: string }>
}

export default async function MenuPage({ params }: Props) {
  const { restaurantSlug, tableId } = await params
  const supabase = await createClient()

  // Restaurante
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, slug, primary_color, logo_url, currency')
    .eq('slug', restaurantSlug)
    .single()

  if (!restaurant) notFound()

  // Mesa
  const { data: table } = await supabase
    .from('tables')
    .select('id, number, label')
    .eq('id', tableId)
    .eq('restaurant_id', restaurant.id)
    .single()

  if (!table) notFound()

  // Sesión activa o en proceso de pago; si está cerrada, crea una nueva
  const { data: existingSession } = await supabase
    .from('table_sessions')
    .select('id, status')
    .eq('table_id', table.id)
    .eq('restaurant_id', restaurant.id)
    .in('status', ['active', 'paying'])
    .maybeSingle()

  let sessionId = existingSession?.id
  let sessionStatus = existingSession?.status ?? 'active'

  if (!sessionId) {
    const { data: newSession } = await supabase
      .from('table_sessions')
      .insert({ table_id: table.id, restaurant_id: restaurant.id, status: 'active' })
      .select('id')
      .single()

    sessionId = newSession?.id
    sessionStatus = 'active'
  }

  if (!sessionId) {
    throw new Error('No se pudo obtener o crear la sesión de mesa')
  }

  // Categorías activas con sus items
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id, name, description, display_order,
      menu_items (
        id, name, description, price, image_url,
        tags, allergens, prep_time_minutes, is_available,
        display_order,
        item_modifier_groups (
          modifier_groups (
            id, name, type, is_required, min_select, max_select,
            modifier_options ( id, name, price_delta, display_order )
          )
        )
      )
    `)
    .eq('restaurant_id', restaurant.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Filtra items no disponibles y ordena
  const categoriesWithItems = (categories ?? [])
    .map((cat) => ({
      ...cat,
      menu_items: (cat.menu_items ?? [])
        .filter((item) => item.is_available !== false)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    }))
    .filter((cat) => cat.menu_items.length > 0)

  return (
    <MenuView
      restaurant={restaurant}
      table={table}
      sessionId={sessionId}
      sessionStatus={sessionStatus}
      categories={categoriesWithItems}
    />
  )
}
