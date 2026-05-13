'use client'

import { useEffect, useState } from 'react'
import { BellRing, Clock, CreditCard, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CheckoutModal } from './checkout-modal'
import { acknowledgeCall } from '../_actions/caja'

export type CajaSession = {
  id: string
  status: string | null
  total: number | null
  opened_at: string | null
  table_id: string | null
  tables: { id: string; number: number; label: string | null } | null
}

export type WaiterCall = {
  id: string
  table_id: string
  session_id: string
  status: string
  created_at: string | null
}

interface Props {
  initialSessions: CajaSession[]
  initialCalls: WaiterCall[]
  restaurantId: string
  currency: string
}

export function CajaBoard({ initialSessions, initialCalls, restaurantId, currency }: Props) {
  const [sessions, setSessions] = useState<CajaSession[]>(initialSessions)
  const [calls, setCalls] = useState<WaiterCall[]>(initialCalls)
  const [selectedSession, setSelectedSession] = useState<CajaSession | null>(null)

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
  })

  useEffect(() => {
    const supabase = createClient()

    const sessionsChannel = supabase
      .channel(`caja-sessions-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_sessions',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newStatus = payload.new.status as string
            if (newStatus === 'active' || newStatus === 'paying') {
              const { data } = await supabase
                .from('table_sessions')
                .select('id, status, total, opened_at, table_id, tables(id, number, label)')
                .eq('id', payload.new.id)
                .single()
              if (data) {
                setSessions((prev) => [...prev, data as CajaSession])
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedStatus = payload.new.status as string
            if (updatedStatus === 'closed') {
              setSessions((prev) => prev.filter((s) => s.id !== payload.new.id))
            } else {
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === payload.new.id
                    ? { ...s, status: updatedStatus, total: payload.new.total as number }
                    : s,
                ),
              )
            }
          }
        },
      )
      .subscribe()

    const callsChannel = supabase
      .channel(`caja-calls-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiter_calls',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCalls((prev) => [...prev, payload.new as WaiterCall])
          } else if (payload.eventType === 'UPDATE') {
            if ((payload.new as WaiterCall).status === 'acknowledged') {
              setCalls((prev) => prev.filter((c) => c.id !== payload.new.id))
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sessionsChannel)
      supabase.removeChannel(callsChannel)
    }
  }, [restaurantId])

  async function handleAcknowledgeCall(callId: string) {
    setCalls((prev) => prev.filter((c) => c.id !== callId))
    await acknowledgeCall(callId)
  }

  const pendingCalls = calls.filter((c) => c.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Banner de llamadas al mesero */}
      {pendingCalls.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BellRing className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-900 text-sm">
              {pendingCalls.length === 1
                ? '1 llamada pendiente'
                : `${pendingCalls.length} llamadas pendientes`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingCalls.map((call) => {
              const session = sessions.find((s) => s.id === call.session_id)
              const tableLabel =
                session?.tables?.label ?? `Mesa ${session?.tables?.number ?? '?'}`
              return (
                <div
                  key={call.id}
                  className="flex items-center gap-2 bg-white border border-amber-200 rounded-md px-3 py-1.5"
                >
                  <span className="text-sm font-medium text-zinc-900">{tableLabel}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-amber-700 hover:text-amber-900 px-2"
                    onClick={() => handleAcknowledgeCall(call.id)}
                  >
                    Atender
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid de mesas */}
      {sessions.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay mesas activas en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sessions.map((session) => {
            const tableLabel =
              session.tables?.label ?? `Mesa ${session.tables?.number ?? '?'}`
            const isPaying = session.status === 'paying'
            const sessionPendingCalls = pendingCalls.filter(
              (c) => c.session_id === session.id,
            )
            const openedAt = session.opened_at ? new Date(session.opened_at) : null

            return (
              <Card
                key={session.id}
                className={cn(
                  'p-4 flex flex-col gap-3 transition-shadow hover:shadow-md',
                  isPaying ? 'border-amber-300 bg-amber-50' : 'border-zinc-200 bg-white',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-900 truncate">{tableLabel}</h3>
                    {openedAt && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        {getElapsed(openedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant={isPaying ? 'default' : 'secondary'}
                      className={
                        isPaying ? 'bg-amber-500 hover:bg-amber-500 text-white' : ''
                      }
                    >
                      {isPaying ? 'Pagando' : 'Activa'}
                    </Badge>
                    {sessionPendingCalls.length > 0 && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <BellRing className="w-3 h-3" />
                        Llamada
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-2xl font-bold text-zinc-900 tabular-nums">
                  {formatter.format(session.total ?? 0)}
                </div>

                <Button
                  size="sm"
                  className={cn(
                    'w-full',
                    isPaying
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                      : '',
                  )}
                  variant={isPaying ? 'default' : 'outline'}
                  onClick={() => setSelectedSession(session)}
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  {isPaying ? 'Cobrar' : 'Ver cuenta'}
                </Button>
              </Card>
            )
          })}
        </div>
      )}

      {selectedSession && (
        <CheckoutModal
          session={selectedSession}
          currency={currency}
          onClose={() => setSelectedSession(null)}
          onClosed={() => {
            setSessions((prev) => prev.filter((s) => s.id !== selectedSession.id))
            setSelectedSession(null)
          }}
        />
      )}
    </div>
  )
}

function getElapsed(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Justo ahora'
  if (diffMin < 60) return `${diffMin} min`
  const hours = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  return `${hours}h ${mins}m`
}
