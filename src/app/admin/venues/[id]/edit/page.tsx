import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { VenueForm } from "@/components/admin/venue-form"

export const metadata: Metadata = {
  title: "Edit Venue",
  description: "Edit cinema venue details",
}

export default async function EditVenuePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return notFound()
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  })

  if (!venue) {
    redirect("/admin/venues")
  }

  return (
    <div className="container py-10 mx-auto">
      <h1 className="mb-8 font-bold text-3xl">Edit Venue</h1>
      <VenueForm initialData={venue} venueId={venue.id} />
    </div>
  )
} 