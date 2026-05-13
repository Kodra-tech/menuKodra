'use server'

import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/stores/cart-store'

type PlaceOrderInput = {
  sessionId: string
  restaurantId: string
  tableId: string
  items: CartItem[]
  notes?: string
}

type PlaceOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string }

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const { sessionId, restaurantId, tableId, items, notes } = input

  if (items.length === 0) {
    return { success: false, error: 'El carrito está vacío' }
  }

  const supabase = await createClient()

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0)
  const total = subtotal

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      session_id: sessionId,
      restaurant_id: restaurantId,
      table_id: tableId,
      status: 'received',
      subtotal,
      total,
      notes: notes ?? null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Error al crear la orden' }
  }

  const orderItems = items.flatMap((item) =>
    Array.from({ length: 1 }, () => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      name_snapshot: item.name,
      price_snapshot: item.basePrice,
      quantity: item.quantity,
      modifiers: item.modifiers.length > 0 ? item.modifiers : null,
      special_instructions: item.specialInstructions || null,
      subtotal: item.subtotal,
    })),
  )

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    return { success: false, error: 'Error al guardar los items de la orden' }
  }

  // Actualiza el total acumulado de la sesión (lectura + escritura — atómica en Sprint 2 via RPC)
  const { data: session } = await supabase
    .from('table_sessions')
    .select('total')
    .eq('id', sessionId)
    .single()

  await supabase
    .from('table_sessions')
    .update({ total: (session?.total ?? 0) + total })
    .eq('id', sessionId)

  return { success: true, orderId: order.id }
}
