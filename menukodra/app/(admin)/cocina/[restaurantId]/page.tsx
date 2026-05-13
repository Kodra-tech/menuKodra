import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KitchenBoard } from './_components/kitchen-board'

interface Props {
  params: Promise<{ restaurantId: string }>
}

export default async function CocinaPage({ params }: Props) {
  const { restaurantId } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('id', restaurantId)
    .single()

  if (!restaurant) notFound()

  // Mesas del restaurante para el lookup
  const { data: tablesData } = await supabase
    .from('tables')
    .select('id, number, label')
    .eq('restaurant_id', restaurantId)

  const tablesMap = Object.fromEntries(
    (tablesData ?? []).map((t) => [t.id, { number: t.number, label: t.label }]),
  )

  // Órdenes activas (received + preparing)
  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, status, created_at, notes, subtotal, total, table_id, order_items(id, name_snapshot, quantity, modifiers, special_instructions, subtotal)',
    )
    .eq('restaurant_id', restaurantId)
    .in('status', ['received', 'preparing'])
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">🍳 Cocina</h1>
            <p className="text-sm text-zinc-400">{restaurant.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-zinc-400">En vivo</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <KitchenBoard
          restaurantId={restaurantId}
          initialOrders={(orders ?? []) as Parameters<typeof KitchenBoard>[0]['initialOrders']}
          tablesMap={tablesMap}
        />
      </main>
    </div>
  )
}
