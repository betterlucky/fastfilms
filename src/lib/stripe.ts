import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil" as const,
  typescript: true,
})

export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export const formatAmountForStripe = (
  amount: number,
  currency: string
): number => {
  const numberFormat = new Intl.NumberFormat(["en-GB"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  })
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}

export const formatAmountFromStripe = (
  amount: number,
  currency: string
): number => {
  const numberFormat = new Intl.NumberFormat(["en-GB"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  })
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false
    }
  }
  return zeroDecimalCurrency ? amount : amount / 100
} 