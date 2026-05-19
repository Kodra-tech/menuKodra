'use client'

import { useState } from 'react'
import { BellRing, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PaymentSheet } from './payment-sheet'
import { callWaiter } from '../_actions/session'

interface Props {
  sessionId: string
  restaurantId: string
  tableId: string
  restaurantSlug: string
  tableLabel: string
  sessionStatus: string
}

export function SessionActions({
  sessionId,
  restaurantId,
  tableId,
  restaurantSlug,
  tableLabel,
  sessionStatus: initialStatus,
}: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [callingWaiter, setCallingWaiter] = useState(false)

  async function handleCallWaiter() {
    setCallingWaiter(true)
    const result = await callWaiter(sessionId, restaurantId, tableId)
    if (result.success) {
      toast.success('Mesero notificado. Llegará en breve.')
    } else {
      toast.error(result.error ?? 'Error al llamar al mesero')
    }
    setCallingWaiter(false)
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-6 flex flex-col gap-2">
      {status === 'paying' ? (
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50 border border-amber-200">
          <CheckCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">
            Cuenta solicitada — un mesero pasará pronto
          </span>
        </div>
      ) : (
        <PaymentSheet
          sessionId={sessionId}
          restaurantId={restaurantId}
          tableId={tableId}
          restaurantSlug={restaurantSlug}
          tableLabel={tableLabel}
          onStatusChange={setStatus}
        />
      )}

      <Button
        variant="ghost"
        className="w-full h-11 text-zinc-600"
        disabled={callingWaiter}
        onClick={handleCallWaiter}
      >
        <BellRing className="w-4 h-4 mr-2" />
        Llamar al mesero
      </Button>
    </div>
  )
}
