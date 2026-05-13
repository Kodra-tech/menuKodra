import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  children: React.ReactNode
  params: Promise<{ restaurantSlug: string; tableId: string }>
}

export default async function MenuLayout({ children, params }: Props) {
  const { restaurantSlug, tableId } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, primary_color, logo_url, is_active')
    .eq('slug', restaurantSlug)
    .single()

  if (!restaurant || !restaurant.is_active) notFound()

  const { data: table } = await supabase
    .from('tables')
    .select('id, number, label, is_active')
    .eq('id', tableId)
    .eq('restaurant_id', restaurant.id)
    .single()

  if (!table || !table.is_active) notFound()

  const primaryColor = restaurant.primary_color ?? '#000000'

  return (
    <div
      className="min-h-screen bg-zinc-50"
      style={{ '--color-brand': primaryColor } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
