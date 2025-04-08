'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function handleUpdateVenue(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const venueId = formData.get('venueId') as string
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const postcode = formData.get('postcode') as string
  const website = formData.get('website') as string
  const phone = formData.get('phone') as string

  await prisma.venue.update({
    where: { id: venueId },
    data: {
      name,
      address,
      city,
      postcode,
      url: website,
      phone,
    },
  })

  revalidatePath('/venues')
}
