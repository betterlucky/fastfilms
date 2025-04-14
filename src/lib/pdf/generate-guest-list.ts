import { jsPDF } from 'jspdf'
import { Campaign, User, Ticket, Order, Purchase } from '@prisma/client'
import { ruleUtils } from '../rules/rule-utils'

interface GuestListData {
  campaign: Campaign & {
    venue: {
      name: string
    }
  }
  purchases: {
    id: string
    createdAt: Date
    user: Pick<User, 'name' | 'email'>
    tickets: {
      id: string
    }[]
  }[]
}

interface PreorderData {
  campaign: Campaign & {
    venue: {
      name: string
    }
  }
  orders: {
    id: string
    quantity: number
    user: Pick<User, 'name' | 'email'>
    menuItem: {
      name: string
      price: number
      category: string
    }
    choices: {
      option: {
        name: string
        order: number
      }
      selectedChoices: {
        name: string
        priceAdjustment?: number
      }[]
    }[]
  }[]
}

// Constants for layout
const PAGE_WIDTH = 297 // A4 landscape width in mm
const PAGE_HEIGHT = 210 // A4 landscape height in mm
const MARGIN = 15
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN
const COLUMN_WIDTHS = {
  NAME: 80,
  EMAIL: 100,
  PARTY_SIZE: 40,
  PREORDERS: 40
}

// Helper function to format date in UK format
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Helper function to add text with proper line breaks
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.text(lines, x, y)
  return lines.length * doc.getTextDimensions('Test').h // Return total height
}

// Helper to add page number
function addPageNumber(doc: jsPDF) {
  const pages = doc.internal.pages.length - 1 // -1 because jsPDF adds an extra empty page at the end
  const pageWidth = doc.internal.pageSize.width
  doc.setFontSize(10)
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }
}

// Helper to draw a header section
function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  // Add a light gray background for the header
  doc.setFillColor(245, 245, 245)
  doc.rect(0, 0, PAGE_WIDTH, 40, 'F')

  // Add title
  doc.setFontSize(24)
  doc.setTextColor(60, 60, 60)
  doc.text(title, PAGE_WIDTH / 2, 25, { align: 'center' })

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12)
    doc.text(subtitle, PAGE_WIDTH / 2, 35, { align: 'center' })
  }

  // Reset text color
  doc.setTextColor(0, 0, 0)
}

export function generateGuestListPDF(data: GuestListData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Add header
      drawHeader(doc, data.campaign.title, 'Guest List')
      let yPos = 40 // Start below header

      // Campaign Details in a box
      doc.setFillColor(250, 250, 250)
      doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 25, 3, 3, 'F')
      doc.setFontSize(12)
      yPos += 8
      
      // Two column layout for campaign details
      doc.text(`Venue: ${data.campaign.venue.name}`, MARGIN + 5, yPos)
      const screeningDate = new Date(data.campaign.screeningDate)
      // Adjust for UK timezone (add one hour to match campaign listing)
      screeningDate.setHours(screeningDate.getHours() + 1)
      doc.text(`Date: ${screeningDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
      yPos += 8
      doc.text(`Time: ${screeningDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`, MARGIN + 5, yPos)

      // Count total tickets across all purchases
      const totalTickets = data.purchases.reduce((sum, purchase) => sum + purchase.tickets.length, 0)
      doc.text(`Total Guests: ${totalTickets}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
      yPos += 15

      // Group purchases by user email for better organization
      const userPurchases = data.purchases.reduce((acc, purchase) => {
        const email = purchase.user.email
        if (!acc[email]) {
          acc[email] = []
        }
        acc[email].push(purchase)
        return acc
      }, {} as Record<string, typeof data.purchases>)

      // Sort users by name
      const sortedUsers = Object.entries(userPurchases).sort(([, purchasesA], [, purchasesB]) => {
        const nameA = purchasesA[0].user.name || ''
        const nameB = purchasesB[0].user.name || ''
        return nameA.localeCompare(nameB)
      })

      // Column headers with better spacing
      doc.setFillColor(230, 230, 230)
      doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text('Party Leader', MARGIN + 5, yPos + 5.5)
      doc.text('Email', MARGIN + COLUMN_WIDTHS.NAME + 10, yPos + 5.5)
      doc.text('Purchase Date', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + 15, yPos + 5.5)
      doc.text('Tickets', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + COLUMN_WIDTHS.PARTY_SIZE + 20, yPos + 5.5)
      doc.setFont(undefined, 'normal')
      yPos += 12

      // Add guest groups with optimized layout
      doc.setFontSize(10)
      sortedUsers.forEach(([email, purchases]) => {
        // User header
        const user = purchases[0].user
        doc.setFont(undefined, 'bold')
        doc.text(`${user.name || 'Guest'}`, MARGIN + 5, yPos)
        doc.text(email, MARGIN + COLUMN_WIDTHS.NAME + 10, yPos)
        doc.setFont(undefined, 'normal')
        yPos += 8

        // Sort purchases by date
        purchases.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        // List each purchase
        purchases.forEach((purchase, index) => {
          // Check if we need a new page
          if (yPos > PAGE_HEIGHT - 20) {
            doc.addPage()
            drawHeader(doc, data.campaign.title, 'Guest List')
            yPos = 40
          }

          const purchaseDate = new Date(purchase.createdAt)
          doc.text(`Purchase ${index + 1}:`, MARGIN + 10, yPos)
          doc.text(formatDate(purchaseDate), MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + 15, yPos)
          doc.text(`${purchase.tickets.length} tickets`, MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + COLUMN_WIDTHS.PARTY_SIZE + 20, yPos)
          yPos += 6
        })

        yPos += 8 // Add space between users
      })

      // Add page numbers
      addPageNumber(doc)

      // Convert to Buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      resolve(pdfBuffer)
    } catch (error) {
      reject(error)
    }
  })
}

