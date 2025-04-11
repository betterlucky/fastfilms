import { jsPDF } from 'jspdf'
import { Campaign, User, Ticket, Order, Purchase } from '@prisma/client'
import { ruleUtils } from '../rules/rule-utils'

interface GuestListData {
  campaign: Campaign & {
    venue: {
      name: string
    }
  }
  tickets: {
    id: string
    user: Pick<User, 'name' | 'email'>
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
      selectedChoice: {
        name: string
        priceAdjustment?: number
      }
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
      doc.text(`Date: ${data.campaign.screeningDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
      yPos += 8
      doc.text(`Time: ${data.campaign.screeningDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`, MARGIN + 5, yPos)
      doc.text(`Total Guests: ${data.tickets.length}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
      yPos += 15

      // Group tickets by user email (since we no longer have purchase info)
      const groupedTickets = data.tickets.reduce((acc, ticket) => {
        const email = ticket.user.email
        if (!acc[email]) {
          acc[email] = {
            user: ticket.user,
            tickets: [],
          }
        }
        acc[email].tickets.push(ticket)
        return acc
      }, {} as Record<string, {
        user: Pick<User, 'name' | 'email'>
        tickets: typeof data.tickets
      }>)

      // Sort groups by user name
      const sortedGroups = Object.values(groupedTickets).sort((a, b) =>
        (a.user.name || '').localeCompare(b.user.name || '')
      )

      // Column headers with better spacing
      doc.setFillColor(230, 230, 230)
      doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text('Party Leader', MARGIN + 5, yPos + 5.5)
      doc.text('Email', MARGIN + COLUMN_WIDTHS.NAME + 10, yPos + 5.5)
      doc.text('Party Size', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + 15, yPos + 5.5)
      doc.setFont(undefined, 'normal')
      yPos += 12

      // Add guest groups with optimized layout
      doc.setFontSize(10)
      sortedGroups.forEach((group, index) => {
        // Check if we need a new page
        if (yPos > PAGE_HEIGHT - 20) {
          doc.addPage()
          drawHeader(doc, data.campaign.title, 'Guest List')
          yPos = 40

          // Repeat column headers
          doc.setFillColor(230, 230, 230)
          doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
          doc.setFontSize(11)
          doc.setFont(undefined, 'bold')
          doc.text('Party Leader', MARGIN + 5, yPos + 5.5)
          doc.text('Email', MARGIN + COLUMN_WIDTHS.NAME + 10, yPos + 5.5)
          doc.text('Party Size', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + 15, yPos + 5.5)
          doc.setFont(undefined, 'normal')
          yPos += 12
          doc.setFontSize(10)
        }

        // Add zebra striping
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(MARGIN, yPos - 4, CONTENT_WIDTH, 8, 'F')
        }

        // Main guest info
        doc.text(group.user.name || 'Guest', MARGIN + 5, yPos)
        doc.text(group.user.email, MARGIN + COLUMN_WIDTHS.NAME + 10, yPos)
        doc.text(group.tickets.length.toString(), MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + 15, yPos)
        yPos += 8
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
  doc.text(`Date: ${data.campaign.screeningDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
  yPos += 8
  doc.text(`Time: ${data.campaign.screeningDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}`, MARGIN + 5, yPos)
  
  // Count unique food orders by user email
  const uniqueOrders = new Set(data.orders.map(order => order.user.email))
  doc.text(`Total Orders: ${uniqueOrders.size}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
  yPos += 15

  // Create summary of all choices
  interface ChoiceSummary {
    [choiceName: string]: number
  }
  
  const choiceSummary: ChoiceSummary = {}

  // Process all orders and collect choices
  data.orders.forEach(order => {
    // For combo items, handle all items with proper quantities
    if (order.menuItem.category?.toLowerCase() === 'combo') {
      order.choices.forEach(choice => {
        const choiceName = choice.selectedChoice.name
        // Skip "No thanks" choices
        if (choiceName.toLowerCase() === 'no thanks') {
          return
        }
        // Add each choice with the order quantity
        choiceSummary[choiceName] = (choiceSummary[choiceName] || 0) + order.quantity
      })
    } else {
      // For non-combo items, just add the base item
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

    // Group orders by menu item
    const menuItemOrders = orders.reduce((acc, order) => {
      const key = order.menuItem.name
      if (!acc[key]) {
        acc[key] = {
          quantity: 0,
          choices: {} as Record<string, Record<string, number>>
        }
      }
      acc[key].quantity += order.quantity

      // Process choices
      order.choices.forEach(choice => {
        const optionName = choice.option.name
        const choiceName = choice.selectedChoice.name
        
        if (!acc[key].choices[optionName]) {
          acc[key].choices[optionName] = {}
        }
        if (!acc[key].choices[optionName][choiceName]) {
          acc[key].choices[optionName][choiceName] = 0
        }
        acc[key].choices[optionName][choiceName] += 1
      })
      
      return acc
    }, {} as Record<string, {
      quantity: number,
      choices: Record<string, Record<string, number>>
    }>)

    // Display orders grouped by menu item
    doc.setFontSize(10)
    Object.entries(menuItemOrders).forEach(([itemName, details]) => {
      // Main item line
      doc.setFont(undefined, 'bold')
      doc.text(`${details.quantity}x ${itemName}:`, MARGIN + 10, yPos)
      doc.setFont(undefined, 'normal')
      yPos += 6

      // Find the original order for this menu item to get option information
      const originalOrder = orders.find(o => o.menuItem.name === itemName)
      if (!originalOrder) return

      // Display choices grouped by option
      const sortedChoices = Object.entries(details.choices)
        .sort(([a], [b]) => {
          // Sort by option order if available
          const orderA = originalOrder.choices.find(c => c.option.name === a)?.option.order || 0
          const orderB = originalOrder.choices.find(c => c.option.name === b)?.option.order || 0
          if (orderA !== orderB) return orderA - orderB
          return a.localeCompare(b)
        })

      sortedChoices.forEach(([optionName, choices]) => {
        Object.entries(choices)
          .filter(([choice]) => choice.toLowerCase() !== 'no thanks')
          .forEach(([choice, count]) => {
            // Always use the full order quantity for each choice in a combo
            const displayQuantity = details.quantity
            const choiceText = `${displayQuantity}x ${choice}`
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
