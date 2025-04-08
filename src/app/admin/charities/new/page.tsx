'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function NewCharityPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch("/api/admin/charities", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create charity")
      }

      router.push("/admin/charities")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="justify-between items-center flex mb-8">
        <h1 className="font-bold text-3xl">Add New Charity</h1>
        <Link href="/admin/charities">
          <Button variant="outline">Back to Charities</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-sm">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-1 font-medium text-sm">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
              />
            </div>

            <div>
              <label htmlFor="url" className="block mb-1 font-medium text-sm">
                Website URL
              </label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://"
              />
            </div>

            <div>
              <label htmlFor="logoUrl" className="block mb-1 font-medium text-sm">
                Logo URL
              </label>
              <Input
                id="logoUrl"
                name="logoUrl"
                type="url"
                placeholder="https://"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the URL of the charity's logo image
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-md">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="justify-end flex">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Charity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 