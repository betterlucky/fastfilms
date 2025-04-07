import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default async function CharitiesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const charities = await prisma.charity.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Charities</h1>
        <Link href="/admin/charities/new">
          <Button>Add New Charity</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {charities.map((charity) => (
          <Card key={charity.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{charity.name}</CardTitle>
                  {charity.description && (
                    <p className="text-gray-500 mt-2">{charity.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = `/admin/charities/${charity.id}/edit`}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => window.location.href = `/admin/charities/${charity.id}/delete`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {charity.logoPath && (
                  <div className="relative w-20 h-20">
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
                      className="text-blue-600 hover:underline"
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