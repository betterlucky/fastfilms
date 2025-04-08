import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VenueForm } from "@/components/admin/venue-form"

export const metadata: Metadata = {
  title: "Add New Venue",
  description: "Add a new cinema venue",
}

export default async function NewVenuePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="container py-10 mx-auto">
      <h1 className="mb-8 font-bold text-3xl">Add New Venue</h1>
      <VenueForm />
    </div>
  )
} 