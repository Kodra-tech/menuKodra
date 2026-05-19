import { NextRequest, NextResponse } from 'next/server'
import { getMPClient, Payment } from '@/lib/mercadopago'
import { createServiceClient } from '@/lib/supabase/service'
import { getResend } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const notificationType = body.type ?? body.topic
    if (notificationType !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id ?? body.id
    if (!paymentId) return NextResponse.json({ received: true })

    const client = getMPClient()
    const paymentClient = new Payment(client)
    const mpPayment = await paymentClient.get({ id: String(paymentId) })

    if (mpPayment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    const externalRef = mpPayment.external_reference
    if (!externalRef) return NextResponse.json({ received: true })

    let ref: { sessionId: string; restaurantId: string; tipAmount: number; customerEmail: string }
    try {
      ref = JSON.parse(externalRef)
    } catch {
      return NextResponse.json({ error: 'external_reference inválida' }, { status: 400 })
    }

    const { sessionId, restaurantId, tipAmount, customerEmail } = ref
    const supabase = createServiceClient()

    const { data: tableSession } = await supabase
      .from('table_sessions')
      .select('total, status')
      .eq('id', sessionId)
      .single()

    if (tableSession?.status === 'closed') {
      return NextResponse.json({ received: true })
    }

    const amount = tableSession?.total ?? (mpPayment.transaction_amount ?? 0)

    const { error: paymentError } = await supabase.from('payments').insert({
      session_id: sessionId,
      restaurant_id: restaurantId,
      amount,
      tip: tipAmount ?? 0,
      method: 'mercadopago',
      status: 'completed',
      external_id: String(paymentId),
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
          html: `<p>¡Gracias por tu visita!</p><p>Tu pago de <strong>$${amount} MXN</strong> fue procesado con éxito a través de MercadoPago.</p>`,
        })
      } catch (emailErr) {
        console.error('Resend error (no fatal):', emailErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('MP webhook error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error en webhook' },
      { status: 500 },
    )
  }
}
