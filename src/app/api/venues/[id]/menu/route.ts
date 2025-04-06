import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        venueId: params.id,
      },
      include: {
        options: {
          include: {
            choices: true,
          },
        },
      },
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        venue: {
          connect: {
            id: params.id
          }
        },
        options: {
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

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    )
  }
}

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

    // Delete existing options and choices
    await prisma.$transaction([
      prisma.menuItemOption.deleteMany({
        where: {
          menuItemId: params.menuItemId,
        },
      }),
    ])

    // Update menu item and create new options and choices
    const menuItem = await prisma.menuItem.update({
      where: {
        id: params.menuItemId,
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        options: {
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

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; menuItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the menu item (cascade will handle related records)
    await prisma.menuItem.delete({
      where: {
        id: params.menuItemId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    )
  }
} 