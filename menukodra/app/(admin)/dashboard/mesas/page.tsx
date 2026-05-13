import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TablesManager } from './_components/tables-manager'

export default async function MesasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id, restaurants(id, slug)')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) redirect('/login')

  const restaurantId = staff.restaurant_id
  const restaurant = staff.restaurants as { id: string; slug: string } | null
  const restaurantSlug = restaurant?.slug ?? ''

  const { data: tables } = await supabase
    .from('tables')
    .select('id, number, label, is_active')
    .eq('restaurant_id', restaurantId)
    .order('number', { ascending: true })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <TablesManager
        tables={tables ?? []}
        restaurantSlug={restaurantSlug}
        appUrl={appUrl}
      />
    </div>
  )
}
