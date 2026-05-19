import { NextRequest, NextResponse } from 'next/server'
import { getMPClient, Preference } from '@/lib/mercadopago'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, restaurantId, tableId, restaurantSlug, tableLabel, tipAmount, customerEmail } =
      await req.json()

    const supabase = createServiceClient()
    const { data: orders } = await supabase
      .from('orders')
      .select('total')
      .eq('session_id', sessionId)
      .neq('status', 'cancelled')

    const subtotal = (orders ?? []).reduce((acc, o) => acc + (o.total ?? 0), 0)
    const grandTotal = subtotal + (tipAmount ?? 0)

    if (grandTotal <= 0) {
      return NextResponse.json({ error: 'El total debe ser mayor a 0' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const client = getMPClient()
    const preference = new Preference(client)

    const response = await preference.create({
      body: {
        items: [
          {
            id: sessionId,
            title: `Cuenta — ${tableLabel}`,
            quantity: 1,
            unit_price: grandTotal,
            currency_id: 'MXN',
          },
        ],
        payer: customerEmail ? { email: customerEmail } : undefined,
        back_urls: {
          success: `${appUrl}/m/${restaurantSlug}/${tableId}/confirmacion?type=mercadopago`,
          failure: `${appUrl}/m/${restaurantSlug}/${tableId}`,
          pending: `${appUrl}/m/${restaurantSlug}/${tableId}/confirmacion?type=mercadopago&status=pending`,
        },
        auto_return: 'approved',
        external_reference: JSON.stringify({
          sessionId,
          restaurantId,
          tipAmount: tipAmount ?? 0,
          customerEmail: customerEmail ?? '',
        }),
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
      },
    })

    return NextResponse.json({ init_point: response.init_point })
  } catch (err) {
    console.error('MercadoPago error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al crear preferencia de pago' },
      { status: 500 },
    )
  }
}
