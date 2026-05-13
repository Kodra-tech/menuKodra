'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useCartStore, type ModifierSelection } from '@/stores/cart-store'
import { cn } from '@/lib/utils'
import type { MenuItem } from './category-tabs'

interface Props {
  item: MenuItem
  currency: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ItemDetailModal({ item, currency, open, onOpenChange }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  // selectedModifiers[groupId] = optionId (single) | optionId[] (multiple)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string | string[]>>({})

  const modifierGroups = item.item_modifier_groups
    .map((img) => img.modifier_groups)
    .filter((g): g is NonNullable<typeof g> => g !== null)
    .sort((a, b) => (a.name > b.name ? 1 : -1))

  function getModifierPrice(): number {
    return modifierGroups.reduce((acc, group) => {
      const selected = selectedModifiers[group.id]
      if (!selected) return acc
      const ids = Array.isArray(selected) ? selected : [selected]
      return (
        acc +
        ids.reduce((s, optId) => {
          const opt = group.modifier_options.find((o) => o.id === optId)
          return s + (opt?.price_delta ?? 0)
        }, 0)
      )
    }, 0)
  }

  const unitPrice = item.price + getModifierPrice()
  const total = unitPrice * quantity

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n)

  function handleSelectSingle(groupId: string, optionId: string) {
    setSelectedModifiers((prev) => ({ ...prev, [groupId]: optionId }))
  }

  function handleToggleMultiple(groupId: string, optionId: string) {
    setSelectedModifiers((prev) => {
      const current = (prev[groupId] as string[] | undefined) ?? []
      return {
        ...prev,
        [groupId]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      }
    })
  }

  function isValid(): boolean {
    return modifierGroups.every((group) => {
      if (!group.is_required) return true
      const selected = selectedModifiers[group.id]
      if (!selected) return false
      const count = Array.isArray(selected) ? selected.length : 1
      const min = group.min_select ?? 1
      return count >= min
    })
  }

  function buildModifierSelections(): ModifierSelection[] {
    return modifierGroups.flatMap((group) => {
      const selected = selectedModifiers[group.id]
      if (!selected) return []
      const ids = Array.isArray(selected) ? selected : [selected]
      return ids.map((optId) => {
        const opt = group.modifier_options.find((o) => o.id === optId)!
        return {
          groupId: group.id,
          groupName: group.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: opt.price_delta ?? 0,
        }
      })
    })
  }

  function handleAdd() {
    if (!isValid()) {
      toast.error('Selecciona las opciones requeridas')
      return
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      modifiers: buildModifierSelections(),
      specialInstructions: instructions.trim(),
    })

    toast.success(`${item.name} agregado al carrito`)
    onOpenChange(false)

    // Reset
    setQuantity(1)
    setInstructions('')
    setSelectedModifiers({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto p-0 gap-0">
        {/* Imagen del item */}
        {item.image_url ? (
          <div className="relative w-full h-48">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="448px"
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-zinc-100 flex items-center justify-center text-5xl">
            🍽️
          </div>
        )}

        <div className="p-5 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-zinc-900">
              {item.name}
            </DialogTitle>
            {item.description && (
              <p className="text-sm text-zinc-500 mt-1">{item.description}</p>
            )}
          </DialogHeader>

          {/* Modificadores */}
          {modifierGroups.map((group) => {
            const isMultiple = group.type === 'multiple'
            const options = [...group.modifier_options].sort(
              (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
            )

            return (
              <div key={group.id}>
                <Separator className="mb-3" />
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm text-zinc-900">{group.name}</h4>
                  {group.is_required && (
                    <span className="text-[10px] bg-zinc-900 text-white px-1.5 py-0.5 rounded-full">
                      Requerido
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {options.map((opt) => {
                    const selected = selectedModifiers[group.id]
                    const isSelected = isMultiple
                      ? (selected as string[] | undefined)?.includes(opt.id) ?? false
                      : selected === opt.id

                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          isMultiple
                            ? handleToggleMultiple(group.id, opt.id)
                            : handleSelectSingle(group.id, opt.id)
                        }
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors',
                          isSelected
                            ? 'border-zinc-900 bg-zinc-50 font-medium'
                            : 'border-zinc-200 hover:border-zinc-400',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-4 h-4 border-2 flex-shrink-0 transition-colors',
                              isMultiple ? 'rounded-sm' : 'rounded-full',
                              isSelected ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300',
                            )}
                          />
                          {opt.name}
                        </div>
                        {opt.price_delta !== null && opt.price_delta !== 0 && (
                          <span className="text-zinc-500 text-xs">
                            +{formatPrice(opt.price_delta)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Instrucciones especiales */}
          <Separator />
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
              Instrucciones especiales
            </label>
            <Textarea
              placeholder="Sin cebolla, extra salsa... (opcional)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Cantidad y agregar */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 border border-zinc-200 rounded-lg p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-zinc-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-zinc-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={handleAdd}
              className="flex-1 h-10"
              disabled={!isValid()}
            >
              Agregar · {formatPrice(total)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
