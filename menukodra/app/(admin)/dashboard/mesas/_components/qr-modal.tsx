'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableLabel: string
  tableNumber: number
  qrUrl: string
}

export function QRModal({ open, onOpenChange, tableLabel, tableNumber, qrUrl }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    // Genera el QR en el cliente vía API route
    fetch(`/api/qr?url=${encodeURIComponent(qrUrl)}`)
      .then((r) => r.json())
      .then((data: { dataUrl?: string }) => setDataUrl(data.dataUrl ?? null))
      .catch(() => setDataUrl(null))
  }, [open, qrUrl])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-mesa-${tableNumber}.png`
    a.click()
  }

  const label = tableLabel || `Mesa ${tableNumber}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>QR — {label}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {dataUrl ? (
            <div className="relative w-52 h-52">
              <Image src={dataUrl} alt={`QR ${label}`} fill className="object-contain" />
            </div>
          ) : (
            <div className="w-52 h-52 bg-zinc-100 rounded-lg animate-pulse" />
          )}
          <p className="text-xs text-zinc-500 text-center break-all">{qrUrl}</p>
          <Button onClick={handleDownload} disabled={!dataUrl} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Descargar PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
