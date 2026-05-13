'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OrderItem = {
  id: string
  name_snapshot: string
  quantity: number
  modifiers: unknown
  special_instructions: string | null
  subtotal: number
}

export type KitchenOrder = {
  id: string
  status: string
  created_at: string | null
  notes: string | null
  subtotal: number
  total: number
  table_id: string | null
  order_items: OrderItem[]
}

export function useRealtimeOrders(restaurantId: string, initialOrders: KitchenOrder[]) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`kitchen-orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the full order with items
            const { data } = await supabase
              .from('orders')
              .select('id, status, created_at, notes, subtotal, total, table_id, order_items(id, name_snapshot, quantity, modifiers, special_instructions, subtotal)')
              .eq('id', payload.new.id)
              .single()

            if (data) {
              setOrders((prev) => [data as KitchenOrder, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedStatus = payload.new.status as string
            setOrders((prev) =>
              prev
                .map((o) => (o.id === payload.new.id ? { ...o, status: updatedStatus } : o))
                // Elimina las órdenes completadas o canceladas de la vista
                .filter((o) => !['delivered', 'cancelled'].includes(o.status)),
            )
          }
        },
      )
      .subscribe((status, err) => {
        console.log('[Realtime Kitchen] status:', status, err ?? '')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  return { orders, setOrders }
}
