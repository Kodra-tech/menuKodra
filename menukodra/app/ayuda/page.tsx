import Link from 'next/link'
import { ArrowLeft, Utensils } from 'lucide-react'

export const metadata = {
  title: 'Ayuda — MenuKodra',
  description: 'Preguntas frecuentes y guía de uso de MenuKodra.',
}

const SECTIONS = [
  {
    title: 'General',
    items: [
      {
        q: '¿Qué es MenuKodra?',
        a: 'MenuKodra es un sistema de menú digital para restaurantes. Tus clientes escanean un código QR en la mesa, ven el menú, ordenan y pagan desde su teléfono, sin descargar ninguna app.',
      },
      {
        q: '¿Necesito comprar hardware adicional?',
        a: 'No. Solo necesitas un dispositivo con navegador (tablet, computadora o teléfono) para la pantalla de cocina y el panel de administración. Los QR se imprimen en papel normal.',
      },
      {
        q: '¿Funciona sin internet?',
        a: 'El sistema requiere conexión a internet. Sin embargo, si el WiFi falla, el menú puede estar en caché en el teléfono del cliente por varios minutos.',
      },
    ],
  },
  {
    title: 'Setup y configuración',
    items: [
      {
        q: '¿Cuánto tiempo tarda el setup inicial?',
        a: 'El setup técnico tarda menos de 5 minutos (crear cuenta, configurar restaurante, generar QRs). Cargar el menú completo depende del número de platillos; un menú de 30 items toma aproximadamente 30 minutos.',
      },
      {
        q: '¿Cómo genero los QR de mis mesas?',
        a: 'Desde el panel admin → Mesas → crea cada mesa → descarga el QR en PNG o PDF. Puedes imprimirlos en papel adhesivo, en acrílicos o en cualquier soporte.',
      },
      {
        q: '¿Puedo cambiar el menú después?',
        a: 'Sí, en cualquier momento. Agrega, edita o desactiva platillos desde el panel. Los cambios se reflejan en el menú QR de forma inmediata.',
      },
      {
        q: '¿Puedo poner fotos de mis platillos?',
        a: 'Sí. Sube imágenes en formato JPG o PNG al crear o editar cada platillo. Las imágenes se almacenan en la nube y se optimizan automáticamente.',
      },
    ],
  },
  {
    title: 'Pagos',
    items: [
      {
        q: '¿Qué métodos de pago acepta?',
        a: 'Efectivo, tarjeta con terminal física y pagos en línea con MercadoPago (plan Pro y Enterprise). El cliente elige el método al solicitar la cuenta.',
      },
      {
        q: '¿Cobran comisión por cada transacción?',
        a: 'No. MenuKodra no cobra comisión. Los pagos en línea tienen las tarifas estándar de MercadoPago (~3.6% + IVA), que van directo a tu cuenta de MP.',
      },
      {
        q: '¿Cómo recibo el dinero de los pagos en línea?',
        a: 'Los pagos con MercadoPago van directo a tu cuenta de Mercado Pago. MenuKodra no toca el dinero; solo activa el proceso de cobro.',
      },
    ],
  },
  {
    title: 'Operación diaria',
    items: [
      {
        q: '¿Cómo ve la cocina los pedidos?',
        a: 'Abre /cocina/[tu-restaurant-id] en cualquier dispositivo con navegador (tablet recomendada). Los pedidos llegan en tiempo real y puedes marcar su estado: preparando, listo, entregado.',
      },
      {
        q: '¿El cliente puede llamar al mesero?',
        a: 'Sí. El botón "Llamar al mesero" genera una notificación en el panel de caja que indica qué mesa está llamando.',
      },
      {
        q: '¿Qué pasa cuando se cierra una mesa?',
        a: 'Al cerrar la sesión desde caja, la mesa queda lista para el siguiente cliente. La próxima vez que alguien escanee el QR, se abre una nueva sesión limpia.',
      },
    ],
  },
  {
    title: 'Facturación y soporte',
    items: [
      {
        q: '¿Emiten facturas CFDI?',
        a: 'La facturación CFDI está disponible en el plan Enterprise mediante integración con Facturapi. Los planes Básico y Pro no incluyen esta función.',
      },
      {
        q: '¿Cómo contacto a soporte?',
        a: 'Envía un correo a soporte@menukodra.com o usa el chat del panel de administración. El tiempo de respuesta es menor a 24 horas en plan Básico y menor a 4 horas en Pro y Enterprise.',
      },
      {
        q: '¿Puedo cancelar en cualquier momento?',
        a: 'Sí. No hay contrato de permanencia. Al cancelar, el sistema sigue activo hasta el fin del período pagado. Los datos se conservan 30 días adicionales por si deseas reactivar.',
      },
    ],
  },
]

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Nav */}
      <nav className="border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
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
            Acceso admin
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          Ayuda y preguntas frecuentes
        </h1>
        <p className="text-zinc-500 mb-12">
          Todo lo que necesitas saber para usar MenuKodra. Si no encuentras tu respuesta,{' '}
          <a href="mailto:soporte@menukodra.com" className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900">
            escríbenos
          </a>
          .
        </p>

        <div className="space-y-12">
          {SECTIONS.map(({ title, items }) => (
            <section key={title}>
              <h2 className="text-lg font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
                {title}
              </h2>
              <div className="space-y-5">
                {items.map(({ q, a }) => (
                  <div key={q}>
                    <p className="font-semibold text-zinc-900 mb-1">{q}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 bg-zinc-50 rounded-2xl p-6 text-center border border-zinc-200">
          <p className="font-semibold text-zinc-900 mb-1">¿No encontraste tu respuesta?</p>
          <p className="text-sm text-zinc-500 mb-4">Escríbenos y te respondemos en menos de 24 horas.</p>
          <a
            href="mailto:soporte@menukodra.com"
            className="inline-block bg-zinc-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  )
}
