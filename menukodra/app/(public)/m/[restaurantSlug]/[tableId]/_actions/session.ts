'use server'

import { createClient } from '@/lib/supabase/server'

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
