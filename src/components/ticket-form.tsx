import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaymentForm } from "./payment-form"
import { MenuSelection } from "./menu-selection"
import { MenuItem, MenuItemOption } from "@prisma/client"

interface TicketFormProps {
  campaignId: string
  ticketPrice: number
  menuItems: (MenuItem & { options: MenuItemOption[] })[]
}

interface Order {
  menuItemId: string
  quantity: number
  choices: {
    optionId: string
    selectedChoice: string
  }[]
}

export function TicketForm({ campaignId, ticketPrice, menuItems }: TicketFormProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string
    ticketIds: string[]
  } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value))
  }

  const handleOrdersChange = (newOrders: Order[]) => {
    setOrders(newOrders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
          orders,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to process ticket purchase")
      }

      const data = await response.json()
      setPaymentData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const ticketTotal = quantity * ticketPrice
  const transactionFee = Math.ceil(ticketTotal * 0.029 + 30) // 2.9% + 30p Stripe fee
  const orderTotal = orders.reduce((total, order) => {
    const menuItem = menuItems.find((item) => item.id === order.menuItemId)
    return total + (menuItem ? Number(menuItem.price) * order.quantity : 0)
  }, 0)
  const total = ticketTotal + transactionFee + orderTotal

  if (paymentData) {
    return (
      <PaymentForm
        clientSecret={paymentData.clientSecret}
        ticketIds={paymentData.ticketIds}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          Number of Tickets
        </label>
        <select
          id="quantity"
          name="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {menuItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pre-order Food & Drinks
          </h3>
          <MenuSelection menuItems={menuItems} onOrdersChange={handleOrdersChange} />
        </div>
      )}

      <div className="bg-gray-50 px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tickets ({quantity})</span>
            <span>£{ticketTotal.toFixed(2)}</span>
          </div>
          {orders.length > 0 && (
            <div className="space-y-1">
              {orders.map((order) => {
                const menuItem = menuItems.find(
                  (item) => item.id === order.menuItemId
                )
                if (!menuItem) return null
                return (
                  <div key={order.menuItemId} className="flex justify-between text-sm">
                    <span>
                      {menuItem.name} ({order.quantity})
                      {order.choices.map((choice) => {
                        const option = menuItem.options.find(
                          (opt) => opt.id === choice.optionId
                        )
                        return option ? (
                          <span key={choice.optionId} className="text-gray-500">
                            {" "}
                            - {choice.selectedChoice}
                          </span>
                        ) : null
                      })}
                    </span>
                    <span>
                      £{(Number(menuItem.price) * order.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Transaction Fee</span>
            <span>£{transactionFee.toFixed(2)}</span>
          </div>
          <div className="pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Continue to Payment"}
        </button>
      </div>
    </form>
  )
} 