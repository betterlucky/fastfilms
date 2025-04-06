import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string; menuItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // First, verify the menu item belongs to the venue
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.menuItemId },
    })

    if (!menuItem || menuItem.venueId !== params.id) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    // Update the menu item and its options
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: params.menuItemId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        options: {
          // Delete existing options and their choices
          deleteMany: {},
          // Create new options with their choices
          create: data.options.map((option: any) => ({
            name: option.name,
            description: option.description || "",
            isRequired: option.isRequired,
            minChoices: option.minChoices,
            maxChoices: option.maxChoices,
            choices: {
              create: option.choices.map((choice: any) => ({
                name: choice.name,
                priceAdjustment: choice.priceAdjustment,
              })),
            },
          })),
        },
      },
      include: {
        options: {
          include: {
            choices: true,
          },
        },
      },
    })

    return NextResponse.json(updatedMenuItem)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    )
  }
} 