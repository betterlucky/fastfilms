import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  generateGuestListPDF,
  generatePreordersPDF,
} from '@/lib/pdf/generate-guest-list'
import nodemailer from 'nodemailer'
import { Campaign, Order, Ticket, TicketStatus } from '@prisma/client'

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
})

// Helper function to format date in UK format
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            name: true,
            contactEmail: true,
          },
        },
        tickets: {
          where: {
            status: TicketStatus.CONFIRMED,
          },
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
                        name: true,
                        price: true
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
                            priceAdjustment: true
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

    if (!campaign) {
      return new NextResponse('Campaign not found', { status: 404 })
    }

    if (!campaign.venue?.contactEmail) {
      return new NextResponse('Venue contact email not set', { status: 400 })
    }

    // Transform tickets to include orders from their purchases
    const ticketsWithOrders = campaign.tickets.map((ticket) => ({
      ...ticket,
      orders:
        ticket.purchase?.orders.map((order) => ({
          id: order.id,
          quantity: order.quantity,
        })) || [],
    }))

    // Transform orders for preorder PDF
    const allOrders = Array.from(
      new Set(
        campaign.tickets.map(ticket => ticket.purchase?.id)
      )
    ).flatMap(purchaseId => {
      const ticket = campaign.tickets.find(t => t.purchase?.id === purchaseId)
      if (!ticket || !ticket.purchase) return []
      
      return ticket.purchase.orders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        purchaseId: order.purchaseId,
        menuItemId: order.menuItemId,
        quantity: order.quantity,
        user: {
          name: ticket.user.name,
          email: ticket.user.email
        },
        menuItem: {
          name: order.menuItem.name,
          price: Number(order.menuItem.price)
        },
        choices: order.choices.map(choice => ({
          option: {
            name: choice.option.name
          },
          selectedChoice: {
            name: choice.selectedChoice.name,
            priceAdjustment: Number(choice.selectedChoice.priceAdjustment)
          }
        }))
      }))
    })

    // Generate PDFs
    const guestListPDF = await generateGuestListPDF({
      campaign: {
        ...campaign,
        venue: campaign.venue,
      },
      tickets: ticketsWithOrders,
    })

    const preordersPDF = await generatePreordersPDF({
      campaign: {
        ...campaign,
        venue: campaign.venue,
      },
      orders: allOrders,
    })

    // Send email with PDF attachments
    const message = `Guest list for ${campaign.movieTitle}
Date: ${new Date(campaign.screeningDate).toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})}
Time: ${new Date(campaign.screeningDate).toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})}
Total Guests: ${campaign.tickets.length}`

    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: campaign.venue.contactEmail,
      subject: `Guest List & Preorders - ${campaign.title}`,
      text: message,
      attachments: [
        {
          filename: `${campaign.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_guestlist.pdf`,
          content: guestListPDF,
        },
        {
          filename: `${campaign.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preorders.pdf`,
          content: preordersPDF,
        },
      ],
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error sending guest list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
