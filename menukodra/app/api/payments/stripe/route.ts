import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
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

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: { name: `Cuenta — ${tableLabel}` },
            unit_amount: Math.round(grandTotal * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/m/${restaurantSlug}/${tableId}/confirmacion?type=stripe&stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/m/${restaurantSlug}/${tableId}`,
      customer_email: customerEmail || undefined,
      metadata: {
        sessionId,
        restaurantId,
        tableId,
        tipAmount: String(tipAmount ?? 0),
        customerEmail: customerEmail ?? '',
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al crear sesión de pago' },
      { status: 500 },
    )
  }
}
