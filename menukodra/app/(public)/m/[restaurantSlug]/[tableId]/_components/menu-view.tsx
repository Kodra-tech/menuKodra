'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart-store'
import { CategoryTabs } from './category-tabs'
import { CartDrawer } from './cart-drawer'
import { CartButton } from './cart-button'
import { Toaster } from '@/components/ui/sonner'

type ModifierOption = {
  id: string
  name: string
  price_delta: number | null
  display_order: number | null
}

type ModifierGroup = {
  id: string
  name: string
  type: string | null
  is_required: boolean | null
  min_select: number | null
  max_select: number | null
  modifier_options: ModifierOption[]
}

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  tags: string[] | null
  allergens: string[] | null
  prep_time_minutes: number | null
  is_available: boolean | null
  display_order: number | null
  item_modifier_groups: {
    modifier_groups: ModifierGroup | null
  }[]
}

type Category = {
  id: string
  name: string
  description: string | null
  display_order: number | null
  menu_items: MenuItem[]
}

type Restaurant = {
  id: string
  name: string
  slug: string
  primary_color: string | null
  logo_url: string | null
  currency: string | null
}

type Table = {
  id: string
  number: number
  label: string | null
}

interface Props {
  restaurant: Restaurant
  table: Table
  sessionId: string
  categories: Category[]
}

export function MenuView({ restaurant, table, sessionId, categories }: Props) {
  const initSession = useCartStore((s) => s.initSession)

  useEffect(() => {
    initSession({
      restaurantId: restaurant.id,
      tableId: table.id,
      sessionId,
    })
  }, [restaurant.id, table.id, sessionId, initSession])

  const tableLabel = table.label ?? `Mesa ${table.number}`

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-500">
              {restaurant.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-semibold text-zinc-900 text-base leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-xs text-zinc-500">{tableLabel}</p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-2xl mx-auto w-full pb-28">
        <CategoryTabs categories={categories} currency={restaurant.currency ?? 'MXN'} />
      </main>

      {/* Carrito flotante */}
      <CartDrawer sessionId={sessionId} restaurantId={restaurant.id} tableId={table.id} />
      <CartButton />
      <Toaster position="top-center" richColors />
    </div>
  )
}
