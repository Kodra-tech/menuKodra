import { redirect } from 'next/navigation'
import { Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CajaBoard, type CajaSession, type WaiterCall } from './_components/caja-board'

export default async function CajaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id, restaurants(name, currency)')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) redirect('/login')

  const restaurantId = staff.restaurant_id
  const restaurant = staff.restaurants as { name: string; currency: string | null } | null

  const { data: sessionsRaw } = await supabase
    .from('table_sessions')
    .select('id, status, total, opened_at, table_id, tables(id, number, label)')
    .eq('restaurant_id', restaurantId)
    .in('status', ['active', 'paying'])
    .order('opened_at', { ascending: true })

  const { data: callsRaw } = await supabase
    .from('waiter_calls')
    .select('id, table_id, session_id, status, created_at')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const sessions = (sessionsRaw ?? []) as unknown as CajaSession[]
  const calls = (callsRaw ?? []) as WaiterCall[]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="w-6 h-6 text-zinc-700" />
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Caja</h1>
          <p className="text-sm text-zinc-500">Mesas activas y cobros pendientes</p>
        </div>
      </div>

      <CajaBoard
        initialSessions={sessions}
        initialCalls={calls}
        restaurantId={restaurantId}
        currency={restaurant?.currency ?? 'MXN'}
      />
    </div>
  )
}
