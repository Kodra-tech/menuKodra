'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createCategory, updateCategory } from '../_actions/menu'

type Category = {
  id: string
  name: string
  is_active: boolean | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}

export function CategoryDialog({ open, onOpenChange, category }: Props) {
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setIsActive(category.is_active ?? true)
    } else {
      setName('')
      setIsActive(true)
    }
  }, [category, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const fd = new FormData()
    fd.set('name', name)
    fd.set('is_active', String(isActive))

    const result = category
      ? await updateCategory(category.id, fd)
      : await createCategory(fd)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada')
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Entradas, Bebidas..."
              required
            />
          </div>
          {category && (
            <div className="flex items-center gap-3">
              <Switch
                id="cat-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="cat-active">Activa</Label>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
