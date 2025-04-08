import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { generateVenueGuestListEmail } from '@/lib/email'
import { PrismaClient, TicketStatus } from '@prisma/client'

export async function sendGuestListsForToday(): Promise<{
  guestListsSent: number
}> {
  try {
    // Get all campaigns screening today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const campaigns = await prisma.campaign.findMany({
      where: {
        screeningDate: {
          gte: today,
          lt: tomorrow,
        },
        status: 'ACTIVE',
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
          },
        },
        tickets: {
          where: { status: TicketStatus.CONFIRMED },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            purchase: {
              include: {
                orders: {
                  include: {
                    menuItem: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                      },
                    },
                    choices: {
                      include: {
                        option: {
                          select: {
                            name: true,
                          },
                        },
                        selectedChoice: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    let guestListsSent = 0

    for (const campaign of campaigns) {
      // Check if venue has any contact emails
      if (!campaign.venue.contactEmail?.length) continue

      // Group tickets by user to create guest list
      const guestList = campaign.tickets.reduce(
        (acc, ticket) => {
          const existingGuest = acc.find((g) => g.email === ticket.user.email)
          const ticketOrders = ticket.purchase?.orders || []

          if (existingGuest) {
            existingGuest.ticketCount += 1
            existingGuest.foodOrders.push(
              ...ticketOrders.map((order) => ({
                itemName: order.menuItem.name,
                quantity: order.quantity,
                options: order.choices.map((choice) => ({
                  optionName: choice.option?.name || '',
                  choice: choice.selectedChoice?.name || '',
                })),
              }))
            )
          } else {
            acc.push({
              name: ticket.user.name || 'Guest',
              email: ticket.user.email,
              ticketCount: 1,
              foodOrders: ticketOrders.map((order) => ({
                itemName: order.menuItem.name,
                quantity: order.quantity,
                options: order.choices.map((choice) => ({
                  optionName: choice.option?.name || '',
                  choice: choice.selectedChoice?.name || '',
                })),
              })),
            })
          }
          return acc
        },
        [] as Array<{
          name: string | null
          email: string
          ticketCount: number
          foodOrders: Array<{
            itemName: string
            quantity: number
            options: Array<{
              optionName: string
              choice: string
            }>
          }>
        }>
      )

      const emailHtml = generateVenueGuestListEmail({
        movieTitle: campaign.movieTitle,
        venueName: campaign.venue.name,
        screeningDate: campaign.screeningDate,
        screeningTime: campaign.screeningTime,
        totalTickets: campaign.tickets.length,
        guestList,
      })

      await sendEmail({
        to: campaign.venue.contactEmail,
        subject: `Guest List and Food Orders - ${campaign.movieTitle}`,
        html: emailHtml,
      })

      guestListsSent++
    }

    return { guestListsSent }
  } catch (error) {
    console.error('Error sending guest lists:', error)
    throw error
  }
}
