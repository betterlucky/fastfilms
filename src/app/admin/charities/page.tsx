'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface Charity {
  id: string
  name: string
  description: string | null
  url: string | null
  logoPath: string | null
}

export default function CharitiesPage() {
  const router = useRouter()
  const [charities, setCharities] = useState<Charity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCharities() {
      try {
        const response = await fetch('/api/admin/charities')
        if (!response.ok) {
          throw new Error('Failed to fetch charities')
        }
        const data = await response.json()
        setCharities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharities()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="justify-between items-center flex mb-8">
        <h1 className="font-bold text-3xl">Manage Charities</h1>
        <Link href="/admin/charities/new">
          <Button>Add New Charity</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {charities.map((charity) => (
          <Card key={charity.id}>
            <CardHeader>
              <div className="justify-between items-start flex">
                <div>
                  <CardTitle>{charity.name}</CardTitle>
                  {charity.description && (
                    <p className="mt-2 text-gray-500">{charity.description}</p>
                  )}
                </div>
                <div className="items-center flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/admin/charities/${charity.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => router.push(`/admin/charities/${charity.id}/delete`)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="items-center flex gap-4">
                {charity.logoPath && (
                  <div className="relative size-20">
                    <Image
                      src={charity.logoPath}
                      alt={`${charity.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  {charity.url && (
                    <a
                      href={charity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 