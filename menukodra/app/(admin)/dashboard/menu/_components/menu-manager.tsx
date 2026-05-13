'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { CategoryDialog } from './category-dialog'
import { ItemDialog } from './item-dialog'
import { DeleteConfirm } from './delete-confirm'
import { deleteCategory, deleteItem, toggleItemAvailable } from '../_actions/menu'

type Category = {
  id: string
  name: string
  is_active: boolean | null
  display_order: number | null
}

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  tags: string[] | null
  prep_time_minutes: number | null
  is_available: boolean | null
  display_order: number | null
}

interface Props {
  categories: Category[]
  items: Item[]
}

export function MenuManager({ categories, items }: Props) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(categories.map((c) => c.id)),
  )
  const [catDialog, setCatDialog] = useState<{ open: boolean; category?: Category | null }>({
    open: false,
  })
  const [itemDialog, setItemDialog] = useState<{
    open: boolean
    item?: Item | null
    defaultCategoryId?: string
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'category' | 'item'
    id: string
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  function toggleExpanded(catId: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return next
    })
  }

  async function handleDelete() {
    if (!deleteDialog) return
    setDeleting(true)

    const result =
      deleteDialog.type === 'category'
        ? await deleteCategory(deleteDialog.id)
        : await deleteItem(deleteDialog.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        deleteDialog.type === 'category' ? 'Categoría eliminada' : 'Platillo eliminado',
      )
      setDeleteDialog(null)
    }
    setDeleting(false)
  }

  async function handleToggleAvailable(itemId: string, current: boolean) {
    const result = await toggleItemAvailable(itemId, !current)
    if (result.error) toast.error(result.error)
  }

  return (
    <div className="space-y-4">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Menú</h1>
        <Button onClick={() => setCatDialog({ open: true, category: null })}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-zinc-400 border border-dashed rounded-xl">
          <p className="text-lg">No hay categorías todavía</p>
          <p className="text-sm mt-1">Crea una categoría para empezar a agregar platillos</p>
        </div>
      )}

      {/* Categorías */}
      {categories.map((cat) => {
        const catItems = items
          .filter((i) => i.category_id === cat.id)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        const isExpanded = expandedCats.has(cat.id)

        return (
          <div key={cat.id} className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
            {/* Header categoría */}
            <div
              className="flex items-center gap-3 px-4 py-3 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors"
              onClick={() => toggleExpanded(cat.id)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
              <span className="font-semibold text-zinc-900 flex-1">{cat.name}</span>
              <span className="text-xs text-zinc-400">{catItems.length} platillos</span>
              {!cat.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Inactiva
                </Badge>
              )}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCatDialog({ open: true, category: cat })}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() =>
                    setDeleteDialog({
                      open: true,
                      type: 'category',
                      id: cat.id,
                      name: cat.name,
                    })
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Items */}
            {isExpanded && (
              <div>
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-3 border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                  >
                    {/* Imagen */}
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-lg">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-zinc-900">{item.name}</span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-zinc-700 mt-0.5">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Toggle disponible */}
                    <Switch
                      checked={item.is_available ?? true}
                      onCheckedChange={() =>
                        handleToggleAvailable(item.id, item.is_available ?? true)
                      }
                    />

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setItemDialog({ open: true, item })}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: 'item',
                            id: item.id,
                            name: item.name,
                          })
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Agregar platillo */}
                <div className="px-4 py-3 border-t border-zinc-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-zinc-900"
                    onClick={() =>
                      setItemDialog({ open: true, item: null, defaultCategoryId: cat.id })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Agregar platillo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Dialogs */}
      <CategoryDialog
        open={catDialog.open}
        onOpenChange={(open) => setCatDialog((prev) => ({ ...prev, open }))}
        category={catDialog.category}
      />

      <ItemDialog
        open={itemDialog.open}
        onOpenChange={(open) => setItemDialog((prev) => ({ ...prev, open }))}
        item={itemDialog.item}
        categories={categories}
        defaultCategoryId={itemDialog.defaultCategoryId}
      />

      <DeleteConfirm
        open={deleteDialog?.open ?? false}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => (prev ? { ...prev, open } : null))
        }
        title={`Eliminar ${deleteDialog?.type === 'category' ? 'categoría' : 'platillo'}`}
        description={`¿Eliminar "${deleteDialog?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
