import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import NewVenueForm from "@/components/new-venue-form"

export const dynamic = 'force-dynamic'

export default async function NewVenuePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="py-24 bg-white sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
            Create New Venue
          </h2>
          <p className="mt-2 text-lg text-gray-600 leading-8">
            Add a new venue for film screenings
          </p>
        </div>
        <NewVenueForm />
      </div>
    </div>
  )
} 