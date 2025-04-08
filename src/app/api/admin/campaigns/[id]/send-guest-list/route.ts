import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generateGuestListPDF, generatePreordersPDF } from "@/lib/pdf/generate-guest-list"

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
})

// Helper function to format date in UK format
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            name: true,
            contactEmail: true
          }
        },
        tickets: {
          where: {
            status: "CONFIRMED"
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            orders: {
              select: {
                id: true,
                quantity: true
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 })
    }

    if (!campaign.venue.contactEmail) {
      return new NextResponse("Venue contact email not set", { status: 400 })
    }

    // Get all orders with their details
    const orders = await prisma.order.findMany({
      where: {
        ticketId: {
          in: campaign.tickets.map(t => t.id)
        }
      },
      include: {
        ticket: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        menuItem: {
          select: {
            name: true
          }
        },
        choices: {
          include: {
            option: {
              select: {
                name: true
              }
            },
            selectedChoice: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Transform orders to match the expected type
    const transformedOrders = orders.map(order => ({
      ...order,
      user: order.ticket.user
    }))

    // Generate PDFs
    const guestListPDF = await generateGuestListPDF({
      campaign,
      tickets: campaign.tickets
    })

    const preordersPDF = await generatePreordersPDF({
      campaign,
      orders: transformedOrders
    })

    // Send email with PDF attachments
    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: campaign.venue.contactEmail,
      subject: `Guest List & Preorders - ${campaign.title}`,
      text: `Please find attached the guest list and preorders for ${campaign.title}.\n\nVenue: ${campaign.venue.name}\nDate: ${formatDate(campaign.screeningDate)}\nTime: ${campaign.screeningTime}\nTotal Guests: ${campaign.tickets.length}`,
      attachments: [
        {
          filename: `${campaign.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_guestlist.pdf`,
          content: guestListPDF
        },
        {
          filename: `${campaign.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preorders.pdf`,
          content: preordersPDF
        }
      ]
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error sending guest list:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 