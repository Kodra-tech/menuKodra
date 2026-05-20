'use client'

import { useState } from 'react'
import { ChefHat, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createRestaurant } from './_actions/onboarding'

const TABLE_OPTIONS = [5, 10, 15, 20, 30]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [color, setColor] = useState('#18181b')
  const [tablesCount, setTablesCount] = useState(10)
  const [customTables, setCustomTables] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleNameChange(val: string) {
    setName(val)
    setSlug(slugify(val))
  }

  async function handleFinish() {
    const count = customTables ? parseInt(customTables, 10) : tablesCount
    if (!count || count < 1 || count > 100) {
      setError('El número de mesas debe ser entre 1 y 100')
      return
    }
    setLoading(true)
    setError(null)
    const result = await createRestaurant({
      restaurantName: name,
      slug,
      primaryColor: color,
      tablesCount: count,
    })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, createRestaurant redirects to /dashboard/menu
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">MenuKodra</span>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  s < step
                    ? 'bg-emerald-500 text-white'
                    : s === step
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-200 text-zinc-400',
                )}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn('w-10 h-0.5 rounded', s < step ? 'bg-emerald-400' : 'bg-zinc-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          {/* ── Step 1: Restaurante ─────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Crea tu restaurante</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Configura los datos básicos. Podrás cambiarlos después en Ajustes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del restaurante</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Tacos Don Pepe"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Identificador{' '}
                  <span className="text-zinc-400 font-normal text-xs">(aparece en la URL del menú)</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="tacos-don-pepe"
                />
                <p className="text-xs text-zinc-400">
                  menukodra.com/m/<strong>{slug || 'tu-restaurante'}</strong>/mesa-1
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color principal</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#18181b"
                    className="w-28 font-mono text-sm"
                    pattern="#[0-9A-Fa-f]{6}"
                  />
                  <div
                    className="w-8 h-8 rounded-full border border-zinc-200 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!name.trim() || !slug.trim()}
                onClick={() => setStep(2)}
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── Step 2: Mesas ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-zinc-900">¿Cuántas mesas tienes?</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Crearemos los QR automáticamente. Puedes agregar o quitar mesas después.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {TABLE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setTablesCount(n); setCustomTables('') }}
                    className={cn(
                      'py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                      tablesCount === n && !customTables
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="custom">Otro número</Label>
                <Input
                  id="custom"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Ej. 25"
                  value={customTables}
                  onChange={(e) => { setCustomTables(e.target.value); setTablesCount(0) }}
                />
              </div>

              <p className="text-sm text-zinc-500 bg-zinc-50 rounded-xl px-4 py-3">
                Se crearán{' '}
                <strong className="text-zinc-900">
                  {customTables || tablesCount} mesas
                </strong>{' '}
                con sus QR listos para imprimir.
              </p>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirmar ────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Todo listo</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Revisa los datos y crea tu restaurante.
                </p>
              </div>

              <div className="bg-zinc-50 rounded-xl border border-zinc-200 divide-y divide-zinc-100 text-sm">
                <div className="flex justify-between px-4 py-3">
                  <span className="text-zinc-500">Restaurante</span>
                  <span className="font-semibold text-zinc-900">{name}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-zinc-500">URL del menú</span>
                  <span className="font-mono text-zinc-700 text-xs">/m/{slug}/...</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-zinc-500">Color principal</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-zinc-200" style={{ backgroundColor: color }} />
                    <span className="font-mono text-xs text-zinc-600">{color}</span>
                  </div>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-zinc-500">Mesas a crear</span>
                  <span className="font-semibold text-zinc-900">
                    {customTables || tablesCount}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={loading}>
                  Atrás
                </Button>
                <Button className="flex-1" onClick={handleFinish} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      Crear restaurante
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  )
}
