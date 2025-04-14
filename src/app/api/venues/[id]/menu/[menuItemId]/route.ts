import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; menuItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // First, verify the menu item belongs to the venue
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.menuItemId },
      include: {
        options: {
          include: {
            choices: true
          }
        }
      }
    })

    if (!menuItem || menuItem.venueId !== params.id) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Update the menu item in a transaction
    const updatedMenuItem = await prisma.$transaction(async (tx) => {
      // 1. Update the menu item basic info
      const updated = await tx.menuItem.update({
        where: { id: params.menuItemId },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          isActive: data.isActive,
        },
      })

      // 2. Update each option
      for (const option of data.options) {
        if (option.id) {
          // Update existing option
          await tx.menuItemOption.update({
            where: { id: option.id },
            data: {
              name: option.name,
              description: option.description || '',
              minChoices: option.minChoices,
              maxChoices: option.maxChoices,
            },
          })

          // Update existing choices and add new ones
          const existingChoices = menuItem.options
            .find(o => o.id === option.id)
            ?.choices || []

          for (const choice of option.choices) {
            if (choice.id) {
              // Update existing choice
              await tx.menuItemOptionChoice.update({
                where: { id: choice.id },
                data: {
                  name: choice.name,
                  priceAdjustment: choice.priceAdjustment,
                },
              })
            } else {
              // Add new choice
              await tx.menuItemOptionChoice.create({
                data: {
                  name: choice.name,
                  priceAdjustment: choice.priceAdjustment,
                  optionId: option.id,
                },
              })
            }
          }

          // Remove choices that are no longer present
          const choiceIds = option.choices
            .filter(c => c.id)
            .map(c => c.id as string)
          
          const choicesToDelete = existingChoices
            .filter(c => !choiceIds.includes(c.id))
            .map(c => c.id)

          if (choicesToDelete.length > 0) {
            // Only delete choices that aren't referenced by any orders
            for (const choiceId of choicesToDelete) {
              const hasOrders = await tx.orderChoice.findFirst({
                where: { selectedChoiceId: choiceId }
              })
              
              if (!hasOrders) {
                await tx.menuItemOptionChoice.delete({
                  where: { id: choiceId }
                })
              }
            }
          }
        } else {
          // Create new option with its choices
          await tx.menuItemOption.create({
            data: {
              menuItemId: params.menuItemId,
              name: option.name,
              description: option.description || '',
              minChoices: option.minChoices,
              maxChoices: option.maxChoices,
              choices: {
                create: option.choices.map(choice => ({
                  name: choice.name,
                  priceAdjustment: choice.priceAdjustment,
                })),
              },
            },
          })
        }
      }

      // Remove options that are no longer present
      const optionIds = data.options
        .filter(o => o.id)
        .map(o => o.id as string)
      
      const optionsToDelete = menuItem.options
        .filter(o => !optionIds.includes(o.id))
        .map(o => o.id)

      if (optionsToDelete.length > 0) {
        // Only delete options that aren't referenced by any orders
        for (const optionId of optionsToDelete) {
          const hasOrders = await tx.orderChoice.findFirst({
            where: { optionId }
          })
          
          if (!hasOrders) {
            await tx.menuItemOption.delete({
              where: { id: optionId }
            })
          }
        }
      }

      // Return the updated menu item with all its relations
      return tx.menuItem.findUnique({
        where: { id: params.menuItemId },
        include: {
          options: {
            include: {
              choices: true,
            },
          },
        },
      })
    })

    return NextResponse.json(updatedMenuItem)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}
