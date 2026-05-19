import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { getResend } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Firma faltante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { sessionId, restaurantId, tipAmount, customerEmail } = session.metadata ?? {}

    if (!sessionId || !restaurantId) {
      return NextResponse.json({ error: 'Metadata incompleta' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: tableSession } = await supabase
      .from('table_sessions')
      .select('total, status')
      .eq('id', sessionId)
      .single()

    if (tableSession?.status === 'closed') {
      return NextResponse.json({ received: true })
    }

    const amount = tableSession?.total ?? (session.amount_total ?? 0) / 100

    const { error: paymentError } = await supabase.from('payments').insert({
      session_id: sessionId,
      restaurant_id: restaurantId,
      amount,
      tip: parseFloat(tipAmount ?? '0'),
      method: 'stripe',
      status: 'completed',
      external_id: session.id,
      paid_at: new Date().toISOString(),
      customer_email: customerEmail || null,
    })

    if (paymentError) {
      console.error('Payment insert error:', paymentError)
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    await supabase
      .from('table_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (customerEmail) {
      try {
        await getResend().emails.send({
          from: 'recibos@menukodra.com',
          to: customerEmail,
          subject: 'Tu recibo de pago — MenuKodra',
          html: `<p>¡Gracias por tu visita!</p><p>Tu pago de <strong>$${amount} MXN</strong> fue procesado con éxito a través de Stripe.</p>`,
        })
      } catch (emailErr) {
        console.error('Resend error (no fatal):', emailErr)
      }
    }
  }

  return NextResponse.json({ received: true })
}
