import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_UNPOOLED
    }
  }
})

async function checkOrphanedData() {
  console.log('Checking for orphaned data...\n')

  // Check orphaned tickets (no campaign)
  const orphanedTickets = await prisma.ticket.findMany({
    where: {
      campaignId: {
        notIn: (await prisma.campaign.findMany({ select: { id: true } })).map(c => c.id)
      }
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      campaignId: true
    }
  })
  console.log('Orphaned Tickets:', orphanedTickets.length)
  if (orphanedTickets.length > 0) {
    console.log(orphanedTickets)
  }

  // Check orphaned purchases (no campaign)
  const orphanedPurchases = await prisma.purchase.findMany({
    where: {
      campaignId: {
        notIn: (await prisma.campaign.findMany({ select: { id: true } })).map(c => c.id)
      }
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      campaignId: true
    }
  })
  console.log('\nOrphaned Purchases:', orphanedPurchases.length)
  if (orphanedPurchases.length > 0) {
    console.log(orphanedPurchases)
  }

  // Check orphaned orders (no purchase)
  const orphanedOrders = await prisma.order.findMany({
    where: {
      purchaseId: {
        notIn: (await prisma.purchase.findMany({ select: { id: true } })).map(p => p.id)
      }
    },
    select: {
      id: true,
      createdAt: true,
      purchaseId: true
    }
  })
  console.log('\nOrphaned Orders:', orphanedOrders.length)
  if (orphanedOrders.length > 0) {
    console.log(orphanedOrders)
  }

  // Check orphaned order choices (no order)
  const orphanedOrderChoices = await prisma.orderChoice.findMany({
    where: {
      orderId: {
        notIn: (await prisma.order.findMany({ select: { id: true } })).map(o => o.id)
      }
    },
    select: {
      id: true,
      createdAt: true,
      orderId: true
    }
  })
  console.log('\nOrphaned Order Choices:', orphanedOrderChoices.length)
  if (orphanedOrderChoices.length > 0) {
    console.log(orphanedOrderChoices)
  }

  // Check orphaned campaign menu items (no campaign)
  const orphanedCampaignMenuItems = await prisma.campaignMenuItem.findMany({
    where: {
      campaignId: {
        notIn: (await prisma.campaign.findMany({ select: { id: true } })).map(c => c.id)
      }
    },
    select: {
      id: true,
      createdAt: true,
      campaignId: true
    }
  })
  console.log('\nOrphaned Campaign Menu Items:', orphanedCampaignMenuItems.length)
  if (orphanedCampaignMenuItems.length > 0) {
    console.log(orphanedCampaignMenuItems)
  }

  // Check orphaned comments (no campaign)
  const orphanedComments = await prisma.comment.findMany({
    where: {
      campaignId: {
        notIn: (await prisma.campaign.findMany({ select: { id: true } })).map(c => c.id)
      }
    },
    select: {
      id: true,
      createdAt: true,
      campaignId: true
    }
  })
  console.log('\nOrphaned Comments:', orphanedComments.length)
  if (orphanedComments.length > 0) {
    console.log(orphanedComments)
  }

  await prisma.$disconnect()
}

checkOrphanedData()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 