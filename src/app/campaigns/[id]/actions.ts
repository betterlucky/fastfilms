'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleCampaignFeatured } from "@/lib/campaigns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function toggleFeature(campaignId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await toggleCampaignFeatured(campaignId);
  revalidatePath('/');
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateTicketCap(campaignId: string, ticketCap: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { ticketCap },
  });

  revalidatePath("/");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function assignScreen(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const campaignId = formData.get('campaignId') as string
  const screenId = formData.get('screenId') as string

  // If screenId is "unassign", set it to null
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      screenId: screenId === "unassign" ? null : screenId,
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
}

export async function updateCustomBlurb(campaignId: string, customBlurb: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await prisma.$executeRaw`
    UPDATE "Campaign"
    SET "customBlurb" = ${customBlurb}
    WHERE id = ${campaignId}
  `;

  revalidatePath("/");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function handleCustomBlurbUpdate(formData: FormData) {
  'use server'
  const campaignId = formData.get('campaignId') as string
  const customBlurb = formData.get('customBlurb') as string
  await updateCustomBlurb(campaignId, customBlurb)
}

export async function handleTicketCapUpdate(formData: FormData) {
  'use server'
  const campaignId = formData.get('campaignId') as string
  const ticketCap = parseInt(formData.get('ticketCap') as string)
  await updateTicketCap(campaignId, ticketCap)
}

export async function updateScreeningDateTime(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  const campaignId = formData.get('campaignId') as string;
  const screeningDate = formData.get('screeningDate') as string;
  const screeningTime = formData.get('screeningTime') as string;

  // Combine date and time into a single DateTime
  const [hours, minutes] = screeningTime.split(':').map(Number);
  const date = new Date(screeningDate);
  date.setHours(hours, minutes);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      screeningDate: date,
      screeningTime: screeningTime,
    },
  });

  revalidatePath("/");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateDeadlineDate(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  const campaignId = formData.get('campaignId') as string;
  const deadlineDate = formData.get('deadlineDate') as string;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      deadlineDate: new Date(deadlineDate),
    },
  });

  revalidatePath("/");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateCharity(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const campaignId = formData.get("campaignId") as string
  const charityId = formData.get("charityId") as string

  try {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        charityId: charityId === "none" ? null : charityId
      }
    })

    revalidatePath(`/campaigns/${campaignId}`)
  } catch (error) {
    console.error("Error updating charity:", error)
    throw new Error("Failed to update charity")
  }
}

export async function updateCampaignMenuItems(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const campaignId = formData.get("campaignId") as string
  const menuItemIds = formData.getAll("menuItemIds[]") as string[]

  try {
    // First, remove all existing menu items
    await prisma.campaignMenuItem.deleteMany({
      where: { campaignId }
    })

    // Then add the selected menu items
    if (menuItemIds.length > 0) {
      await prisma.campaignMenuItem.createMany({
        data: menuItemIds.map(menuItemId => ({
          campaignId,
          menuItemId
        }))
      })
    }

    revalidatePath(`/campaigns/${campaignId}`)
  } catch (error) {
    console.error("Error updating campaign menu items:", error)
    throw new Error("Failed to update campaign menu items")
  }
} 