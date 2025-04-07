import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
})

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
              include: {
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

    // Format guest list
    const guestList = campaign.tickets.map(ticket => ({
      name: ticket.user.name,
      email: ticket.user.email,
      orders: ticket.orders.map(order => ({
        name: order.menuItem.name,
        quantity: order.quantity,
        choices: order.choices.map(choice => ({
          option: choice.option.name,
          selected: choice.selectedChoice.name
        }))
      }))
    }))

    // Create summary of orders
    const orderSummary = new Map<string, number>()
    const choiceSummary = new Map<string, number>()

    guestList.forEach(guest => {
      guest.orders.forEach(order => {
        // Count total items
        const itemKey = order.name
        orderSummary.set(itemKey, (orderSummary.get(itemKey) || 0) + order.quantity)

        // Count choices
        order.choices.forEach(choice => {
          const choiceKey = `${order.name} - ${choice.option}: ${choice.selected}`
          choiceSummary.set(choiceKey, (choiceSummary.get(choiceKey) || 0) + order.quantity)
        })
      })
    })

    // Convert summaries to arrays for easier rendering
    const orderSummaryArray = Array.from(orderSummary.entries())
    const choiceSummaryArray = Array.from(choiceSummary.entries())

    // Send email using nodemailer
    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: campaign.venue.contactEmail,
      subject: `Guest List & Preorders - ${campaign.title}`,
      html: `
        <h1>Guest List & Preorders</h1>
        <p>Campaign: ${campaign.title}</p>
        <p>Screening Date: ${new Date(campaign.screeningDate).toLocaleDateString()}</p>
        <p>Total Guests: ${guestList.length}</p>
        
        <h2>Order Summary</h2>
        <ul>
          ${orderSummaryArray.map(([item, quantity]) => `
            <li>${item}: ${quantity}</li>
          `).join('')}
        </ul>

        <h3>Detailed Choice Summary</h3>
        <ul>
          ${choiceSummaryArray.map(([choice, quantity]) => `
            <li>${choice}: ${quantity}</li>
          `).join('')}
        </ul>
        
        <h2>Detailed Guest List</h2>
        <ul>
          ${guestList.map(guest => `
            <li>
              <strong>${guest.name}</strong> (${guest.email})
              ${guest.orders.length > 0 ? `
                <ul>
                  ${guest.orders.map(order => `
                    <li>
                      ${order.name} x${order.quantity}
                      ${order.choices.length > 0 ? `
                        <ul>
                          ${order.choices.map(choice => `
                            <li>${choice.option}: ${choice.selected}</li>
                          `).join('')}
                        </ul>
                      ` : ''}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}
            </li>
          `).join('')}
        </ul>
      `
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error sending guest list:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 