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
        throw new Error("Failed to create charity")
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add New Charity</h1>
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
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                Website URL
              </label>
              <Input
                id="url"
                name="url"
                type="url"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium mb-1">
                Logo
              </label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-end">
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