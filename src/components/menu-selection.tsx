'use client'

import { useState } from 'react'
import { MenuItem, MenuItemOption, MenuItemOptionChoice } from '@prisma/client'

interface MenuItemWithOptions extends MenuItem {
  options: (MenuItemOption & {
    choices: MenuItemOptionChoice[]
  })[]
}

interface OrderChoice {
  optionId: string
  selectedChoice: string
}

interface Order {
  menuItemId: string
  quantity: number
  choices: OrderChoice[]
}

interface MenuSelectionProps {
  menuItems: MenuItemWithOptions[]
  onOrdersChange: (orders: Order[]) => void
}

export function MenuSelection({
  menuItems,
  onOrdersChange,
}: MenuSelectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [choices, setChoices] = useState<
    Record<string, Record<string, string>>
  >({})

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    const newQuantities = {
      ...quantities,
      [menuItemId]: quantity,
    }
    setQuantities(newQuantities)
    updateOrders(newQuantities, choices)
  }

  const handleChoiceChange = (
    menuItemId: string,
    optionId: string,
    choice: string
  ) => {
    const newChoices = {
      ...choices,
      [menuItemId]: {
        ...(choices[menuItemId] || {}),
        [optionId]: choice,
      },
    }
    setChoices(newChoices)
    updateOrders(quantities, newChoices)
  }

  const updateOrders = (
    currentQuantities: Record<string, number>,
    currentChoices: Record<string, Record<string, string>>
  ) => {
    const orders = Object.entries(currentQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => {
        const menuItem = menuItems.find((item) => item.id === menuItemId)
        const itemChoices = currentChoices[menuItemId] || {}

        return {
          menuItemId,
          quantity,
          choices:
            menuItem?.options.map((option) => ({
              optionId: option.id,
              selectedChoice: itemChoices[option.id] || option.choices[0].id,
            })) || [],
        }
      })

    onOrdersChange(orders)
  }

  const groupedItems = menuItems.reduce(
    (groups, item) => {
      const group = groups[item.category] || []
      group.push(item)
      return { ...groups, [item.category]: group }
    },
    {} as Record<string, MenuItemWithOptions[]>
  )

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {category.charAt(0).toUpperCase() +
                  category.slice(1).toLowerCase()}
                s
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          £{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              Math.max(0, (quantities[item.id] || 0) - 1)
                            )
                          }
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">
                          {quantities[item.id] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              (quantities[item.id] || 0) + 1
                            )
                          }
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {quantities[item.id] > 0 && item.options.length > 0 && (
                      <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                        {item.options.map((option) => (
                          <div key={option.id}>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              {option.name}
                              {option.minChoices > 0 && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </label>
                            <select
                              value={
                                choices[item.id]?.[option.id] ||
                                option.choices[0].id
                              }
                              onChange={(e) =>
                                handleChoiceChange(
                                  item.id,
                                  option.id,
                                  e.target.value
                                )
                              }
                              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                              {option.choices.map((choice) => (
                                <option key={choice.id} value={choice.id}>
                                  {choice.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
