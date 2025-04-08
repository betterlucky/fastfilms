'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

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
      const response = await fetch('/api/admin/charities', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create charity')
      }

      router.push('/admin/charities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
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
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input id="name" name="name" required />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium"
              >
                Description
              </label>
              <Textarea id="description" name="description" />
            </div>

            <div>
              <label htmlFor="url" className="mb-1 block text-sm font-medium">
                Website URL
              </label>
              <Input id="url" name="url" type="url" placeholder="https://" />
            </div>

            <div>
              <label
                htmlFor="logoUrl"
                className="mb-1 block text-sm font-medium"
              >
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
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Charity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
