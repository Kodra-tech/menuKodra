'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSessionOrders(sessionId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('id, status, created_at, subtotal, order_items(id, name_snapshot, quantity)')
      .eq('session_id', sessionId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })
    return data ?? []
  } catch {
    return []
  }
}

export async function getSessionTotal(sessionId: string): Promise<number> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('total')
      .eq('session_id', sessionId)
      .neq('status', 'cancelled')

    return (data ?? []).reduce((acc, o) => acc + (o.total ?? 0), 0)
  } catch {
    return 0
  }
}

export type SessionSummaryItem = {
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export async function getSessionSummary(
  sessionId: string,
): Promise<{ items: SessionSummaryItem[]; total: number }> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('total, order_items(name_snapshot, quantity, price_snapshot, subtotal)')
      .eq('session_id', sessionId)
      .neq('status', 'cancelled')

    const items: SessionSummaryItem[] = (data ?? []).flatMap((order) =>
      (order.order_items ?? []).map((item) => ({
        name: item.name_snapshot,
        quantity: item.quantity,
        unitPrice: item.price_snapshot ?? 0,
        subtotal: item.subtotal ?? 0,
      })),
    )

    const total = (data ?? []).reduce((acc, o) => acc + (o.total ?? 0), 0)
    return { items, total }
  } catch {
    return { items: [], total: 0 }
  }
}

export async function requestBill(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('table_sessions')
      .update({ status: 'paying' })
      .eq('id', sessionId)
      .eq('status', 'active')

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'Error al solicitar la cuenta' }
  }
}

export async function callWaiter(
  sessionId: string,
  restaurantId: string,
  tableId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('waiter_calls')
      .insert({ session_id: sessionId, restaurant_id: restaurantId, table_id: tableId })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'Error al llamar al mesero' }
  }
}
