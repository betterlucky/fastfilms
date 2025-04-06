import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type Venue = {
  id: string
  name: string
}

async function createCampaign(formData: FormData) {
  "use server"
  
  const data = await prisma.campaign.create({
    data: {
      title: formData.get("movieTitle") as string,
      movieTitle: formData.get("movieTitle") as string,
      description: formData.get("description") as string,
      fundingTarget: Number(formData.get("fundingTarget")),
      screeningDate: new Date(formData.get("screeningDate") as string),
      deadlineDate: new Date(formData.get("deadlineDate") as string),
      currentFunding: 0,
      status: "ACTIVE",
      venueId: formData.get("venueId") as string,
    },
  })

  redirect("/campaigns")
}

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/campaigns")
  }

  const venues = await prisma.venue.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Create New Screening</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Start a new film screening campaign in your community
          </p>
        </div>
        <form action={createCampaign} className="mx-auto mt-16 max-w-xl">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="movieTitle" className="block text-sm font-semibold leading-6 text-gray-900">
                Film Title
              </label>
              <div className="mt-2.5">
                <input
                  type="text"
                  name="movieTitle"
                  id="movieTitle"
                  required
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold leading-6 text-gray-900">
                Description
              </label>
              <div className="mt-2.5">
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fundingTarget" className="block text-sm font-semibold leading-6 text-gray-900">
                Funding Target (£)
              </label>
              <div className="mt-2.5">
                <input
                  type="number"
                  name="fundingTarget"
                  id="fundingTarget"
                  required
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="deadlineDate" className="block text-sm font-semibold leading-6 text-gray-900">
                Campaign Deadline
              </label>
              <div className="mt-2.5">
                <input
                  type="date"
                  name="deadlineDate"
                  id="deadlineDate"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="screeningDate" className="block text-sm font-semibold leading-6 text-gray-900">
                Screening Date
              </label>
              <div className="mt-2.5">
                <input
                  type="date"
                  name="screeningDate"
                  id="screeningDate"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="venueId" className="block text-sm font-semibold leading-6 text-gray-900">
                Venue
              </label>
              <div className="mt-2.5">
                <select
                  name="venueId"
                  id="venueId"
                  required
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue: Venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <button
              type="submit"
              className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 