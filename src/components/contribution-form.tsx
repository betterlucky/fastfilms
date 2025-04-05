"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ContributionFormProps {
  campaignId: string
  currentFunding: number
  fundingTarget: number
}

export function ContributionForm({ campaignId, currentFunding, fundingTarget }: ContributionFormProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const remainingAmount = Number(fundingTarget) - Number(currentFunding)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number(amount) }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to process contribution")
      }

      router.refresh()
      setAmount("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process contribution")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div className="px-4 py-6 sm:p-8">
        <div className="flex flex-col space-y-4">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Support this Campaign
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              £{remainingAmount.toFixed(2)} still needed to reach the funding target
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Contribution Amount (£)
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">£</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="1"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !amount || Number(amount) <= 0}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Contribute"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 