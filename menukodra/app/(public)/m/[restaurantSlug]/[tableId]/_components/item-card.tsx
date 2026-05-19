'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Utensils, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ItemDetailModal } from './item-detail-modal'
import type { MenuItem } from './category-tabs'

interface Props {
  item: MenuItem
  currency: string
}

export const TAG_CONFIG: Record<string, { label: string; className: string }> = {
  vegetariano: {
    label: 'Vegetariano',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  vegano: {
    label: 'Vegano',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  },
  picante: {
    label: 'Picante',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  },
  sin_gluten: {
    label: 'Sin gluten',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  },
}

const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  lactosa: 'Lácteos',
  nueces: 'Nueces',
  cacahuate: 'Cacahuate',
  soya: 'Soya',
  huevo: 'Huevo',
  mariscos: 'Mariscos',
  pescado: 'Pescado',
}

export function ItemCard({ item, currency }: Props) {
  const [open, setOpen] = useState(false)

  const price = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(item.price)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex gap-3 p-3 hover:shadow-md dark:hover:border-zinc-700 transition-all active:scale-[0.99]"
      >
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.map((tag) => {
                  const config = TAG_CONFIG[tag]
                  return (
                    <span
                      key={tag}
                      className={cn(
                        'inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                        config?.className ??
                          'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
                      )}
                    >
                      {config?.label ?? tag}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  Contiene:{' '}
                  {item.allergens
                    .map((a) => ALLERGEN_LABELS[a] ?? a)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{price}</span>
            {item.prep_time_minutes && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {item.prep_time_minutes} min
              </span>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Utensils className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full p-1 shadow">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      <ItemDetailModal item={item} currency={currency} open={open} onOpenChange={setOpen} />
    </>
  )
}
