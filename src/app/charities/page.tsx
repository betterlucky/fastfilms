import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FaPlus, FaBuilding } from 'react-icons/fa'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export default async function CharitiesPage() {
  const charities = await prisma.charity.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      logoPath: true,
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Charities</h1>
        <Button asChild>
          <Link href="/admin/charities/new">
            <FaPlus className="mr-2 size-4" />
            New Charity
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {charities.map((charity) => (
          <Card key={charity.id} className="overflow-hidden">
            <div className="relative aspect-video">
              {charity.logoPath ? (
                <Image
                  src={charity.logoPath}
                  alt={charity.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <FaBuilding className="size-12 text-gray-400" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{charity.name}</CardTitle>
              <CardDescription>{charity.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FaBuilding className="size-4 text-gray-500" />
                <span className="text-sm text-gray-500">{charity.name}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/admin/charities/${charity.id}`}>
                  Manage Charity
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
