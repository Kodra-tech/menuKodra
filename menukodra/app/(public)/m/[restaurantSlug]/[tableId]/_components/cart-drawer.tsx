'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart-store'
import { placeOrder } from '../_actions/order'

interface Props {
  sessionId: string
  restaurantId: string
  tableId: string
}

export function CartDrawer({ sessionId, restaurantId, tableId }: Props) {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const incrementItem = useCartStore((s) => s.incrementItem)
  const decrementItem = useCartStore((s) => s.decrementItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearItems = useCartStore((s) => s.clearItems)

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(total())

  async function handlePlaceOrder() {
    if (items.length === 0) return
    setLoading(true)

    const result = await placeOrder({ sessionId, restaurantId, tableId, items })

    if (result.success) {
      clearItems()
      setOpen(false)
      toast.success('Orden enviada a cocina')
    } else {
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger id="cart-drawer-trigger" className="sr-only">
        Abrir carrito
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[85dvh] flex flex-col rounded-t-2xl px-0">
        <SheetHeader className="px-5 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Tu pedido
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-zinc-400">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="text-sm">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {items.map((item) => (
                <div key={item.cartId} className="flex gap-3">
                  {/* Controles de cantidad */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => incrementItem(item.cartId)}
                      className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-950 dark:border dark:border-zinc-600 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-7 text-center">{item.quantity}</span>
                    <button
                      onClick={() => decrementItem(item.cartId)}
                      className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-950 dark:border dark:border-zinc-600 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info del item */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900">{item.name}</p>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {item.modifiers.map((m) => m.optionName).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-xs text-zinc-400 mt-0.5 italic line-clamp-1">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>

                  {/* Precio y eliminar */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-sm text-zinc-900">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                        minimumFractionDigits: 0,
                      }).format(item.subtotal)}
                    </span>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">Total del pedido</span>
                <span className="font-bold text-lg text-zinc-900">{formattedTotal}</span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Ordenar ahora 🍳'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
