"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const callbackUrl = searchParams.get("callbackUrl") || "/campaigns"
  const justRegistered = searchParams.get("registered")
  const verified = searchParams.get("verified")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      })

      if (!response?.ok) {
        if (response?.error === "Please verify your email before logging in") {
          setError("Please check your email for a verification link before logging in.")
        } else if (response?.error === "Invalid credentials") {
          setError("Invalid email or password")
        } else {
          setError(response?.error || "Something went wrong. Please try again.")
        }
        return
      }

      // Simple navigation after successful login
      window.location.href = callbackUrl
    } catch (err) {
      console.error("Login error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="justify-center flex flex-1 flex-col px-6 py-12 min-h-full lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 font-bold text-center text-2xl text-gray-900 leading-9 tracking-tight">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {justRegistered && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            Registration successful! Please check your email for a verification link.
          </div>
        )}

        {verified && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            Email verified successfully! You can now sign in.
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
            {error === "Please check your email for a verification link before logging in." && (
              <div className="mt-2">
                <Link
                  href="/resend-verification"
                  className="hover:text-indigo-500 font-semibold text-indigo-600"
                >
                  Resend verification email
                </Link>
              </div>
            )}
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
                className="block py-2 px-3 placeholder:text-gray-400 w-full text-gray-900 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-sm text-gray-900 leading-6">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block py-2 px-3 placeholder:text-gray-400 w-full text-gray-900 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="justify-center flex px-3 py-2 w-full hover:bg-indigo-500 font-semibold text-sm text-white leading-6 bg-indigo-600 rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Button
              variant="link"
              className="hover:text-indigo-500 font-semibold text-indigo-600"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="hover:text-indigo-500 font-semibold text-indigo-600 leading-6"
            onClick={() => router.push("/register")}
          >
            Register
          </Button>
        </p>
      </div>
    </div>
  )
} 