import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewVenueForm from '@/components/new-venue-form'

export const dynamic = 'force-dynamic'

export default async function NewVenuePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Create New Venue
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Add a new venue for film screenings
          </p>
        </div>
        <NewVenueForm />
      </div>
    </div>
  )
}