export async function generatePreordersPDF(data: PreorderData) {
  // Validate code against our rules
  const code = `
    const orders = data.orders
    const quantities = orders.map(order => order.quantity)
  `
  if (!ruleUtils.validateOrderQuantities(code)) {
    throw new Error('Order quantity calculation rule violation detected')
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Add header
  drawHeader(doc, data.campaign.title, 'Preorder Summary')
  let yPos = 40

  // Campaign Details in a box
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 25, 3, 3, 'F')
  doc.setFontSize(12)
  yPos += 8
  
  // Two column layout for campaign details
  doc.text(`Venue: ${data.campaign.venue.name}`, MARGIN + 5, yPos)
  const screeningDate = new Date(data.campaign.screeningDate)
  // Adjust for UK timezone (add one hour to match campaign listing)
  screeningDate.setHours(screeningDate.getHours() + 1)
  doc.text(`Date: ${screeningDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
  yPos += 8
  doc.text(`Time: ${screeningDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}`, MARGIN + 5, yPos)
  
  // Count unique food orders by user email
  const uniqueOrders = new Set(data.orders.map(order => order.user.email))
  doc.text(`Total Orders: ${uniqueOrders.size}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
  yPos += 15

  // Create summary of all choices
  const choiceSummary: Record<string, number> = {}

  // Process all orders and collect choices
  data.orders.forEach(order => {
    if (order.menuItem.category?.toLowerCase() === 'combo') {
      // For combo items, process each choice individually
      order.choices.forEach(choice => {
        choice.selectedChoices.forEach(selectedChoice => {
          // Skip "No thanks" choices in summary
          if (selectedChoice.name.toLowerCase() === 'no thanks') {
            return
          }
          // Add each choice to the summary with the order quantity
          choiceSummary[selectedChoice.name] = (choiceSummary[selectedChoice.name] || 0) + order.quantity
        })
      })
    } else {
      // For non-combo items (like Furious Hot Box), use order quantity
      const itemName = order.menuItem.name
      choiceSummary[itemName] = (choiceSummary[itemName] || 0) + order.quantity
    }
  })

  // Add Item Summary section
  doc.setFillColor(230, 230, 230)
  doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Item Summary', MARGIN + 5, yPos + 5.5)
  doc.setFont(undefined, 'normal')
  yPos += 12

  // Display consolidated summary
  doc.setFontSize(11)
  
  Object.entries(choiceSummary)
    .sort(([aName], [bName]) => aName.localeCompare(bName))
    .forEach(([itemName, quantity]) => {
      // Check if we need a new page
      if (yPos > PAGE_HEIGHT - 40) {
        doc.addPage()
        drawHeader(doc, data.campaign.title, 'Preorder Summary')
        yPos = 40
      }

      doc.text(`${quantity}x ${itemName}`, MARGIN + 5, yPos)
      yPos += 6
    })

  // Add Orders by Party section
  yPos += 10
  doc.addPage()
  drawHeader(doc, data.campaign.title, 'Order Details')
  yPos = 40

  // Group orders by user
  const userOrders = new Map<string, typeof data.orders>()
  data.orders.forEach((order) => {
    const key = order.user.email
    if (!userOrders.has(key)) {
      userOrders.set(key, [])
    }
    userOrders.get(key)!.push(order)
  })

  // Add orders by user with optimized layout
  doc.setFontSize(11)
  userOrders.forEach((orders, email) => {
    // Check if we need a new page
    if (yPos > PAGE_HEIGHT - 40) {
      doc.addPage()
      drawHeader(doc, data.campaign.title, 'Order Details')
      yPos = 40
    }

    // User details
    const user = orders[0].user
    doc.setFont(undefined, 'bold')
    doc.text(`${user.name || 'Guest'}`, MARGIN + 5, yPos)
    doc.text(email, MARGIN + 60, yPos)
    doc.setFont(undefined, 'normal')
    yPos += 8

    // Display each order
    orders.forEach(order => {
      // Main item line
      doc.setFont(undefined, 'bold')
      doc.text(`${order.quantity}x ${order.menuItem.name}:`, MARGIN + 10, yPos)
      doc.setFont(undefined, 'normal')
      yPos += 6

      // Display all choices, including "No thanks"
      order.choices.forEach(choice => {
        choice.selectedChoices.forEach(selectedChoice => {
          const choiceText = `${order.quantity}x ${selectedChoice.name}`
          doc.text(choiceText, MARGIN + 15, yPos)
          yPos += 6
        })
      })
      yPos += 2
    })

    yPos += 6
  })

  // Add page numbers
  addPageNumber(doc)

  // Convert to Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}
