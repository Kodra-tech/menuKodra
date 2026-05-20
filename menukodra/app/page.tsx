import Link from 'next/link'
import { QrCode, ChefHat, CreditCard, BarChart2, CheckCircle2, ArrowRight, Utensils } from 'lucide-react'

export const metadata = {
  title: 'MenuKodra — Menú digital para restaurantes',
  description: 'Digitaliza tu restaurante en minutos. Menú QR, cocina en tiempo real, pagos integrados y reportes. Sin apps, sin comisiones por mesa.',
}

const FEATURES = [
  {
    icon: QrCode,
    title: 'Menú digital vía QR',
    desc: 'El cliente escanea, elige y ordena desde su teléfono. Sin descargar apps, sin esperar al mesero.',
  },
  {
    icon: ChefHat,
    title: 'Cocina en tiempo real',
    desc: 'Las órdenes llegan al instante a la pantalla de cocina. El cliente ve el estado de su pedido.',
  },
  {
    icon: CreditCard,
    title: 'Pagos integrados',
    desc: 'MercadoPago, tarjeta con terminal o efectivo. El cliente elige cómo pagar, tú cobras más rápido.',
  },
  {
    icon: BarChart2,
    title: 'Reportes y ventas',
    desc: 'Ventas por día, top platillos y ticket promedio. Exporta a CSV o PDF con un clic.',
  },
]

const STEPS = [
  { n: '1', title: 'Crea tu cuenta', desc: 'Regístrate en 2 minutos. Sin tarjeta requerida.' },
  { n: '2', title: 'Sube tu menú', desc: 'Agrega categorías, platillos, precios y fotos desde el panel.' },
  { n: '3', title: 'Imprime tu QR', desc: 'Colócalo en cada mesa. Tus clientes ya pueden ordenar.' },
]

const PLANS = [
  { name: 'Básico', price: '$800', features: ['Menú digital QR', 'Cocina en tiempo real', 'Hasta 10 mesas', 'Soporte por email'] },
  { name: 'Pro', price: '$1,200', features: ['Todo lo de Básico', 'Pagos con MercadoPago', 'Reportes y exportación', 'Mesas ilimitadas', 'Soporte prioritario'], highlight: true },
  { name: 'Enterprise', price: '$1,500', features: ['Todo lo de Pro', 'Integración Stripe', 'Facturación CFDI', 'Onboarding personalizado', 'SLA garantizado'] },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Nav */}
      <nav className="border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-zinc-800" />
            <span className="font-bold text-lg tracking-tight">MenuKodra</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Precios
            </Link>
            <Link href="/ayuda" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Ayuda
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="inline-block text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-5">
          Para restaurantes en México
        </span>
        <h1
          className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-zinc-900"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          Tu restaurante digital
          <br />
          <span className="text-zinc-400">en 5 minutos</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Menú QR, cocina en tiempo real, pagos y reportes. Sin apps que descargar,
          sin hardware adicional, sin comisiones por mesa.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
          >
            Comenzar gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold border border-zinc-200 text-zinc-700 hover:border-zinc-400 transition-colors"
          >
            Ver precios
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto mt-16">
          {[['5 min', 'de setup'], ['0', 'apps requeridas'], ['100%', 'desde el navegador']].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-zinc-900">{val}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-playfair, serif)' }}
          >
            Todo lo que necesitas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          Así de simple
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {n}
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
              <p className="text-sm text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ fontFamily: 'var(--font-playfair, serif)' }}
          >
            Precios claros, sin sorpresas
          </h2>
          <p className="text-center text-zinc-500 mb-12">Setup único + mensualidad. Sin comisiones por transacción.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map(({ name, price, features, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 border ${highlight ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200'}`}
              >
                <p className={`text-sm font-semibold mb-1 ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{name}</p>
                <p className={`text-3xl font-bold mb-1 ${highlight ? 'text-white' : 'text-zinc-900'}`}>
                  {price}
                  <span className={`text-sm font-normal ml-1 ${highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>/mes</span>
                </p>
                <p className={`text-xs mb-5 ${highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>+ $5,000 setup único</p>
                <ul className="space-y-2 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={highlight ? 'text-zinc-300' : 'text-zinc-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    highlight
                      ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                      : 'bg-zinc-900 text-white hover:bg-zinc-700'
                  }`}
                >
                  Empezar
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-400 mt-8">
            ¿Tienes dudas?{' '}
            <Link href="/ayuda" className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
              Consulta las preguntas frecuentes
            </Link>
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 text-center max-w-2xl mx-auto px-6">
        <h2
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          Listo para digitalizar tu restaurante
        </h2>
        <p className="text-zinc-500 mb-8">Crea tu cuenta hoy y ten tu menú QR activo en minutos.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-zinc-700 transition-colors"
        >
          Comenzar gratis
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Utensils className="w-4 h-4" />
            <span>MenuKodra © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="/pricing" className="hover:text-zinc-700 transition-colors">Precios</Link>
            <Link href="/ayuda" className="hover:text-zinc-700 transition-colors">Ayuda</Link>
            <Link href="/login" className="hover:text-zinc-700 transition-colors">Acceso admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
