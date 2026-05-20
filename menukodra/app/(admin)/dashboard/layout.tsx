import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './_components/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: staff } = await supabase
    .from('staff')
    .select('restaurant_id, name, restaurants(id, name)')
    .eq('id', user.id)
    .single()

  if (!staff?.restaurant_id) redirect('/login')

  const restaurant = staff.restaurants as { id: string; name: string } | null
  const restaurantName = restaurant?.name ?? 'Restaurante'

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar restaurantName={restaurantName} userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Toaster position="top-center" richColors />
    </div>
  )
}
