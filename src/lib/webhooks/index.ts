import { headers } from "next/headers"
import { NextRequest } from "next/server"
import { stripe } from "../stripe"
import Stripe from "stripe"
import { WebhookHandlerResponse } from "./types"
import { handlePaymentSuccess, handlePaymentFailure } from "./payment"

export async function constructStripeEvent(
  request: NextRequest,
  endpointSecret: string | undefined
): Promise<{
  event: Stripe.Event | null
  error?: {
    message: string
    status: number
  }
}> {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature || !endpointSecret) {
    return {
      event: null,
      error: {
        message: "Missing signature or endpoint secret",
        status: 400,
      },
    }
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    return { event }
  } catch (err) {
    return {
      event: null,
      error: {
        message: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        status: 400,
      },
    }
  }
}

export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<WebhookHandlerResponse> {
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const ticketIds = paymentIntent.metadata.ticketIds?.split(",") || []
        const campaignId = paymentIntent.metadata.campaignId
        const userId = paymentIntent.metadata.userId

        if (!ticketIds.length || !campaignId || !userId) {
          return {
            received: false,
            error: "Missing required metadata",
            status: 400,
          }
        }

        return await handlePaymentSuccess(
          ticketIds,
          campaignId,
          userId,
          paymentIntent.id,
          paymentIntent.amount
        )
      }

      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const ticketIds = paymentIntent.metadata.ticketIds?.split(",") || []

        if (!ticketIds.length) {
          return {
            received: false,
            error: "Missing ticket IDs",
            status: 400,
          }
        }

        return await handlePaymentFailure(ticketIds)
      }

      default:
        return { received: true }
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return {
      received: false,
      error: "Webhook handler failed",
      status: 500,
    }
  }
} 