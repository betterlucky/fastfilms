import { jsPDF } from 'jspdf'
import { Campaign, User, Ticket, Order, Purchase } from '@prisma/client'

interface GuestListData {
  campaign: Campaign & {
    venue: {
      name: string
    }
  }
  tickets: (Ticket & {
    user: Pick<User, 'name' | 'email'>
    purchase:
      | (Purchase & {
          orders: {
            id: string
            quantity: number
          }[]
        })
      | null
  })[]
}

interface PreorderData {
  campaign: Campaign & {
    venue: {
      name: string
    }
  }
  orders: (Order & {
    user: Pick<User, 'name' | 'email'>
    menuItem: {
      name: string
      price: number
    }
    choices: {
      option: {
        name: string
      }
      selectedChoice: {
        name: string
        priceAdjustment?: number
      }
    }[]
  })[]
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

      // Group tickets by purchase
      const groupedTickets = data.tickets.reduce((acc, ticket) => {
        const purchaseId = ticket.purchase?.id || 'no-purchase'
        if (!acc[purchaseId]) {
          acc[purchaseId] = {
            user: ticket.user,
            tickets: [],
            hasPreorders: ticket.purchase?.orders.length > 0
          }
        }
        acc[purchaseId].tickets.push(ticket)
        return acc
      }, {} as Record<string, {
        user: Pick<User, 'name' | 'email'>
        tickets: Ticket[]
        hasPreorders: boolean
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
      doc.text('Preorders', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + COLUMN_WIDTHS.PARTY_SIZE + 20, yPos + 5.5)
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
          doc.text('Preorders', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + COLUMN_WIDTHS.PARTY_SIZE + 20, yPos + 5.5)
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
        doc.text(group.hasPreorders ? 'Yes' : 'No', MARGIN + COLUMN_WIDTHS.NAME + COLUMN_WIDTHS.EMAIL + COLUMN_WIDTHS.PARTY_SIZE + 20, yPos)
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

export function generatePreordersPDF(data: PreorderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
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
      doc.text(`Total Orders: ${data.orders.length}`, MARGIN + CONTENT_WIDTH/2 + 5, yPos)
      yPos += 15

      // Create item summary with consolidated choices
      interface ItemSummary {
        quantity: number
        choices: Map<string, Map<string, number>>
      }
      
      const itemSummary = new Map<string, ItemSummary>()

      // Helper function to add or update item summary
      function addToSummary(itemName: string, quantity: number, choices: Array<{
        option: { name: string },
        selectedChoice: { name: string }
      }>) {
        const existing = itemSummary.get(itemName) || {
          quantity: 0,
          choices: new Map()
        }

        existing.quantity += quantity

        // Track choices
        choices.forEach(choice => {
          const optionName = choice.option.name
          const choiceName = choice.selectedChoice.name

          if (!existing.choices.has(optionName)) {
            existing.choices.set(optionName, new Map())
          }

          const choiceCounts = existing.choices.get(optionName)!
          choiceCounts.set(choiceName, (choiceCounts.get(choiceName) || 0) + quantity)
        })

        itemSummary.set(itemName, existing)
      }

      // Process orders and consolidate items
      data.orders.forEach(order => {
        // Check if this is a combo item by looking for "Combo" in the name
        const isCombo = order.menuItem.name.toLowerCase().includes('combo')
        
        if (!isCombo) {
          // For non-combo items, just add them directly
          addToSummary(order.menuItem.name, order.quantity, order.choices)
        } else {
          // For combo items, we need to process each choice as a separate item
          // First, add the main combo item
          addToSummary(order.menuItem.name, order.quantity, [])
          
          // Then process each component of the combo
          order.choices.forEach(choice => {
            // Skip choices that are "No thanks" or similar
            if (choice.selectedChoice.name.toLowerCase() === 'no thanks') {
              return
            }
            
            // For drinks and similar items that might appear both in combos and standalone
            if (choice.option.name.toLowerCase().includes('drink')) {
              addToSummary(choice.selectedChoice.name, order.quantity, [])
            }
          })
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

      // Display consolidated item summary
      doc.setFontSize(11)
      
      // First display main items (non-choices)
      Array.from(itemSummary.entries())
        .sort(([aName], [bName]) => aName.localeCompare(bName))
        .forEach(([itemName, summary]) => {
          // Check if we need a new page
          if (yPos > PAGE_HEIGHT - 40) {
            doc.addPage()
            drawHeader(doc, data.campaign.title, 'Preorder Summary')
            yPos = 40
          }

          // Main item line
          doc.setFont(undefined, 'bold')
          doc.text(`${summary.quantity}x ${itemName}`, MARGIN + 5, yPos)
          doc.setFont(undefined, 'normal')
          yPos += 6

          // Display choices if any
          summary.choices.forEach((choiceCounts, optionName) => {
            // Skip empty or "No thanks" choices
            const validChoices = Array.from(choiceCounts.entries())
              .filter(([choice]) => choice.toLowerCase() !== 'no thanks')
            
            if (validChoices.length > 0) {
              const choicesText = validChoices
                .map(([choice, count]) => `${count}x ${choice}`)
                .join(', ')
              doc.text(`${optionName}: ${choicesText}`, MARGIN + 15, yPos)
              yPos += 6
            }
          })
          yPos += 2
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
          drawHeader(doc, data.campaign.title, 'Preorder Summary')
          yPos = 40
        }

        // User details
        const user = orders[0].user
        doc.setFont(undefined, 'bold')
        doc.text(`${user.name || 'Guest'}`, MARGIN + 5, yPos)
        doc.text(email, MARGIN + 60, yPos)
        doc.setFont(undefined, 'normal')
        yPos += 8

        // Orders in a server-friendly format
        doc.setFontSize(10)
        let userTotal = 0
        orders.forEach((order) => {
          const priceAdjustments = order.choices.reduce((sum, choice) => 
            sum + (Number(choice.selectedChoice.priceAdjustment) || 0), 0)
          const itemTotal = (order.menuItem.price * order.quantity) + (priceAdjustments * order.quantity)
          userTotal += itemTotal

          // Main item line
          doc.text(`${order.quantity}x ${order.menuItem.name}:`, MARGIN + 10, yPos)
          yPos += 6

          // Choices in a clear format
          order.choices.forEach((choice) => {
            doc.text(`  ${choice.option.name}: ${choice.selectedChoice.name}`, MARGIN + 15, yPos)
            yPos += 6
          })
          yPos += 2
        })

        // User total
        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        doc.text('Total:', MARGIN + 10, yPos)
        doc.text(`£${(userTotal / 100).toFixed(2)}`, MARGIN + CONTENT_WIDTH - 30, yPos, { align: 'right' })
        doc.setFont(undefined, 'normal')
        yPos += 10
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
