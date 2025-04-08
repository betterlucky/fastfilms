'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function handleAddScreen(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const venueId = formData.get('venueId') as string
  const name = formData.get('name') as string
  const capacity = parseInt(formData.get('capacity') as string)

  await prisma.screen.create({
    data: {
      name,
      capacity,
      venueId,
    },
  })

  revalidatePath(`/venues/${venueId}/screens`)
}

export async function handleUpdateScreen(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const screenId = formData.get('screenId') as string
  const venueId = formData.get('venueId') as string
  const name = formData.get('name') as string
  const capacity = parseInt(formData.get('capacity') as string)

  await prisma.screen.update({
    where: { id: screenId },
    data: {
      name,
      capacity,
    },
  })

  revalidatePath(`/venues/${venueId}/screens`)
}

export async function handleDeleteScreen(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const screenId = formData.get('screenId') as string
  const venueId = formData.get('venueId') as string

  await prisma.screen.delete({
    where: { id: screenId },
  })

  revalidatePath(`/venues/${venueId}/screens`)
}
