'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ItemDetailModal } from './item-detail-modal'
import type { MenuItem } from './category-tabs'

interface Props {
  item: MenuItem
  currency: string
}

const TAG_LABELS: Record<string, string> = {
  vegetariano: '🌿 Vegetariano',
  vegano: '🌱 Vegano',
  picante: '🌶️ Picante',
  sin_gluten: 'Sin gluten',
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
        className="w-full text-left bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden flex gap-3 p-3 hover:shadow-md transition-shadow active:scale-[0.99]"
      >
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-zinc-900 text-sm leading-snug">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {TAG_LABELS[tag] ?? tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-semibold text-zinc-900 text-sm">{price}</span>
            {item.prep_time_minutes && (
              <span className="text-[11px] text-zinc-400">{item.prep_time_minutes} min</span>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-100">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
            )}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-900 text-white rounded-full p-1 shadow">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      <ItemDetailModal item={item} currency={currency} open={open} onOpenChange={setOpen} />
    </>
  )
}
