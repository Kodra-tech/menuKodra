import Link from 'next/link'
import { CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ restaurantSlug: string; tableId: string }>
  searchParams: Promise<{ type?: string; status?: string }>
}

export default async function ConfirmacionPage({ params, searchParams }: Props) {
  const { restaurantSlug, tableId } = await params
  const { type, status } = await searchParams

  const isPending = status === 'pending'

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
        {isPending ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2">Pago pendiente</h1>
            <p className="text-sm text-zinc-500 mb-6">
              Tu pago está siendo procesado. Recibirás una confirmación en breve.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2">¡Pago completado!</h1>
            <p className="text-sm text-zinc-500 mb-6">
              Tu pago fue procesado con éxito. ¡Gracias por tu visita!
            </p>
          </>
        )}

        <p className="text-xs text-zinc-400 mb-6">
          {type === 'stripe' ? 'Procesado con Stripe' : 'Procesado con MercadoPago'}
        </p>

        <Button asChild className="w-full">
          <Link href={`/m/${restaurantSlug}/${tableId}`}>Volver al menú</Link>
        </Button>
      </div>
    </div>
  )
}
