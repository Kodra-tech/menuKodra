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
import { createTable, updateTable } from '../_actions/tables'

type TableRow = {
  id: string
  number: number
  label: string | null
  is_active: boolean | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  table?: TableRow | null
}

export function TableDialog({ open, onOpenChange, table }: Props) {
  const [number, setNumber] = useState('')
  const [label, setLabel] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (table) {
      setNumber(String(table.number))
      setLabel(table.label ?? '')
      setIsActive(table.is_active ?? true)
    } else {
      setNumber('')
      setLabel('')
      setIsActive(true)
    }
  }, [table, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!number) return
    setLoading(true)

    const num = parseInt(number)
    const result = table
      ? await updateTable(table.id, num, label, isActive)
      : await createTable(num, label)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(table ? 'Mesa actualizada' : 'Mesa creada')
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{table ? 'Editar mesa' : 'Nueva mesa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="table-number">Número *</Label>
              <Input
                id="table-number"
                type="number"
                min="1"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-label">Etiqueta</Label>
              <Input
                id="table-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ej: Terraza, Barra..."
              />
            </div>
          </div>
          {table && (
            <div className="flex items-center gap-3">
              <Switch id="table-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="table-active">Activa</Label>
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
