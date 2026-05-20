'use client'

import { useState, useTransition } from 'react'
import { Download, FileText, TrendingUp, Receipt, Users, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  getReporteData,
  type DailySales,
  type TopItem,
  type ReporteSummary,
} from '../_actions/reportes'

const RANGES = [
  { label: 'Hoy', days: 0 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: 'Este mes', days: -1 },
] as const

function dateRange(days: number): { from: string; to: string } {
  const today = new Date()
  const to = today.toISOString().slice(0, 10)
  if (days === -1) {
    const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    return { from, to }
  }
  if (days === 0) return { from: to, to }
  const from = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)
  return { from, to }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function exportCSV(daily: DailySales[], topItems: TopItem[], range: string) {
  const lines: string[] = []

  lines.push(`Reporte de ventas — ${range}`)
  lines.push('')
  lines.push('Ventas por día')
  lines.push('Fecha,Sesiones,Ventas,Propina,Total')
  for (const row of daily) {
    lines.push(
      [fmtDate(row.date), row.sesiones, row.ventas.toFixed(2), row.propina.toFixed(2), (row.ventas + row.propina).toFixed(2)].join(','),
    )
  }

  lines.push('')
  lines.push('Top platillos')
  lines.push('Platillo,Cantidad vendida,Ingresos')
  for (const item of topItems) {
    lines.push([`"${item.name}"`, item.qty, item.revenue.toFixed(2)].join(','))
  }

  const csv = '﻿' + lines.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-${range.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  initialSummary: ReporteSummary
  initialDaily: DailySales[]
  initialTopItems: TopItem[]
}

export function ReportesView({ initialSummary, initialDaily, initialTopItems }: Props) {
  const [activeRange, setActiveRange] = useState(2) // default: 30 días
  const [summary, setSummary] = useState(initialSummary)
  const [daily, setDaily] = useState(initialDaily)
  const [topItems, setTopItems] = useState(initialTopItems)
  const [isPending, startTransition] = useTransition()

  function handleRangeChange(idx: number) {
    setActiveRange(idx)
    const { from, to } = dateRange(RANGES[idx].days)
    startTransition(async () => {
      const data = await getReporteData(from, to)
      setSummary(data.summary)
      setDaily(data.daily)
      setTopItems(data.topItems)
    })
  }

  const maxDayVentas = daily.reduce((m, d) => Math.max(m, d.ventas), 1)
  const rangeLabel = RANGES[activeRange].label

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 print:p-2">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Reportes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Ventas, platillos y ticket promedio</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(daily, topItems, rangeLabel)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Se abrirá el diálogo de impresión. Elige "Guardar como PDF".')
              setTimeout(() => window.print(), 300)
            }}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Print title */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold">Reporte de ventas — {rangeLabel}</h1>
        <p className="text-sm text-zinc-500">Generado el {new Date().toLocaleDateString('es-MX')}</p>
      </div>

      {/* Range selector */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg w-fit print:hidden">
        {RANGES.map((r, idx) => (
          <button
            key={r.label}
            onClick={() => handleRangeChange(idx)}
            disabled={isPending}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeRange === idx
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="Ventas totales"
          value={fmt(summary.totalVentas)}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KpiCard
          icon={Banknote}
          label="Propina total"
          value={fmt(summary.totalPropina)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          icon={Receipt}
          label="Ticket promedio"
          value={fmt(summary.ticketPromedio)}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <KpiCard
          icon={Users}
          label="Sesiones cerradas"
          value={summary.totalSesiones.toString()}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Ventas por día */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">Ventas por día</h2>
        {daily.length === 0 ? (
          <p className="text-sm text-zinc-400 py-6 text-center">Sin datos en el período seleccionado</p>
        ) : (
          <div
            className={cn(
              'rounded-xl border border-zinc-200 overflow-hidden',
              isPending && 'opacity-50 pointer-events-none',
            )}
          >
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-zinc-600">Fecha</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-zinc-600">Sesiones</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-zinc-600">Ventas</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-zinc-600">Propina</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-zinc-600">Total</th>
                  <th className="px-4 py-2.5 w-32 print:hidden" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {daily.map((row) => (
                  <tr key={row.date} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-700 font-medium">{fmtDate(row.date)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-600">{row.sesiones}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-700">{fmt(row.ventas)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-500">{fmt(row.propina)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-zinc-900">
                      {fmt(row.ventas + row.propina)}
                    </td>
                    {/* Mini bar chart */}
                    <td className="px-4 py-2.5 print:hidden">
                      <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round((row.ventas / maxDayVentas) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Separator />

      {/* Top platillos */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">Top 10 platillos</h2>
        {topItems.length === 0 ? (
          <p className="text-sm text-zinc-400 py-6 text-center">Sin datos en el período seleccionado</p>
        ) : (
          <div
            className={cn(
              'rounded-xl border border-zinc-200 overflow-hidden',
              isPending && 'opacity-50 pointer-events-none',
            )}
          >
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-zinc-600">#</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-zinc-600">Platillo</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-zinc-600">Cantidad</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-zinc-600">Ingresos</th>
                  <th className="px-4 py-2.5 w-32 print:hidden" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topItems.map((item, idx) => {
                  const maxRevenue = topItems[0].revenue
                  return (
                    <tr key={item.name} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-400 font-medium w-8">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-zinc-900 font-medium">{item.name}</td>
                      <td className="px-4 py-2.5 text-right text-zinc-700">{item.qty}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-zinc-900">
                        {fmt(item.revenue)}
                      </td>
                      {/* Mini bar */}
                      <td className="px-4 py-2.5 print:hidden">
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-400 h-2 rounded-full transition-all"
                            style={{ width: `${Math.round((item.revenue / maxRevenue) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  bg: string
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
      <div className={cn('p-2 rounded-lg', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 leading-tight">{label}</p>
        <p className="text-lg font-bold text-zinc-900 mt-0.5 tabular-nums">{value}</p>
      </div>
    </div>
  )
}
