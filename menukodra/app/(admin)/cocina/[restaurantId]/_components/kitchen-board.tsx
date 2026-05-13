'use client'

import { Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeOrders, type KitchenOrder } from '@/hooks/use-realtime-orders'

interface Props {
  restaurantId: string
  initialOrders: KitchenOrder[]
}

const STATUS_CONFIG = {
  received: {
    label: 'Recibido',
    color: 'border-yellow-500 bg-yellow-950',
    badge: 'bg-yellow-500 text-yellow-950',
    action: 'Aceptar',
    next: 'preparing',
  },
  preparing: {
    label: 'Preparando',
    color: 'border-blue-500 bg-blue-950',
    badge: 'bg-blue-500 text-white',
    action: 'Marcar listo',
    next: 'ready',
  },
} as const

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  return `${Math.floor(diff / 3600)}h`
}

export function KitchenBoard({ restaurantId, initialOrders }: Props) {
  const { orders } = useRealtimeOrders(restaurantId, initialOrders)

  const received = orders.filter((o) => o.status === 'received')
  const preparing = orders.filter((o) => o.status === 'preparing')

  async function updateStatus(orderId: string, newStatus: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      toast.error('Error al actualizar el estado')
    }
  }

  function renderColumn(title: string, orderList: KitchenOrder[], statusKey: 'received' | 'preparing') {
    const config = STATUS_CONFIG[statusKey]

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('text-xs font-bold px-2 py-1 rounded-full', config.badge)}>
            {orderList.length}
          </span>
          <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
        </div>

        <div className="space-y-3">
          {orderList.map((order) => (
            <div
              key={order.id}
              className={cn(
                'rounded-xl border-l-4 p-4 space-y-3',
                config.color,
              )}
            >
              {/* Header de la orden */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">
                  #{order.id.slice(-4).toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-zinc-400 text-xs">
                  <Clock className="w-3 h-3" />
                  {timeAgo(order.created_at)}
                </div>
              </div>

              {/* Items */}
              <ul className="space-y-1.5">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex gap-2 text-sm">
                    <span className="font-bold text-white min-w-[1.5rem]">{item.quantity}×</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-zinc-100">{item.name_snapshot}</span>
                      {item.special_instructions && (
                        <p className="text-xs text-zinc-400 italic mt-0.5">
                          "{item.special_instructions}"
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p className="text-xs text-zinc-400 italic border-t border-zinc-700 pt-2">
                  Nota: {order.notes}
                </p>
              )}

              {/* Botón de acción */}
              <Button
                size="sm"
                className="w-full"
                onClick={() => updateStatus(order.id, config.next)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {config.action}
              </Button>
            </div>
          ))}

          {orderList.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-700 py-10 flex flex-col items-center gap-2 text-zinc-600">
              <CheckCircle2 className="w-8 h-8 opacity-30" />
              <p className="text-xs">Sin órdenes</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" />
      {orders.length === 0 && received.length === 0 && preparing.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-600">
          <span className="text-6xl">✅</span>
          <p className="text-lg font-medium">Sin órdenes pendientes</p>
          <p className="text-sm">Las nuevas órdenes aparecerán aquí en tiempo real</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {renderColumn('Recibidas', received, 'received')}
          {renderColumn('En preparación', preparing, 'preparing')}
        </div>
      )}
    </>
  )
}
