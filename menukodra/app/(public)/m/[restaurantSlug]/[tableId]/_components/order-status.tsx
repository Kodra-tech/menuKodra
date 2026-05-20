'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Clock, ChefHat, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getSessionOrders } from '../_actions/session'

type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

type Order = {
  id: string
  status: OrderStatus
  created_at: string | null
  subtotal: number
  order_items: { id: string; name_snapshot: string; quantity: number }[]
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType; pulse?: boolean }
> = {
  received: {
    label: 'Recibido',
    color: 'text-zinc-500 dark:text-zinc-400',
    bg: 'bg-zinc-50 dark:bg-zinc-800/50',
    icon: Clock,
  },
  preparing: {
    label: 'Preparando...',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: ChefHat,
    pulse: true,
  },
  ready: {
    label: '¡Listo para recoger!',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCircle2,
  },
  delivered: {
    label: 'Entregado',
    color: 'text-zinc-400 dark:text-zinc-600',
    bg: 'bg-zinc-50 dark:bg-zinc-800/30',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: Clock,
  },
}

interface Props {
  sessionId: string
}

export function OrderStatus({ sessionId }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const refresh = async () => {
      const data = await getSessionOrders(sessionId)
      setOrders(data as Order[])
    }

    refresh().then(() => setLoaded(true))

    // Polling fallback: actualiza cada 20s si el realtime no está habilitado en la tabla
    const interval = setInterval(refresh, 20_000)

    const supabase = createClient()
    const channel = supabase
      .channel(`orders-status-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `session_id=eq.${sessionId}` },
        refresh,
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  if (!loaded || orders.length === 0) return null

  const hasActive = orders.some((o) => ['received', 'preparing', 'ready'].includes(o.status))

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {/* Header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Mis pedidos
            </span>
            {hasActive && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                En proceso
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {/* Orders list */}
        {expanded && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received
              const Icon = config.icon
              const time = order.created_at
                ? new Date(order.created_at).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''

              return (
                <div key={order.id} className={cn('px-4 py-3', config.bg)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={cn('flex items-center gap-1.5 text-xs font-semibold', config.color)}>
                      <Icon className={cn('w-3.5 h-3.5', config.pulse && 'animate-pulse')} />
                      {config.label}
                    </div>
                    <span className="text-[11px] text-zinc-400">{time}</span>
                  </div>
                  <ul className="space-y-0.5 pl-5">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="text-xs text-zinc-600 dark:text-zinc-400 list-disc">
                        {item.quantity}× {item.name_snapshot}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
