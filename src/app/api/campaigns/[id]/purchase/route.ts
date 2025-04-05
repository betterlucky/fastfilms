import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { Campaign, MenuItem, MenuItemOption, Ticket } from "@prisma/client"
import Stripe from "stripe"

interface Order {
  menuItemId: string
  quantity: number
  choices: {
    optionId: string
    selectedChoice: string
  }[]
}

interface CampaignWithVenue extends Campaign {
  venue: {
    menuItems: (MenuItem & {
      options: MenuItemOption[]
    })[]
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get campaign ID from URL
    const campaignId = request.url.split('/').pop()
    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }

    const { quantity, orders } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid ticket quantity" },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        venue: {
          include: {
            menuItems: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    }) as CampaignWithVenue | null

    if (!campaign) {
      return Response.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    if (campaign.status !== "ACTIVE") {
      return Response.json(
        { error: "Campaign is not active" },
        { status: 400 }
      )
    }

    const ticketPrice = 5.00 // £5 minimum ticket price
    const ticketTotal = quantity * ticketPrice
    const transactionFee = Math.ceil(ticketTotal * 0.029 + 30) // 2.9% + 30p Stripe fee

    // Validate menu items and calculate order total
    let orderTotal = 0
    const validatedOrders: Order[] = []

    if (orders && orders.length > 0) {
      for (const order of orders) {
        const menuItem = campaign.venue.menuItems.find(
          (item) => item.id === order.menuItemId
        )

        if (!menuItem) {
          return Response.json(
            { error: `Invalid menu item: ${order.menuItemId}` },
            { status: 400 }
          )
        }

        // Validate required options
        for (const option of menuItem.options) {
          if (option.required) {
            const choice = order.choices.find(
              (c: { optionId: string; selectedChoice: string }) => c.optionId === option.id
            )
            if (!choice) {
              return Response.json(
                {
                  error: `Required option ${option.name} not selected for ${menuItem.name}`,
                },
                { status: 400 }
              )
            }
            if (!option.choices.includes(choice.selectedChoice)) {
              return Response.json(
                {
                  error: `Invalid choice ${choice.selectedChoice} for option ${option.name}`,
                },
                { status: 400 }
              )
            }
          }
        }

        // Validate all provided choices
        for (const choice of order.choices) {
          const option = menuItem.options.find(
            (opt) => opt.id === choice.optionId
          )
          if (!option) {
            return Response.json(
              { error: `Invalid option: ${choice.optionId}` },
              { status: 400 }
            )
          }
          if (!option.choices.includes(choice.selectedChoice)) {
            return Response.json(
              {
                error: `Invalid choice ${choice.selectedChoice} for option ${option.name}`,
              },
              { status: 400 }
            )
          }
        }

        orderTotal += Number(menuItem.price) * order.quantity
        validatedOrders.push(order)
      }
    }

    const total = ticketTotal + transactionFee + orderTotal

    // Create pending tickets
    const tickets = await prisma.$transaction(
      Array(quantity)
        .fill(null)
        .map(() =>
          prisma.ticket.create({
            data: {
              campaignId: campaign.id,
              userId: session.user.id,
              status: "PENDING",
              pricePaid: ticketPrice,
              stripePaymentIntentId: null,
            },
          })
        )
    )

    // Create pending orders
    if (validatedOrders.length > 0) {
      await prisma.$transaction(
        validatedOrders.flatMap((order) =>
          Array(order.quantity)
            .fill(null)
            .map(() =>
              prisma.order.create({
                data: {
                  menuItemId: order.menuItemId,
                  ticketId: tickets[0].id, // Link to first ticket for now
                  status: "PENDING",
                  choices: order.choices,
                },
              })
            )
        )
      )
    }

    try {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents and ensure integer
        currency: "gbp",
        metadata: {
          ticketIds: tickets.map((ticket) => ticket.id).join(","),
          campaignId: campaign.id,
          userId: session.user.id,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      // Update tickets with payment intent ID
      await prisma.ticket.updateMany({
        where: {
          id: {
            in: tickets.map((ticket) => ticket.id),
          },
        },
        data: {
          stripePaymentIntentId: paymentIntent.id,
        },
      })

      return Response.json({
        clientSecret: paymentIntent.client_secret,
        ticketIds: tickets.map((ticket) => ticket.id),
      })
    } catch (stripeError) {
      console.error("Stripe error:", stripeError)
      
      // Clean up pending tickets and orders
      await prisma.ticket.deleteMany({
        where: {
          id: {
            in: tickets.map((ticket) => ticket.id),
          },
        },
      })

      if (stripeError instanceof Stripe.errors.StripeError) {
        return Response.json(
          { error: stripeError.message },
          { status: stripeError.statusCode || 500 }
        )
      }

      return Response.json(
        { error: "Failed to create payment intent" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error processing ticket purchase:", error)
    return Response.json(
      { error: "Failed to process ticket purchase" },
      { status: 500 }
    )
  }
} 