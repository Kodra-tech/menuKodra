'use client'

import { useState } from 'react'
import { BellRing, CheckCircle, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { requestBill, callWaiter } from '../_actions/session'

interface Props {
  sessionId: string
  restaurantId: string
  tableId: string
  sessionStatus: string
}

export function SessionActions({
  sessionId,
  restaurantId,
  tableId,
  sessionStatus: initialStatus,
}: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [requestingBill, setRequestingBill] = useState(false)
  const [callingWaiter, setCallingWaiter] = useState(false)

  async function handleRequestBill() {
    setRequestingBill(true)
    const result = await requestBill(sessionId)
    if (result.success) {
      setStatus('paying')
      toast.success('Cuenta solicitada. Un mesero pasará en breve.')
    } else {
      toast.error(result.error ?? 'Error al solicitar la cuenta')
      setRequestingBill(false)
    }
  }

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
        <Button
          variant="outline"
          className="w-full h-11"
          disabled={requestingBill}
          onClick={handleRequestBill}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Solicitar la cuenta
        </Button>
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
