import { NextRequest } from 'next/server'
import { constructStripeEvent, handleStripeWebhook } from '@/lib/webhooks'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const { event, error } = await constructStripeEvent(request, endpointSecret)

  if (error || !event) {
    return Response.json(
      { message: error?.message || 'No event constructed' },
      { status: error?.status || 400 }
    )
  }

  const result = await handleStripeWebhook(event)

  if (!result.received) {
    return Response.json(
      { message: result.error || 'Failed to process webhook' },
      { status: result.status || 400 }
    )
  }

  return Response.json({ received: true })
}
