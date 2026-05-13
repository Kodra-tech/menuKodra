'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toaster } from '@/components/ui/sonner'
import { updateSettings } from '../_actions/settings'

type Restaurant = {
  name: string
  slug: string
  primary_color: string | null
  currency: string | null
  timezone: string | null
  phone: string | null
  address: string | null
}

interface Props {
  restaurant: Restaurant
}

const CURRENCIES = ['MXN', 'USD', 'EUR']
const TIMEZONES = [
  'America/Monterrey',
  'America/Mexico_City',
  'America/Tijuana',
  'America/Cancun',
]

export function SettingsForm({ restaurant }: Props) {
  const [name, setName] = useState(restaurant.name)
  const [slug, setSlug] = useState(restaurant.slug)
  const [primaryColor, setPrimaryColor] = useState(restaurant.primary_color ?? '#E53E3E')
  const [currency, setCurrency] = useState(restaurant.currency ?? 'MXN')
  const [timezone, setTimezone] = useState(restaurant.timezone ?? 'America/Monterrey')
  const [phone, setPhone] = useState(restaurant.phone ?? '')
  const [address, setAddress] = useState(restaurant.address ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await updateSettings({
      name,
      slug,
      primaryColor,
      currency,
      timezone,
      phone,
      address,
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configuración guardada')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <h1 className="text-xl font-bold text-zinc-900">Ajustes del restaurante</h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 bg-white border border-zinc-200 rounded-xl p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del restaurante</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug{' '}
            <span className="text-zinc-400 text-xs font-normal">
              (aparece en la URL del menú)
            </span>
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            required
            pattern="[a-z0-9\-]+"
          />
          <p className="text-xs text-zinc-400">
            /m/<strong>{slug || 'tu-restaurante'}</strong>/...
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('America/', '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color principal</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#E53E3E"
              className="w-32"
              pattern="#[0-9A-Fa-f]{6}"
            />
            <div
              className="w-8 h-8 rounded-full border border-zinc-200"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52 81 1234 5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, Número, Colonia, Ciudad"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  )
}
