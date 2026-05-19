'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Utensils } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { CategoryTabs } from './category-tabs'
import { CartDrawer } from './cart-drawer'
import { CartButton } from './cart-button'
import { SessionActions } from './session-actions'
import { OrderStatus } from './order-status'
import { ThemeToggle } from './theme-toggle'
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
  sessionStatus: string
  categories: Category[]
}

export function MenuView({ restaurant, table, sessionId, sessionStatus, categories }: Props) {
  const initSession = useCartStore((s) => s.initSession)

  useEffect(() => {
    initSession({ restaurantId: restaurant.id, tableId: table.id, sessionId })
  }, [restaurant.id, table.id, sessionId, initSession])

  const tableLabel = table.label ?? `Mesa ${table.number}`

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={40}
              height={40}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          )}

          {/* Restaurant info */}
          <div className="flex-1 min-w-0">
            <h1
              className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight truncate"
              style={{ fontFamily: 'var(--font-playfair), var(--font-karla), serif' }}
            >
              {restaurant.name}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{tableLabel}</p>
          </div>

          {/* Dark mode toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full pb-32">
        {/* Order status tracker — realtime */}
        <OrderStatus sessionId={sessionId} />

        <CategoryTabs categories={categories} currency={restaurant.currency ?? 'MXN'} />

        <SessionActions
          sessionId={sessionId}
          restaurantId={restaurant.id}
          tableId={table.id}
          restaurantSlug={restaurant.slug}
          tableLabel={tableLabel}
          sessionStatus={sessionStatus}
        />
      </main>

      {/* Floating cart */}
      <CartDrawer sessionId={sessionId} restaurantId={restaurant.id} tableId={table.id} />
      <CartButton />
      <Toaster position="top-center" richColors />
    </div>
  )
}
