'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'

export function CartButton() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount)
  const total = useCartStore((s) => s.total)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || itemCount() === 0) return null

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(total())

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <button
        className="pointer-events-auto flex items-center gap-3 bg-zinc-900 text-white px-5 py-3.5 rounded-2xl shadow-xl hover:bg-zinc-800 transition-colors max-w-sm w-full"
        onClick={() => document.getElementById('cart-drawer-trigger')?.click()}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-white text-zinc-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {itemCount()}
          </span>
        </div>
        <span className="flex-1 font-medium text-sm text-left">Ver carrito</span>
        <span className="font-semibold text-sm">{formattedTotal}</span>
      </button>
    </div>
  )
}
