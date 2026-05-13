'use client'

import { useState } from 'react'
import { QrCode, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/sonner'
import { TableDialog } from './table-dialog'
import { QRModal } from './qr-modal'
import { DeleteConfirm } from '../../menu/_components/delete-confirm'
import { deleteTable } from '../_actions/tables'

type TableRow2 = {
  id: string
  number: number
  label: string | null
  is_active: boolean | null
}

interface Props {
  tables: TableRow2[]
  restaurantSlug: string
  appUrl: string
}

export function TablesManager({ tables, restaurantSlug, appUrl }: Props) {
  const [tableDialog, setTableDialog] = useState<{
    open: boolean
    table?: TableRow2 | null
  }>({ open: false })
  const [qrModal, setQrModal] = useState<{
    open: boolean
    table?: TableRow2
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    id: string
    number: number
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteDialog) return
    setDeleting(true)
    const result = await deleteTable(deleteDialog.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Mesa eliminada')
      setDeleteDialog(null)
    }
    setDeleting(false)
  }

  function getQrUrl(table: TableRow2) {
    return `${appUrl}/m/${restaurantSlug}/${table.id}`
  }

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Mesas</h1>
        <Button onClick={() => setTableDialog({ open: true, table: null })}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva mesa
        </Button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed rounded-xl">
          <p className="text-lg">No hay mesas todavía</p>
          <p className="text-sm mt-1">Crea mesas para generar los códigos QR</p>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead className="w-20">Número</TableHead>
                <TableHead>Etiqueta</TableHead>
                <TableHead className="w-24">Estado</TableHead>
                <TableHead className="w-32 text-right">QR</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables
                .sort((a, b) => a.number - b.number)
                .map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-semibold">#{table.number}</TableCell>
                    <TableCell>{table.label ?? `Mesa ${table.number}`}</TableCell>
                    <TableCell>
                      {table.is_active ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-500">
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQrModal({ open: true, table })}
                      >
                        <QrCode className="w-4 h-4 mr-1.5" />
                        Ver QR
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setTableDialog({ open: true, table })}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: table.id, number: table.number })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TableDialog
        open={tableDialog.open}
        onOpenChange={(open) => setTableDialog((prev) => ({ ...prev, open }))}
        table={tableDialog.table}
      />

      {qrModal.table && (
        <QRModal
          open={qrModal.open}
          onOpenChange={(open) => setQrModal((prev) => ({ ...prev, open }))}
          tableNumber={qrModal.table.number}
          tableLabel={qrModal.table.label ?? ''}
          qrUrl={getQrUrl(qrModal.table)}
        />
      )}

      <DeleteConfirm
        open={deleteDialog?.open ?? false}
        onOpenChange={(open) => setDeleteDialog((prev) => (prev ? { ...prev, open } : null))}
        title="Eliminar mesa"
        description={`¿Eliminar la mesa #${deleteDialog?.number}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
