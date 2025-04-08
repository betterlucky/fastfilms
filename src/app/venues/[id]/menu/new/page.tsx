import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MenuItemForm from '../MenuItemForm'
import { Button } from '@/components/ui/button'

export default async function NewMenuItemPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) {
    return <div>Unauthorized</div>
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  })

  if (!venue) {
    redirect('/venues')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Menu Item for {venue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">New Menu Item</h1>
                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/venues/${params.id}/menu`)
                  }
                >
                  Back to Menu
                </Button>
              </div>
              <MenuItemForm venueId={venue.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
