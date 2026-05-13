'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, UtensilsCrossed, QrCode, Settings, LogOut, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Props {
  restaurantName: string
  userEmail: string
}

const NAV = [
  { href: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/dashboard/mesas', label: 'Mesas', icon: QrCode },
  { href: '/dashboard/cocina', label: 'Cocina', icon: LayoutGrid },
  { href: '/dashboard/caja', label: 'Caja', icon: Receipt },
  { href: '/dashboard/ajustes', label: 'Ajustes', icon: Settings },
]

export function Sidebar({ restaurantName, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full">
      {/* Logo + nombre restaurante */}
      <div className="px-5 py-5 border-b border-zinc-100">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
          MenuKodra
        </p>
        <p className="font-semibold text-zinc-900 truncate">{restaurantName}</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer con usuario */}
      <div className="px-3 py-4 border-t border-zinc-100 space-y-1">
        <p className="px-3 text-xs text-zinc-400 truncate">{userEmail}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-zinc-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
