'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getRestaurantId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) throw new Error('Sin restaurante asociado')
  return staff.restaurant_id
}

export async function closeSession(
  sessionId: string,
  paymentMethod: string,
  tip: number = 0,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const restaurantId = await getRestaurantId()

    const { data: session } = await supabase
      .from('table_sessions')
      .select('total, status')
      .eq('id', sessionId)
      .eq('restaurant_id', restaurantId)
      .single()

    if (!session) return { success: false, error: 'Sesión no encontrada' }
    if (session.status === 'closed') return { success: false, error: 'La mesa ya fue cerrada' }

    const amount = session.total ?? 0

    const { error: paymentError } = await supabase.from('payments').insert({
      restaurant_id: restaurantId,
      session_id: sessionId,
      amount,
      tip,
      method: paymentMethod,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })

    if (paymentError) return { success: false, error: paymentError.message }

    const { error: sessionError } = await supabase
      .from('table_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('restaurant_id', restaurantId)

    if (sessionError) return { success: false, error: sessionError.message }

    revalidatePath('/dashboard/caja')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

export async function acknowledgeCall(
  callId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    await getRestaurantId()

    const { error } = await supabase
      .from('waiter_calls')
      .update({ status: 'acknowledged' })
      .eq('id', callId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

export type SessionDetailOrder = {
  id: string
  status: string | null
  created_at: string | null
  notes: string | null
  subtotal: number
  total: number
  order_items: {
    id: string
    name_snapshot: string
    quantity: number
    price_snapshot: number
    subtotal: number
    special_instructions: string | null
  }[]
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetailOrder[]> {
  const supabase = await createClient()
  await getRestaurantId()

  const { data } = await supabase
    .from('orders')
    .select(
      'id, status, created_at, notes, subtotal, total, order_items(id, name_snapshot, quantity, price_snapshot, subtotal, special_instructions)',
    )
    .eq('session_id', sessionId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })

  return (data ?? []) as SessionDetailOrder[]
}
