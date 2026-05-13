'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ItemCard } from './item-card'
import type { CartItem } from '@/stores/cart-store'

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

export type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  tags: string[] | null
  allergens: string[] | null
  prep_time_minutes: number | null
  item_modifier_groups: {
    modifier_groups: ModifierGroup | null
  }[]
}

export type Category = {
  id: string
  name: string
  menu_items: MenuItem[]
}

interface Props {
  categories: Category[]
  currency: string
}

export function CategoryTabs({ categories, currency }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '')

  const active = categories.find((c) => c.id === activeCategory)

  return (
    <div>
      {/* Tabs de categorías */}
      <div className="sticky top-[69px] z-30 bg-white border-b border-zinc-100">
        <div className="flex overflow-x-auto scrollbar-none px-4 gap-1 py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === cat.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items de la categoría activa */}
      <div className="px-4 py-4 space-y-3">
        {active?.menu_items.map((item) => (
          <ItemCard key={item.id} item={item} currency={currency} />
        ))}

        {active?.menu_items.length === 0 && (
          <p className="text-center text-zinc-400 py-12 text-sm">
            No hay platillos disponibles en esta categoría
          </p>
        )}
      </div>
    </div>
  )
}
