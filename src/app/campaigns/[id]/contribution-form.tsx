"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

async function contribute(campaignId: string, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string)
  const response = await fetch(`/api/campaigns/${campaignId}/contribute`, {
    method: "POST",
    body: JSON.stringify({ amount }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to contribute")
  }

  return response.json()
}

export default function ContributionForm({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const amount = parseFloat(formData.get("amount") as string)
      
      // Validate minimum amount (£5)
      if (amount < 5) {
        setError("Minimum contribution amount is £5")
        setIsSubmitting(false)
        return
      }

      await contribute(campaignId, formData)
      router.refresh()
      event.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process contribution. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Contribution Amount (GBP)
        </label>
        <div className="mt-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">£</span>
          <input
            type="number"
            name="amount"
            id="amount"
            min="5"
            step="0.01"
            required
            className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter amount (min £5)"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Minimum contribution: £5
        </p>
      </div>
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : "Contribute"}
      </button>
    </form>
  )
} 