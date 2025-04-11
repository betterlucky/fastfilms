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

    // Get orders directly for preorders PDF
    const orders = await prisma.order.findMany({
      where: {
        purchase: {
          campaignId: params.id,
          status: 'CONFIRMED',
        }
      },
      include: {
        purchase: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        menuItem: {
          select: {
            name: true,
            price: true,
            category: true,
          }
        },
        choices: {
          include: {
            option: {
              select: {
                name: true,
                order: true,
              }
            },
            selectedChoice: {
              select: {
                name: true,
                priceAdjustment: true,
              }
            }
          }
        }
      }
    })

    // Generate PDFs
    const guestListPDF = await generateGuestListPDF({
      campaign: {
        ...campaign,
        venue: campaign.venue,
      },
      tickets: campaign.tickets,
    })

    const preordersPDF = await generatePreordersPDF({
      campaign: {
        ...campaign,
        venue: campaign.venue,
      },
      orders: orders.map(order => ({
        id: order.id,
        quantity: order.quantity,
        user: order.purchase.user,
        menuItem: {
          name: order.menuItem.name,
          price: Number(order.menuItem.price),
          category: order.menuItem.category,
        },
        choices: order.choices.map(choice => ({
          option: {
            name: choice.option.name,
            order: choice.option.order,
          },
          selectedChoice: {
            name: choice.selectedChoice.name,
            priceAdjustment: choice.selectedChoice.priceAdjustment 
              ? Number(choice.selectedChoice.priceAdjustment)
              : undefined,
          },
        })),
      })),
    })

    // Send email with PDF attachments
    const message = {
      from: process.env.CONTACT_EMAIL,
      to: campaign.venue.contactEmail,
      subject: `Guest List and Preorders for ${campaign.title}`,
      text: `Please find attached the guest list and preorders for ${campaign.title}.`,
      attachments: [
        {
          filename: 'guest-list.pdf',
          content: guestListPDF,
        },
        {
          filename: 'preorders.pdf',
          content: preordersPDF,
        },
      ],
    }

    await transporter.sendMail(message)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error sending guest list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
