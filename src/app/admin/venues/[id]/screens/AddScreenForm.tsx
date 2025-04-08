'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AddScreenFormProps {
  venueId: string
}

export default function AddScreenForm({ venueId }: AddScreenFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name") as string,
      capacity: Number(formData.get("capacity")),
      venueId,
    }

    try {
      const response = await fetch("/api/screens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create screen")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Screen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Screen Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. Screen 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              required
              min="1"
              placeholder="e.g. 200"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-md">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Screen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 