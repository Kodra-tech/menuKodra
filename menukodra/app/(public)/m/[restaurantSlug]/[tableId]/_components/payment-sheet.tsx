'use client'

import { useState, useEffect } from 'react'
import { Loader2, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { requestBill, getSessionTotal } from '../_actions/session'

type PaymentMethod = 'cash' | 'card_terminal' | 'stripe' | 'mercadopago'

const TIP_OPTIONS = [
  { label: 'Sin propina', value: 0 },
  { label: '10%', value: 0.1 },
  { label: '15%', value: 0.15 },
  { label: '20%', value: 0.2 },
]

interface Props {
  sessionId: string
  restaurantId: string
  tableId: string
  restaurantSlug: string
  tableLabel: string
  onStatusChange: (status: string) => void
}

export function PaymentSheet({
  sessionId,
  restaurantId,
  tableId,
  restaurantSlug,
  tableLabel,
  onStatusChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const [loadingTotal, setLoadingTotal] = useState(false)
  const [tipOption, setTipOption] = useState<number>(0.1)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadingTotal(true)
    getSessionTotal(sessionId).then((t) => {
      setTotal(t)
      setLoadingTotal(false)
    })
  }, [open, sessionId])

  const tipAmount = (total ?? 0) * tipOption
  const grandTotal = (total ?? 0) + tipAmount

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(n)

  async function handlePay() {
    setLoading(true)

    if (method === 'cash' || method === 'card_terminal') {
      const result = await requestBill(sessionId)
      if (result.success) {
        onStatusChange('paying')
        setOpen(false)
        toast.success('Cuenta solicitada. Un mesero pasará en breve.')
      } else {
        toast.error(result.error ?? 'Error al solicitar la cuenta')
        setLoading(false)
      }
      return
    }

    const endpoint =
      method === 'stripe' ? '/api/payments/stripe' : '/api/payments/mercadopago'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          restaurantId,
          tableId,
          restaurantSlug,
          tableLabel,
          tipAmount,
          customerEmail: customerEmail || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Error al iniciar el pago')
        setLoading(false)
        return
      }

      window.location.href = data.url ?? data.init_point
    } catch {
      toast.error('Error de conexión')
      setLoading(false)
    }
  }

  const METHODS: { id: PaymentMethod; label: string; desc: string; icon: React.ElementType }[] = [
    { id: 'cash', label: 'Efectivo', desc: 'Un mesero pasará a cobrar', icon: Banknote },
    {
      id: 'card_terminal',
      label: 'Tarjeta / Terminal',
      desc: 'Un mesero traerá la terminal',
      icon: CreditCard,
    },
    {
      id: 'stripe',
      label: 'Pagar con tarjeta',
      desc: 'Pago seguro en línea con Stripe',
      icon: CreditCard,
    },
    {
      id: 'mercadopago',
      label: 'MercadoPago',
      desc: 'Tarjeta, transferencia y más',
      icon: Smartphone,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full h-11">
          Solicitar la cuenta
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto pb-8">
        <SheetHeader className="mb-5">
          <SheetTitle>Resumen de cuenta</SheetTitle>
        </SheetHeader>

        {loadingTotal ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Totales */}
            <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal consumo</span>
                <span className="font-medium">{fmt(total ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Propina</span>
                <span className="font-medium">{fmt(tipAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>

            {/* Propina */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Propina sugerida</Label>
              <div className="grid grid-cols-4 gap-2">
                {TIP_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setTipOption(opt.value)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium border transition-colors',
                      tipOption === opt.value
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Método de pago</Label>
              <div className="space-y-2">
                {METHODS.map(({ id, label, desc, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
                      method === id
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400',
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p
                        className={cn(
                          'text-xs',
                          method === id ? 'text-zinc-300' : 'text-zinc-400',
                        )}
                      >
                        {desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email para recibo (solo en pagos en línea) */}
            {(method === 'stripe' || method === 'mercadopago') && (
              <div>
                <Label htmlFor="email-recibo" className="text-sm font-medium mb-1.5 block">
                  Email para recibo{' '}
                  <span className="text-zinc-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="email-recibo"
                  type="email"
                  placeholder="tu@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-10"
                />
              </div>
            )}

            <Button
              className="w-full h-12 text-base font-semibold"
              disabled={loading || total === null}
              onClick={handlePay}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {method === 'cash' || method === 'card_terminal'
                ? 'Solicitar la cuenta'
                : `Pagar ${fmt(grandTotal)}`}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
