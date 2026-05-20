'use server'

import { createClient } from '@/lib/supabase/server'

async function getRestaurantId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) throw new Error('Sin restaurante asociado')
  return staff.restaurant_id
}

export type DailySales = {
  date: string
  ventas: number
  propina: number
  sesiones: number
}

export type TopItem = {
  name: string
  qty: number
  revenue: number
}

export type ReporteSummary = {
  totalVentas: number
  totalPropina: number
  ticketPromedio: number
  totalSesiones: number
}

export type ReporteData = {
  summary: ReporteSummary
  daily: DailySales[]
  topItems: TopItem[]
}

export async function getReporteData(from: string, to: string): Promise<ReporteData> {
  const supabase = await createClient()
  const restaurantId = await getRestaurantId()

  const fromTs = `${from}T00:00:00`
  const toTs = `${to}T23:59:59`

  // ── Pagos del período ──────────────────────────────────────────────
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, tip, method, paid_at')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'completed')
    .gte('paid_at', fromTs)
    .lte('paid_at', toTs)
    .order('paid_at')

  // ── Ventas por día ─────────────────────────────────────────────────
  const dailyMap = new Map<string, DailySales>()
  for (const p of payments ?? []) {
    if (!p.paid_at) continue
    const date = p.paid_at.slice(0, 10)
    const curr = dailyMap.get(date) ?? { date, ventas: 0, propina: 0, sesiones: 0 }
    curr.ventas += p.amount ?? 0
    curr.propina += p.tip ?? 0
    curr.sesiones += 1
    dailyMap.set(date, curr)
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // ── Summary ────────────────────────────────────────────────────────
  const totalVentas = (payments ?? []).reduce((s, p) => s + (p.amount ?? 0), 0)
  const totalPropina = (payments ?? []).reduce((s, p) => s + (p.tip ?? 0), 0)
  const totalSesiones = (payments ?? []).length
  const ticketPromedio = totalSesiones > 0 ? totalVentas / totalSesiones : 0

  // ── Top platillos ──────────────────────────────────────────────────
  const { data: orders } = await supabase
    .from('orders')
    .select('order_items(name_snapshot, quantity, subtotal)')
    .eq('restaurant_id', restaurantId)
    .neq('status', 'cancelled')
    .gte('created_at', fromTs)
    .lte('created_at', toTs)

  const itemMap = new Map<string, TopItem>()
  for (const order of orders ?? []) {
    for (const item of (order.order_items as { name_snapshot: string; quantity: number; subtotal: number }[]) ?? []) {
      const curr = itemMap.get(item.name_snapshot) ?? {
        name: item.name_snapshot,
        qty: 0,
        revenue: 0,
      }
      curr.qty += item.quantity ?? 0
      curr.revenue += item.subtotal ?? 0
      itemMap.set(item.name_snapshot, curr)
    }
  }
  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10)

  return {
    summary: { totalVentas, totalPropina, ticketPromedio, totalSesiones },
    daily,
    topItems,
  }
}
