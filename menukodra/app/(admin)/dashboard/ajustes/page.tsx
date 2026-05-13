import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './_components/settings-form'

export default async function AjustesPage() {
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

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, slug, primary_color, currency, timezone, phone, address')
    .eq('id', staff.restaurant_id)
    .single()

  if (!restaurant) redirect('/login')

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <SettingsForm restaurant={restaurant} />
    </div>
  )
}
