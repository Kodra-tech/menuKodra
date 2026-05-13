'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { closeSession, getSessionDetail, type SessionDetailOrder } from '../_actions/caja'
import type { CajaSession } from './caja-board'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'terminal', label: 'Terminal' },
]

interface Props {
  session: CajaSession
  currency: string
  onClose: () => void
  onClosed: () => void
}

export function CheckoutModal({ session, currency, onClose, onClosed }: Props) {
  const [orders, setOrders] = useState<SessionDetailOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [method, setMethod] = useState('cash')
  const [tip, setTip] = useState('')

  const tableLabel = session.tables?.label ?? `Mesa ${session.tables?.number ?? '?'}`

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
  })

  useEffect(() => {
    getSessionDetail(session.id)
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session.id])

  async function handleCheckout() {
    setPaying(true)
    const tipAmount = parseFloat(tip) || 0
    const result = await closeSession(session.id, method, tipAmount)
    if (result.success) {
      toast.success(`${tableLabel} cerrada correctamente`)
      onClosed()
    } else {
      toast.error(result.error ?? 'Error al cobrar')
      setPaying(false)
    }
  }

  const total = session.total ?? 0
  const tipAmount = parseFloat(tip) || 0
  const grandTotal = total + tipAmount

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{tableLabel} — Cuenta</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-4 pr-1">
              {/* Lista de pedidos */}
              <div className="space-y-3">
                {orders.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-4">Sin pedidos registrados</p>
                )}
                {orders.map((order) => (
                  <div key={order.id} className="border border-zinc-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        #{order.id.slice(-6).toUpperCase()}
                      </Badge>
                      {order.created_at && (
                        <span className="text-xs text-zinc-400">
                          {new Date(order.created_at).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-0.5">
                        <span className="text-zinc-700">
                          {item.quantity}× {item.name_snapshot}
                        </span>
                        <span className="text-zinc-900 font-medium tabular-nums">
                          {formatter.format(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-xs text-zinc-400 mt-1.5 italic">Nota: {order.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-zinc-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal consumo</span>
                  <span className="tabular-nums">{formatter.format(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <Label htmlFor="tip" className="text-sm font-normal">
                    Propina (opcional)
                  </Label>
                  <div className="w-28">
                    <Input
                      id="tip"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      className="h-7 text-right text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-zinc-900 text-base pt-1 border-t border-zinc-100">
                  <span>Total a cobrar</span>
                  <span className="tabular-nums">{formatter.format(grandTotal)}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <Label className="text-sm">Método de pago</Label>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                        method === m.value
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-400',
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-zinc-100">
          <Button variant="outline" onClick={onClose} disabled={paying}>
            Cancelar
          </Button>
          <Button onClick={handleCheckout} disabled={loading || paying}>
            {paying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cobrar y cerrar mesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
