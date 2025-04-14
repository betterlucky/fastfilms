import { getServerSession } from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import { generateTicketConfirmationEmail } from '@/lib/email'
import { settings } from '@/lib/settings'
import { Prisma, PurchaseStatus } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

interface MenuSelection {
  [menuItemId: string]: {
    quantity: number
    options: {
      [optionId: string]: string[][] // array of arrays of selected choice IDs, one array per quantity
    }
  }
}

interface RequestBody {
  campaignId: string
  quantity: number
  ticketPrice: number
  payItForwardTickets: number
  menuSelections: MenuSelection
}

// Helper function to validate total amount
const validateTotalAmount = (
  ticketsTotal: number,
  foodOrdersTotal: number,
  calculatedTotal: number,
  providedTotal: number
) => {
  const epsilon = 0.01 // Small difference allowed for floating point calculations
  if (Math.abs(calculatedTotal - providedTotal) > epsilon) {
    throw new Error(
      `Total amount mismatch. Expected: ${calculatedTotal}, Got: ${providedTotal}. ` +
        `(Tickets: ${ticketsTotal}, Food: ${foodOrdersTotal})`
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as RequestBody
    const { campaignId, quantity, ticketPrice, payItForwardTickets = 0, menuSelections = {} } = body

    console.log('Received request body:', body)

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 0) {
      console.log('Invalid quantity:', quantity)
      return NextResponse.json(
        { error: 'Invalid number of tickets' },
        { status: 400 }
      )
    }

    // Convert menu selections to the format expected by the database
    const validMenuSelections = Object.entries(menuSelections).map(([menuItemId, selection]) => ({
      menuItemId,
      quantity: selection.quantity,
    }))

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        venue: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: validMenuSelections.map((selection) => selection.menuItemId),
        },
      },
      include: {
        options: {
          include: {
            choices: true
          }
        }
      }
    })

    const foodOrdersTotal: number = validMenuSelections.reduce((total: number, selection) => {
      const menuItem = menuItems.find(
        (item) => item.id === selection.menuItemId
      )
      if (!menuItem) return total

      // Calculate total for each quantity separately
      const itemTotal = Array.from({ length: selection.quantity })
        .reduce<number>((quantityTotal, _, index) => {
          const basePrice = Number(menuItem.price)

          // Calculate price adjustments from choices for this specific quantity
          const choicesTotal = Object.entries(menuSelections[selection.menuItemId].options).reduce((choicesSum: number, [optionId, choiceArrays]) => {
            const option = menuItem.options.find(opt => opt.id === optionId)
            if (!option) return choicesSum

            const choiceId = choiceArrays[index]?.[0] || choiceArrays[0][0]
            const choice = option.choices.find(c => c.id === choiceId)
            if (!choice) return choicesSum

            return choicesSum + Number(choice.priceAdjustment)
          }, 0)

          return quantityTotal + basePrice + choicesTotal
        }, 0)

      return total + itemTotal
    }, 0)

    const regularTicketsTotal = quantity * ticketPrice
    const pifTicketsTotal = payItForwardTickets * settings.minimumTicketPrice
    const ticketsTotal = regularTicketsTotal + pifTicketsTotal
    const totalAmount = ticketsTotal + foodOrdersTotal + settings.transactionFee

    // Validate the calculated total
    validateTotalAmount(ticketsTotal, foodOrdersTotal, totalAmount, totalAmount)

    if (campaign.isTest) {
      const purchase = await prisma.$transaction(async (tx) => {
        const newPurchase = await tx.purchase.create({
          data: {
            userId: session.user.id,
            campaignId: campaign.id,
            totalAmount: new Prisma.Decimal(totalAmount),
            status: PurchaseStatus.CONFIRMED,
            tickets: {
              create: [
                ...Array(quantity).fill({
                  userId: session.user.id,
                  campaignId: campaign.id,
                  status: 'CONFIRMED',
                  pricePaid: new Prisma.Decimal(ticketPrice),
                }),
                ...Array(payItForwardTickets).fill({
                  userId: session.user.id,
                  campaignId: campaign.id,
                  status: 'PAY_IT_FORWARD',
                  pricePaid: new Prisma.Decimal(settings.minimumTicketPrice),
                }),
              ],
            },
            orders:
              validMenuSelections.length > 0
                ? {
                    create: validMenuSelections.flatMap((selection) => {
                      // Create separate orders for each quantity to handle different choices
                      return Array.from({ length: selection.quantity }).map((_, index) => ({
                        menuItem: {
                          connect: { id: selection.menuItemId }
                        },
                        quantity: 1, // Each order has quantity 1 since we're creating multiple orders
                        choices: {
                          create: Object.entries(menuSelections[selection.menuItemId].options).map(([optionId, choiceArrays]) => ({
                            option: {
                              connect: { id: optionId }
                            },
                            selectedChoices: {
                              connect: (choiceArrays[index] || []).map(choiceId => ({
                                id: choiceId
                              }))
                            }
                          }))
                        }
                      }))
                    })
                  }
                : undefined,
          },
          include: {
            tickets: true,
            orders: {
              include: {
                menuItem: true,
                choices: {
                  include: {
                    option: true,
                    selectedChoices: true
                  }
                }
              }
            }
          }
        })

        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            currentTickets: {
              increment: quantity + payItForwardTickets,
            },
            currentFunding: {
              increment: ticketsTotal,
            },
          },
        })

        return newPurchase
      })

      // Generate and send confirmation email
      const emailData = {
        movieTitle: campaign.movieTitle,
        venueName: campaign.venue.name,
        screeningDate: campaign.screeningDate,
        ticketQuantity: quantity + payItForwardTickets,
        totalAmount: totalAmount,
        regularTickets: quantity,
        pifTickets: payItForwardTickets,
        ticketPrice: ticketPrice,
        foodOrders: purchase.orders.map((order) => ({
          name: order.menuItem.name,
          quantity: order.quantity,
          price: Number(order.menuItem.price),
          options: order.choices.map((choice) => ({
            name: choice.option.name,
            choice: choice.selectedChoices.map(c => c.name).join(', '),
            priceAdjustment: Number(choice.selectedChoices.reduce((sum, c) => sum + Number(c.priceAdjustment), 0))
          })),
        })),
      }

      const emailHtml = generateTicketConfirmationEmail(emailData)
      await sendEmail({
        to: session.user.email || '',
        subject: `Your tickets for ${campaign.movieTitle}`,
        html: emailHtml,
      })

      return NextResponse.json({
        success: true,
        purchase,
        ticketIds: purchase.tickets.map(t => t.id),
        clientSecret: 'test_mode',
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(totalAmount, 'usd'),
      currency: 'usd',
      metadata: {
        userId: session.user.id,
        campaignId: campaign.id,
        quantity,
        payItForwardTickets,
        menuSelections: JSON.stringify(validMenuSelections),
      },
    })

    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        campaignId: campaign.id,
        totalAmount: new Prisma.Decimal(totalAmount),
        status: PurchaseStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        tickets: {
          create: [
            ...Array(quantity).fill({
              userId: session.user.id,
              campaignId: campaign.id,
              status: 'PENDING',
              pricePaid: new Prisma.Decimal(ticketPrice),
            }),
            ...Array(payItForwardTickets).fill({
              userId: session.user.id,
              campaignId: campaign.id,
              status: 'PAY_IT_FORWARD',
              pricePaid: new Prisma.Decimal(settings.minimumTicketPrice),
            }),
          ],
        },
        orders:
          validMenuSelections.length > 0
            ? {
                create: validMenuSelections.flatMap((selection) => {
                  // Create separate orders for each quantity to handle different choices
                  return Array.from({ length: selection.quantity }).map((_, index) => ({
                    menuItem: {
                      connect: { id: selection.menuItemId }
                    },
                    quantity: 1, // Each order has quantity 1 since we're creating multiple orders
                    choices: {
                      create: Object.entries(menuSelections[selection.menuItemId].options).map(([optionId, choiceArrays]) => ({
                        option: {
                          connect: { id: optionId }
                        },
                        selectedChoices: {
                          connect: (choiceArrays[index] || []).map(choiceId => ({
                            id: choiceId
                          }))
                        }
                      }))
                    }
                  }))
                })
              }
            : undefined,
      },
      include: {
        tickets: true,
        orders: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      purchase,
      ticketIds: purchase.tickets.map(t => t.id),
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create payment intent',
      },
      { status: 500 }
    )
  }
}
