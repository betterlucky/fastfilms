"use client"

import { useState } from "react"
import { MenuItem, MenuItemOption, MenuItemOptionChoice } from "@prisma/client"

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

export function MenuSelection({ menuItems, onOrdersChange }: MenuSelectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [choices, setChoices] = useState<Record<string, Record<string, string>>>({})

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    const newQuantities = {
      ...quantities,
      [menuItemId]: quantity,
    }
    setQuantities(newQuantities)
    updateOrders(newQuantities, choices)
  }

  const handleChoiceChange = (menuItemId: string, optionId: string, choice: string) => {
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
        const menuItem = menuItems.find(item => item.id === menuItemId)
        const itemChoices = currentChoices[menuItemId] || {}
        
        return {
          menuItemId,
          quantity,
          choices: menuItem?.options.map(option => ({
            optionId: option.id,
            selectedChoice: itemChoices[option.id] || option.choices[0].id,
          })) || [],
        }
      })

    onOrdersChange(orders)
  }

  const groupedItems = menuItems.reduce((groups, item) => {
    const group = groups[item.category] || []
    group.push(item)
    return { ...groups, [item.category]: group }
  }, {} as Record<string, MenuItemWithOptions[]>)

  return (
    <div className="ring-1 ring-gray-900/5 bg-white shadow-sm sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-4 font-semibold text-lg text-gray-900">
                {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}s
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="items-center justify-between flex mb-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="mt-1 font-medium text-sm text-gray-900">
                          £{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="items-center flex space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              Math.max(0, (quantities[item.id] || 0) - 1)
                            )
                          }
                          className="ring-1 ring-inset ring-gray-300 px-2.5 py-1.5 hover:bg-gray-50 font-semibold text-sm text-gray-900 bg-white rounded-md shadow-sm"
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
                          className="ring-1 ring-inset ring-gray-300 px-2.5 py-1.5 hover:bg-gray-50 font-semibold text-sm text-gray-900 bg-white rounded-md shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {quantities[item.id] > 0 && item.options.length > 0 && (
                      <div className="space-y-4 pt-4 mt-4 border-t border-gray-200">
                        {item.options.map((option) => (
                          <div key={option.id}>
                            <label className="block mb-1 font-medium text-sm text-gray-700">
                              {option.name}
                              {option.minChoices > 0 && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </label>
                            <select
                              value={
                                choices[item.id]?.[option.id] || option.choices[0].id
                              }
                              onChange={(e) =>
                                handleChoiceChange(
                                  item.id,
                                  option.id,
                                  e.target.value
                                )
                              }
                              className="ring-1 ring-inset ring-gray-300 block py-1.5 pl-3 pr-10 w-full text-gray-900 border-0 rounded-md focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
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