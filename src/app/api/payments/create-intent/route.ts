import { getServerSession } from "next-auth"
import { NextResponse, type NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { stripe, formatAmountForStripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { campaignId, quantity = 1 } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    if (campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      )
    }

    if (campaign.currentTickets + quantity > campaign.ticketCap) {
      return NextResponse.json(
        { error: "Not enough tickets available" },
        { status: 400 }
      )
    }

    // Calculate total amount (£5 per ticket + £0.50 transaction fee)
    const ticketPrice = 5
    const transactionFee = 0.5
    const totalAmount = (ticketPrice * quantity) + transactionFee

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(totalAmount, "GBP"),
      currency: "gbp",
      metadata: {
        campaignId,
        userId: session.user.id,
        quantity: quantity.toString(),
      },
    })

    // Create pending ticket(s)
    const tickets = await Promise.all(
      Array.from({ length: quantity }).map(() =>
        prisma.ticket.create({
          data: {
            campaignId,
            userId: session.user.id,
            pricePaid: ticketPrice,
            status: "PENDING",
            stripePaymentIntentId: paymentIntent.id,
          },
        })
      )
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      ticketIds: tickets.map(ticket => ticket.id),
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
} 