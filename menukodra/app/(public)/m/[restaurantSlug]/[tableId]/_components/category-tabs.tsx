'use client'

import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ItemCard, TAG_CONFIG } from './item-card'

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
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const active = categories.find((c) => c.id === activeCategory)

  // Reset tag filter when category changes
  useEffect(() => {
    setActiveTag(null)
  }, [activeCategory])

  // Compute tags present in the current category
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    active?.menu_items.forEach((item) => {
      item.tags?.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [active])

  // Filter items by selected tag
  const filteredItems = useMemo(() => {
    if (!active) return []
    if (!activeTag) return active.menu_items
    return active.menu_items.filter((item) => item.tags?.includes(activeTag))
  }, [active, activeTag])

  return (
    <div>
      {/* Category tabs */}
      <div className="sticky top-[69px] z-30 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex overflow-x-auto scrollbar-none px-4 gap-1.5 pt-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === cat.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tag filter bar — only shows when current category has tagged items */}
        {availableTags.length > 0 && (
          <div className="flex overflow-x-auto scrollbar-none px-4 gap-1.5 pb-2 pt-1">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                'shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors',
                activeTag === null
                  ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                  : 'bg-transparent text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500',
              )}
            >
              Todo
            </button>
            {availableTags.map((tag) => {
              const config = TAG_CONFIG[tag]
              const isActive = activeTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(isActive ? null : tag)}
                  className={cn(
                    'shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors',
                    isActive
                      ? (config?.className ?? 'bg-zinc-800 text-white border-zinc-800') + ' opacity-100'
                      : 'bg-transparent text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500',
                  )}
                >
                  {config?.label ?? tag}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Item list */}
      <div className="px-4 py-4 space-y-3">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} currency={currency} />
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">
              {activeTag
                ? 'No hay platillos con ese filtro en esta categoría'
                : 'No hay platillos disponibles'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
