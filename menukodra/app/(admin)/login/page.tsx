'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usePassword, setUsePassword] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">MenuKodra</CardTitle>
          <CardDescription>Panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-2 py-4">
              <div className="text-4xl">📧</div>
              <p className="font-medium text-zinc-900">Revisa tu correo</p>
              <p className="text-sm text-zinc-500">
                Enviamos un enlace de acceso a <strong>{email}</strong>
              </p>
              <Button
                variant="ghost"
                className="text-xs mt-2"
                onClick={() => setSent(false)}
              >
                Usar otro correo
              </Button>
            </div>
          ) : (
            <form
              onSubmit={usePassword ? handlePassword : handleMagicLink}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restaurante.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {usePassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? 'Iniciando...'
                  : usePassword
                    ? 'Entrar'
                    : 'Enviar enlace de acceso'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs text-zinc-500"
                onClick={() => {
                  setUsePassword(!usePassword)
                  setError(null)
                  setPassword('')
                }}
              >
                {usePassword ? '← Usar magic link' : 'Usar contraseña →'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
