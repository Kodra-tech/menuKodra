import Link from 'next/link'
import { CheckCircle2, X, ArrowLeft, Utensils } from 'lucide-react'

export const metadata = {
  title: 'Precios — MenuKodra',
  description: 'Planes claros sin comisiones por transacción. Setup único + mensualidad fija.',
}

const PLANS = [
  {
    name: 'Básico',
    price: 800,
    desc: 'Para restaurantes que empiezan su transformación digital.',
    features: [
      { label: 'Menú digital QR', ok: true },
      { label: 'Cocina en tiempo real (KDS)', ok: true },
      { label: 'Hasta 10 mesas con QR', ok: true },
      { label: 'Llamadas al mesero', ok: true },
      { label: 'Solicitar cuenta desde la mesa', ok: true },
      { label: 'Panel admin (menú, ajustes)', ok: true },
      { label: 'Pagos con MercadoPago', ok: false },
      { label: 'Reportes y exportación', ok: false },
      { label: 'Facturación CFDI', ok: false },
    ],
  },
  {
    name: 'Pro',
    price: 1200,
    desc: 'El plan más popular. Todo lo que necesitas para operar y crecer.',
    highlight: true,
    features: [
      { label: 'Menú digital QR', ok: true },
      { label: 'Cocina en tiempo real (KDS)', ok: true },
      { label: 'Mesas ilimitadas con QR', ok: true },
      { label: 'Llamadas al mesero', ok: true },
      { label: 'Solicitar cuenta desde la mesa', ok: true },
      { label: 'Panel admin (menú, ajustes)', ok: true },
      { label: 'Pagos con MercadoPago', ok: true },
      { label: 'Reportes y exportación (CSV / PDF)', ok: true },
      { label: 'Facturación CFDI', ok: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 1500,
    desc: 'Para cadenas y restaurantes con necesidades avanzadas.',
    features: [
      { label: 'Menú digital QR', ok: true },
      { label: 'Cocina en tiempo real (KDS)', ok: true },
      { label: 'Mesas ilimitadas con QR', ok: true },
      { label: 'Llamadas al mesero', ok: true },
      { label: 'Solicitar cuenta desde la mesa', ok: true },
      { label: 'Panel admin (menú, ajustes)', ok: true },
      { label: 'Pagos con MercadoPago y Stripe', ok: true },
      { label: 'Reportes y exportación (CSV / PDF)', ok: true },
      { label: 'Facturación CFDI (Facturapi)', ok: true },
    ],
  },
]

const FAQS = [
  {
    q: '¿Hay contrato de permanencia?',
    a: 'No. Puedes cancelar en cualquier momento. Solo pierdes el acceso al panel; el QR de tus mesas dejará de funcionar al final del período.',
  },
  {
    q: '¿El setup se cobra una sola vez?',
    a: 'Sí. El costo de setup ($5,000 MXN) incluye configuración inicial, carga del menú y capacitación de tu equipo. Se paga una sola vez.',
  },
  {
    q: '¿Cobran comisión por cada orden o pago?',
    a: 'No cobramos comisión. MercadoPago y Stripe tienen sus propias tarifas (aprox. 3.6% + IVA), pero son directas entre ellos y tu cuenta.',
  },
  {
    q: '¿Funciona en cualquier teléfono?',
    a: 'Sí. El menú es una página web que abre directo desde la cámara o cualquier lector QR. No requiere descargar ninguna app.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Nav */}
      <nav className="border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-zinc-800" />
            <span className="font-bold tracking-tight">MenuKodra</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center pt-16 pb-12 px-6">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          Precios simples, sin sorpresas
        </h1>
        <p className="text-zinc-500 text-lg max-w-md mx-auto">
          Setup único + mensualidad fija. Sin comisiones por orden ni por mesa.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(({ name, price, desc, features, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl border p-7 flex flex-col ${
                highlight ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200'
              }`}
            >
              {highlight && (
                <span className="text-xs font-semibold bg-white/10 text-zinc-300 px-2.5 py-1 rounded-full w-fit mb-4">
                  Más popular
                </span>
              )}
              <p className={`text-sm font-semibold mb-1 ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {name}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-4xl font-bold ${highlight ? 'text-white' : 'text-zinc-900'}`}>
                  ${price.toLocaleString('es-MX')}
                </span>
                <span className={`text-sm ${highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>/mes</span>
              </div>
              <p className={`text-xs mb-1 ${highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>
                + $5,000 setup único
              </p>
              <p className={`text-sm mt-3 mb-6 leading-relaxed ${highlight ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {desc}
              </p>

              <ul className="space-y-2.5 flex-1 mb-7">
                {features.map(({ label, ok }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm">
                    {ok ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    ) : (
                      <X className="w-4 h-4 shrink-0 text-zinc-300" />
                    )}
                    <span className={ok ? (highlight ? 'text-zinc-200' : 'text-zinc-700') : 'text-zinc-400'}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  highlight
                    ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                    : 'bg-zinc-900 text-white hover:bg-zinc-700'
                }`}
              >
                Empezar con {name}
              </Link>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-zinc-400 mt-8">
          Todos los planes incluyen actualizaciones sin costo adicional.
          ¿Necesitas algo diferente?{' '}
          <Link href="/ayuda" className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
            Escríbenos
          </Link>
        </p>
      </div>

      {/* FAQ mini */}
      <div className="bg-zinc-50 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ fontFamily: 'var(--font-playfair, serif)' }}
          >
            Preguntas frecuentes
          </h2>
          <div className="space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-zinc-200 p-5">
                <p className="font-semibold text-zinc-900 mb-1.5">{q}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-zinc-500">
            Más preguntas en{' '}
            <Link href="/ayuda" className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900">
              nuestra página de ayuda
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
