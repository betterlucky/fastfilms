'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toggleCampaignFeatured } from '@/lib/campaigns'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'

export async function toggleFeature(campaignId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  await toggleCampaignFeatured(campaignId)
  revalidatePath('/')
  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateTicketCap(campaignId: string, ticketCap: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { ticketCap },
  })

  revalidatePath('/')
  revalidatePath(`/campaigns/${campaignId}`)
}

export async function assignScreen(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const campaignId = formData.get('campaignId') as string
  const screenId = formData.get('screenId') as string

  // If screenId is "unassign", set it to null
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      screenId: screenId === 'unassign' ? null : screenId,
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateCustomBlurb(
  campaignId: string,
  customBlurb: string | null
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }

  await prisma.$executeRaw`
    UPDATE "Campaign"
    SET "customBlurb" = ${customBlurb}
    WHERE id = ${campaignId}
  `

  revalidatePath('/')
  revalidatePath(`/campaigns/${campaignId}`)
}

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Not authorized')
  }
}

export async function handleCustomBlurbUpdate(formData: FormData) {
  await checkAdminAccess()

  const campaignId = formData.get('campaignId') as string
  const customBlurb = formData.get('customBlurb') as string

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { customBlurb },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function handleTicketCapUpdate(formData: FormData) {
  await checkAdminAccess()

  const campaignId = formData.get('campaignId') as string
  const ticketCap = parseInt(formData.get('ticketCap') as string)

  if (isNaN(ticketCap) || ticketCap < 0) {
    throw new Error('Invalid ticket cap')
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { ticketCap },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateScreeningDateTime(formData: FormData) {
  await checkAdminAccess()

  const campaignId = formData.get('campaignId') as string
  const screeningDate = formData.get('screeningDate') as string
  const screeningTime = formData.get('screeningTime') as string

  if (!screeningDate || !screeningTime) {
    throw new Error('Missing required fields')
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      screeningDate: new Date(screeningDate),
      screeningTime,
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateDeadlineDate(formData: FormData) {
  await checkAdminAccess()

  const campaignId = formData.get('campaignId') as string
  const deadlineDate = formData.get('deadlineDate') as string

  if (!deadlineDate) {
    throw new Error('Missing deadline date')
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      deadlineDate: new Date(deadlineDate),
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateCharity(formData: FormData) {
  await checkAdminAccess()

  const campaignId = formData.get('campaignId') as string
  const charityId = formData.get('charityId') as string

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      charityId: charityId === 'none' ? null : charityId,
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateCampaignMenuItems(formData: FormData) {
  await checkAdminAccess()

  const campaignId = formData.get('campaignId') as string
  const menuItemIds = formData
    .getAll('menuItemIds[]')
    .map((id) => id.toString())

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      menuItems: {
        set: menuItemIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}
