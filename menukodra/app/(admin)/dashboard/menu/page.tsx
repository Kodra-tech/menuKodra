import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MenuManager } from './_components/menu-manager'

export default async function MenuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) redirect('/login')

  const restaurantId = staff.restaurant_id

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, is_active, display_order')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('id, name, description, price, category_id, image_url, tags, prep_time_minutes, is_available, display_order')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true }),
  ])

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <MenuManager categories={categories ?? []} items={items ?? []} />
    </div>
  )
}
