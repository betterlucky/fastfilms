'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { settings } from "@/config/settings"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  options: {
    id: string
    name: string
    minChoices: number
    maxChoices: number
    choices: {
      id: string
      name: string
      priceAdjustment: number
    }[]
  }[]
}

interface BookingFormProps {
  campaignId: string
  maxTickets: number
  charity?: {
    name: string
    description: string | null
    logoPath: string | null
  } | null
  menuItems: MenuItem[]
}

interface MenuSelection {
  [menuItemId: string]: {
    quantity: number
    options: {
      [optionId: string]: string[][] // array of arrays of selected choice IDs, one array per quantity
    }
  }
}

interface OrderTotals {
  subtotal: number
  menuTotal: number
  regularTotal: number
  grandTotal: number
}

interface OptionValidation {
  [optionId: string]: {
    isValid: boolean
    message: string | null
  }
}

interface MenuValidation {
  [menuItemId: string]: OptionValidation
}

export default function BookingForm({ campaignId, maxTickets, charity, menuItems }: BookingFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const [quantity, setQuantity] = useState(1)
  const [ticketPrice, setTicketPrice] = useState(isAdmin ? 0.01 : settings.minimumTicketPrice)
  const [payItForwardTickets, setPayItForwardTickets] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [menuSelections, setMenuSelections] = useState<MenuSelection>({})
  const [totals, setTotals] = useState<OrderTotals>({
    subtotal: 0,
    menuTotal: 0,
    regularTotal: 0,
    grandTotal: 0
  })
  const [validation, setValidation] = useState<MenuValidation>({})

  useEffect(() => {
    updateTotals()
  }, [quantity, ticketPrice, payItForwardTickets, menuSelections])

  function calculateMenuTotal() {
    return Object.entries(menuSelections).reduce((total, [menuItemId, selection]) => {
      const menuItem = menuItems.find(item => item.id === menuItemId)
      if (!menuItem) return total

      const itemTotal = selection.quantity * menuItem.price
      const optionsTotal = Object.entries(selection.options).reduce((optTotal, [optionId, choiceArrays]) => {
        const option = menuItem.options.find(opt => opt.id === optionId)
        if (!option) return optTotal

        // Sum up adjustments for all quantities
        const adjustmentsTotal = choiceArrays.reduce((quantityTotal, choices) => {
          return quantityTotal + choices.reduce((choiceTotal, choiceId) => {
            const choice = option.choices.find(c => c.id === choiceId)
            return choiceTotal + (choice?.priceAdjustment || 0)
          }, 0)
        }, 0)

        return optTotal + adjustmentsTotal
      }, 0)

      return total + itemTotal + optionsTotal
    }, 0)
  }

  function updateTotals() {
    const subtotal = quantity * ticketPrice
    const payItForwardSubtotal = payItForwardTickets * settings.minimumTicketPrice
    const menuTotal = calculateMenuTotal()
    const regularTotal = subtotal + settings.transactionFee
    const grandTotal = regularTotal + payItForwardSubtotal + menuTotal

    setTotals({
      subtotal,
      menuTotal,
      regularTotal,
      grandTotal
    })
  }

  const handleMenuItemQuantityChange = (menuItemId: string, newQuantity: number) => {
    setMenuSelections(prev => {
      const currentQuantity = prev[menuItemId]?.quantity || 0;
      
      // If quantity is being set to 0, remove the item entirely
      if (newQuantity === 0) {
        const { [menuItemId]: _, ...rest } = prev;
        return rest;
      }

      const currentOptions = prev[menuItemId]?.options || {};
      
      // If reducing quantity, trim the selections arrays
      const updatedOptions: Record<string, string[][]> = {};
      Object.entries(currentOptions).forEach(([optionId, selections]) => {
        updatedOptions[optionId] = (selections as string[][]).slice(0, newQuantity);
      });

      // If increasing quantity, initialize new slots with empty arrays
      if (newQuantity > currentQuantity) {
        const menuItem = menuItems.find(item => item.id === menuItemId);
        if (menuItem) {
          menuItem.options.forEach(option => {
            if (!updatedOptions[option.id]) {
              updatedOptions[option.id] = [];
            }
            // Initialize new slots, auto-selecting single choices if minChoices > 0
            while (updatedOptions[option.id].length < newQuantity) {
              updatedOptions[option.id].push(
                option.choices.length === 1 ? [option.choices[0].id] : []
              );
            }
          });
        }
      }

      return {
        ...prev,
        [menuItemId]: {
          quantity: newQuantity,
          options: updatedOptions
        }
      };
    });
  };

  const handleOptionChoiceChange = (
    menuItemId: string, 
    optionId: string, 
    choiceIds: string[], 
    index: number
  ) => {
    setMenuSelections(prev => {
      // Ensure the menu item exists in the state
      if (!prev[menuItemId]) {
        return prev;
      }

      const currentOptions = prev[menuItemId].options || {};
      const currentSelections = currentOptions[optionId] || Array(prev[menuItemId].quantity).fill([]);
      const updatedSelections = [...currentSelections];
      updatedSelections[index] = choiceIds;

      return {
        ...prev,
        [menuItemId]: {
          ...prev[menuItemId],
          options: {
            ...currentOptions,
            [optionId]: updatedSelections
          }
        }
      };
    });
  };

  const validateMenuSelections = () => {
    const newValidation: MenuValidation = {};
    
    Object.entries(menuSelections).forEach(([menuItemId, selection]) => {
      if (selection.quantity > 0) {
        const menuItem = menuItems.find(item => item.id === menuItemId);
        if (!menuItem) return;

        const optionValidation: OptionValidation = {};
        menuItem.options.forEach(option => {
          const allSelectionsValid = Array.from({ length: selection.quantity }).every((_, index) => {
            const selectedChoices = selection.options[option.id]?.[index] || [];
            return selectedChoices.length >= option.minChoices && 
                   selectedChoices.length <= option.maxChoices;
          });
          
          optionValidation[option.id] = {
            isValid: allSelectionsValid,
            message: !allSelectionsValid 
              ? option.minChoices === option.maxChoices
                ? `Please select exactly ${option.minChoices} ${option.name.toLowerCase()} for each item`
                : `Please select between ${option.minChoices} and ${option.maxChoices} ${option.name.toLowerCase()} for each item`
              : null
          };
        });
        
        newValidation[menuItemId] = optionValidation;
      }
    });

    setValidation(newValidation);
    return Object.values(newValidation).every(itemValidation => 
      Object.values(itemValidation).every(v => v.isValid)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate menu selections before proceeding
    if (!validateMenuSelections()) {
      setError("Please select all required options for your menu items")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          quantity,
          ticketPrice,
          payItForwardTickets,
          menuSelections
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      router.push(`/payment?clientSecret=${data.clientSecret}&ticketIds=${data.ticketIds.join(",")}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {charity && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            If you are able to pay more for your ticket, you'll help make this screening more likely to happen as well as supporting {charity.name}'s important work.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Number of Tickets
          </label>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Number of Tickets</p>
              <p className="text-sm text-gray-500">Minimum £5.00 per ticket + £0.50 transaction fee</p>
              {isAdmin && (
                <p className="text-sm text-yellow-600">Admin testing mode: £0.01 tickets available</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                name="quantity"
                min="1"
                max={maxTickets}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">
            Price per Ticket
          </label>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Price per Ticket</p>
              <p className="text-sm text-gray-500">
                {isAdmin ? "Minimum £0.01 (Admin testing mode)" : "Minimum £5.00"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">£</span>
              <Input
                type="number"
                name="ticketPrice"
                min={isAdmin ? "0.01" : "5"}
                step="0.01"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(parseFloat(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
        </div>

        {charity && (
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
            {charity.logoPath && (
              <div className="relative w-12 h-12">
                <Image
                  src={charity.logoPath}
                  alt={`${charity.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold">Pay It Forward</h2>
          <p className="text-sm text-gray-500 mb-2">
            Have you been on the receiving end of a random act of kindness recently? Or perhaps just having a good month? Here's a chance to pay it forward and buy tickets for someone that might otherwise miss out.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            If you feel you can't afford to buy tickets, then give us an email at{" "}
            <a 
              href="mailto:classicsbackonscreen+PIF@gmail.com" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              classicsbackonscreen+PIF@gmail.com
            </a>{" "}
            and we'll put you on the waiting list for any tickets donated this way, no questions asked.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Number of Pay it Forward Tickets</p>
                <p className="text-sm text-gray-500">£{settings.minimumTicketPrice.toFixed(2)} per ticket</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  name="payItForwardTickets"
                  min="0"
                  value={payItForwardTickets}
                  onChange={(e) => setPayItForwardTickets(parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {menuItems.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Food & Drinks</h2>
            <div className="space-y-6">
              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <Card key={category} className="p-4">
                  <h3 className="font-medium mb-3">{category}</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                            <p className="text-sm">£{item.price.toFixed(2)}</p>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            value={menuSelections[item.id]?.quantity || 0}
                            onChange={(e) => handleMenuItemQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                        </div>

                        {(menuSelections[item.id]?.quantity || 0) > 0 && (
                          <div className="ml-4 space-y-4">
                            {Array.from({ length: menuSelections[item.id].quantity }).map((_, index) => (
                              <div key={index} className="space-y-2 border-l-2 border-gray-200 pl-4">
                                <p className="text-sm font-medium text-gray-500">Item {index + 1}</p>
                                {item.options.map(option => (
                                  <div key={option.id} className="space-y-2">
                                    {option.minChoices === 0 ? (
                                      <div className="mt-4">
                                        <p className="text-sm font-medium">{option.name}</p>
                                        <RadioGroup
                                          className="mt-1.5"
                                          value={menuSelections[item.id]?.options[option.id]?.[index]?.[0] || "none"}
                                          onValueChange={(value) => {
                                            handleOptionChoiceChange(
                                              item.id,
                                              option.id,
                                              value === "none" ? [] : [value],
                                              index
                                            );
                                          }}
                                        >
                                          <div className="space-y-1.5">
                                            <div className="flex items-center space-x-2">
                                              <RadioGroupItem value="none" id={`${item.id}-${option.id}-${index}-none`} />
                                              <label
                                                htmlFor={`${item.id}-${option.id}-${index}-none`}
                                                className="text-sm text-gray-600"
                                              >
                                                No thanks
                                              </label>
                                            </div>
                                            {option.choices.map(choice => (
                                              <div key={choice.id} className="flex items-center space-x-2">
                                                <RadioGroupItem 
                                                  value={choice.id} 
                                                  id={`${item.id}-${option.id}-${index}-${choice.id}`}
                                                />
                                                <label
                                                  htmlFor={`${item.id}-${option.id}-${index}-${choice.id}`}
                                                  className="text-sm text-gray-600"
                                                >
                                                  {choice.name}
                                                  {choice.priceAdjustment > 0 && ` (+£${choice.priceAdjustment.toFixed(2)})`}
                                                </label>
                                              </div>
                                            ))}
                                          </div>
                                        </RadioGroup>
                                      </div>
                                    ) : option.choices.length > 1 ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm font-medium">
                                            {option.name}
                                            {option.minChoices > 0 && (
                                              <span className="text-red-500 ml-1">*</span>
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {option.minChoices === option.maxChoices
                                              ? `Select ${option.minChoices}`
                                              : `Select ${option.minChoices}-${option.maxChoices}`}
                                          </p>
                                        </div>
                                        <Select
                                          value={menuSelections[item.id]?.options[option.id]?.[index]?.join(',') || ''}
                                          onValueChange={(value) => handleOptionChoiceChange(
                                            item.id,
                                            option.id,
                                            value ? value.split(',') : [],
                                            index
                                          )}
                                        >
                                          <SelectTrigger className={cn(
                                            "bg-white",
                                            validation[item.id]?.[option.id]?.isValid === false && "border-red-500"
                                          )}>
                                            <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {option.choices.map(choice => (
                                              <SelectItem 
                                                key={choice.id} 
                                                value={choice.id}
                                                className="bg-white hover:bg-gray-100"
                                              >
                                                {choice.name}
                                                {choice.priceAdjustment > 0 && ` (+£${choice.priceAdjustment.toFixed(2)})`}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                          {option.name}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {validation[item.id] && Object.values(validation[item.id]).some(v => !v.isValid) && (
                                  <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Please complete all required selections for each item</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tickets Subtotal</span>
            <span>£{totals.subtotal.toFixed(2)}</span>
          </div>
          {payItForwardTickets > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Pay It Forward Tickets</span>
              <span>£{(payItForwardTickets * settings.minimumTicketPrice).toFixed(2)}</span>
            </div>
          )}
          {totals.menuTotal > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Menu Items Total</span>
              <span>£{totals.menuTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Transaction Fee</span>
            <span>£{settings.transactionFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium mt-2">
            <span>Total</span>
            <span>£{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Processing..." : "Continue to Payment"}
      </Button>
    </form>
  )
} 