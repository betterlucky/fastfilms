"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaymentForm } from "@/components/payment-form"

export default function PurchasePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string
    ticketIds: string[]
  } | null>(null)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: params.id,
          quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      setPaymentData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const ticketPrice = 5
  const transactionFee = 0.5
  const totalAmount = (ticketPrice * quantity) + transactionFee

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Purchase Tickets
          </h1>

          {!paymentData ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Number of Tickets
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "ticket" : "tickets"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <h2 className="text-sm font-medium text-gray-900">Order Summary</h2>
                <dl className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Tickets ({quantity})</dt>
                    <dd className="text-sm font-medium text-gray-900">£{(ticketPrice * quantity).toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Transaction Fee</dt>
                    <dd className="text-sm font-medium text-gray-900">£{transactionFee.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">£{totalAmount.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Continue to Payment"}
              </button>
            </form>
          ) : (
            <div className="mt-8">
              <PaymentForm
                clientSecret={paymentData.clientSecret}
                ticketIds={paymentData.ticketIds}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 