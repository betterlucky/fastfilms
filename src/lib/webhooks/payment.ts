import { PrismaClient, Prisma } from "@prisma/client"
import { sendEmail } from "@/lib/email"
import { WebhookHandlerResponse, OrderWithMenuItem, TicketWithOrders } from "./types"

const prisma = new PrismaClient()

export async function handlePaymentSuccess(
  ticketIds: string[],
  campaignId: string,
  userId: string,
  paymentIntentId: string,
  amount: number
): Promise<WebhookHandlerResponse> {
  try {
    // Update tickets and orders to confirmed status
    await prisma.$transaction(async (prisma) => {
      await prisma.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { status: "CONFIRMED", stripePaymentIntentId: paymentIntentId },
      })

      await prisma.order.updateMany({
        where: { ticketId: { in: ticketIds } },
        data: { status: "CONFIRMED" },
      })
    })

    // Get campaign and user details for the email
    const [campaign, user] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          title: true,
          screeningDate: true,
          venue: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
    ])

    if (!campaign || !user?.email) {
      return {
        received: false,
        error: "Campaign or user not found",
        status: 404,
      }
    }

    // Get tickets with orders for the email
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      include: {
        orders: {
          include: {
            menuItem: true,
          },
        },
      },
    }) as TicketWithOrders[]

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: `Ticket Confirmation - ${campaign.title}`,
      html: generateConfirmationEmail(campaign, tickets, amount),
    })

    // Update campaign funding
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentFunding: {
          increment: amount,
        },
      },
    })

    return { received: true }
  } catch (error) {
    console.error("Error processing payment success:", error)
    return {
      received: false,
      error: "Failed to process payment success",
      status: 500,
    }
  }
}

export async function handlePaymentFailure(
  ticketIds: string[]
): Promise<WebhookHandlerResponse> {
  try {
    await prisma.ticket.deleteMany({
      where: { id: { in: ticketIds } },
    })

    return { received: true }
  } catch (error) {
    console.error("Error processing payment failure:", error)
    return {
      received: false,
      error: "Failed to process payment failure",
      status: 500,
    }
  }
}

interface Campaign {
  title: string
  venue: {
    name: string
  }
  screeningDate: Date
}

function generateConfirmationEmail(
  campaign: Campaign,
  tickets: TicketWithOrders[],
  amount: number
): string {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })

  const formatPrice = (price: number | Prisma.Decimal) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(Number(price) / 100)

  const ticketList = tickets
    .map((ticket) => {
      const ordersList = ticket.orders
        .map((order) => {
          const choices = order.choices
            .map(
              (choice) =>
                `${choice.selectedChoice} (${choice.optionId})`
            )
            .join(", ")

          return `
            <li>
              ${order.menuItem.name}${choices ? ` - ${choices}` : ""}
              (${formatPrice(order.menuItem.price)})
            </li>
          `
        })
        .join("")

      return `
        <div style="margin-bottom: 20px;">
          <h3>Ticket #${ticket.id}</h3>
          ${ordersList ? `<h4>Orders:</h4><ul>${ordersList}</ul>` : ""}
        </div>
      `
    })
    .join("")

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Ticket Confirmation</h1>
      <h2>${campaign.title}</h2>
      <p>
        <strong>Venue:</strong> ${campaign.venue.name}<br>
        <strong>Date:</strong> ${formatDate(campaign.screeningDate)}<br>
        <strong>Total Amount:</strong> ${formatPrice(amount)}
      </p>
      ${ticketList}
      <p>Thank you for your purchase!</p>
    </div>
  `
} 