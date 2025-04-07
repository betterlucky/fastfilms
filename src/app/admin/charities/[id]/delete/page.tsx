'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Charity {
  id: string
  name: string
  description: string | null
}

export default function DeleteCharityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [charity, setCharity] = useState<Charity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCharity() {
      try {
        const response = await fetch(`/api/admin/charities/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch charity')
        }
        const data = await response.json()
        setCharity(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    fetchCharity()
  }, [params.id])

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this charity? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/charities/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.text()
        throw new Error(data || 'Failed to delete charity')
      }

      router.push('/admin/charities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!charity) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Delete Charity</h1>
        <Button 
          variant="outline"
          onClick={() => router.push("/admin/charities")}
        >
          Back to Charities
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{charity.name}</strong>?
              {charity.description && (
                <span className="block text-gray-500 mt-1">{charity.description}</span>
              )}
            </p>
            <p className="text-red-500">
              This action cannot be undone. Any campaigns associated with this charity will need to be updated.
            </p>
            {error && (
              <div className="text-red-500">{error}</div>
            )}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/charities")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Charity"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 