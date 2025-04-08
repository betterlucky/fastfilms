'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import Image from 'next/image'

interface Charity {
  id: string
  name: string
  description: string | null
  url: string | null
  logoPath: string | null
}

export default function EditCharityPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [charity, setCharity] = useState<Charity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/charities/${params.id}`)
      .then((res) => res.json())
      .then((data) => setCharity(data))
      .catch((err) => setError('Failed to load charity'))
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch(`/api/admin/charities/${params.id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update charity')
      }

      router.push('/admin/charities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this charity?')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/charities/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete charity')
      }

      router.push('/admin/charities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsDeleting(false)
    }
  }

  if (!charity) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Charity</h1>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Charity'}
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/admin/charities')}
          >
            Back to Charities
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={charity.name}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                defaultValue={charity.description || ''}
              />
            </div>

            <div>
              <label htmlFor="url" className="mb-1 block text-sm font-medium">
                Website URL
              </label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={charity.url || ''}
              />
            </div>

            <div>
              <label htmlFor="logo" className="mb-1 block text-sm font-medium">
                Logo
              </label>
              {charity.logoPath && (
                <div className="mb-2">
                  <div className="relative size-20">
                    <Image
                      src={charity.logoPath}
                      alt={`${charity.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a new logo to replace the existing one
                  </p>
                </div>
              )}
              <Input id="logo" name="logo" type="file" accept="image/*" />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
