"use client"

import { useState } from "react"
import Link from "next/link"

export default function ResendVerificationPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      setSuccess(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="justify-center flex flex-1 flex-col px-6 py-12 min-h-full lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 font-bold text-center text-2xl text-gray-900 leading-9 tracking-tight">
          Resend verification email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a new verification link.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {success && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block font-medium text-sm text-gray-900 leading-6">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="ring-1 ring-inset ring-gray-300 block py-1.5 placeholder:text-gray-400 w-full text-gray-900 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="justify-center flex px-3 py-1.5 w-full hover:bg-indigo-500 font-semibold text-sm text-white leading-6 bg-indigo-600 rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="hover:text-indigo-500 font-semibold text-indigo-600"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
} 