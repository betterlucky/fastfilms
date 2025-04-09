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
    }
    choices: {
      option: {
        name: string
      }
      selectedChoice: {
        name: string
      }
    }[]
  })[]
}

// Constants for layout
const PAGE_WIDTH = 210 // A4 width in mm
const MARGIN = 20
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

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
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Add header
      drawHeader(doc, data.campaign.title, 'Guest List')
      let yPos = 50 // Start below header

      // Campaign Details in a box
      doc.setFillColor(250, 250, 250)
      doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 35, 3, 3, 'F')
      doc.setFontSize(12)
      yPos += 8
      doc.text(`Venue: ${data.campaign.venue.name}`, MARGIN + 5, yPos)
      yPos += 8
      doc.text(`Date: ${data.campaign.screeningDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`, MARGIN + 5, yPos)
      yPos += 10
      doc.text(`Time: ${data.campaign.screeningDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`, MARGIN + 5, yPos)
      yPos += 8
      doc.text(`Total Guests: ${data.tickets.length}`, MARGIN + 5, yPos)
      yPos += 15

      // Group tickets by purchase
      const groupedTickets = data.tickets.reduce((acc, ticket) => {
        const purchaseId = ticket.purchase?.id || 'no-purchase'
        if (!acc[purchaseId]) {
          acc[purchaseId] = {
            user: ticket.user,
            tickets: [],
            orders: ticket.purchase?.orders || []
          }
        }
        acc[purchaseId].tickets.push(ticket)
        return acc
      }, {} as Record<string, {
        user: Pick<User, 'name' | 'email'>
        tickets: Ticket[]
        orders: {
          id: string
          quantity: number
        }[]
      }>)

      // Sort groups by user name
      const sortedGroups = Object.values(groupedTickets).sort((a, b) =>
        (a.user.name || '').localeCompare(b.user.name || '')
      )

      // Column headers
      doc.setFillColor(230, 230, 230)
      doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
      doc.setFontSize(11)
      doc.text('Party Leader', MARGIN + 5, yPos + 5.5)
      doc.text('Email', MARGIN + 80, yPos + 5.5)
      doc.text('Party Size', MARGIN + 150, yPos + 5.5)
      doc.text('Preorders', MARGIN + 180, yPos + 5.5)
      yPos += 12

      // Add guest groups
      doc.setFontSize(10)
      sortedGroups.forEach((group, index) => {
        // Add zebra striping
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(MARGIN, yPos - 4, CONTENT_WIDTH, 8, 'F')
        }

        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          // Repeat header on new page
          drawHeader(doc, data.campaign.title, 'Guest List')
          yPos = 50

          // Repeat column headers
          doc.setFillColor(230, 230, 230)
          doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
          doc.setFontSize(11)
          doc.text('Party Leader', MARGIN + 5, yPos + 5.5)
          doc.text('Email', MARGIN + 80, yPos + 5.5)
          doc.text('Party Size', MARGIN + 150, yPos + 5.5)
          doc.text('Preorders', MARGIN + 180, yPos + 5.5)
          yPos += 12
          doc.setFontSize(10)
        }

        doc.text(group.user.name || 'Guest', MARGIN + 5, yPos)
        doc.text(group.user.email, MARGIN + 80, yPos)
        doc.text(group.tickets.length.toString(), MARGIN + 150, yPos)
        doc.text(group.orders.length > 0 ? 'Yes' : 'No', MARGIN + 180, yPos)
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
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Add header
      drawHeader(doc, data.campaign.title, 'Preorder Summary')
      let yPos = 50

      // Campaign Details in a box
      doc.setFillColor(250, 250, 250)
      doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 30, 3, 3, 'F')
      doc.setFontSize(12)
      yPos += 8
      doc.text(`Venue: ${data.campaign.venue.name}`, MARGIN + 5, yPos)
      yPos += 8
      doc.text(`Date: ${data.campaign.screeningDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`, MARGIN + 5, yPos)
      yPos += 10
      doc.text(`Time: ${data.campaign.screeningDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`, MARGIN + 5, yPos)
      yPos += 15

      // Group orders by menu item and choices
      const orderSummary = new Map<string, number>()
      data.orders.forEach((order) => {
        const key = `${order.menuItem.name}${order.choices.length > 0 ? ' - ' + order.choices.map(c => `${c.option.name}: ${c.selectedChoice.name}`).join(', ') : ''}`
        orderSummary.set(key, (orderSummary.get(key) || 0) + order.quantity)
      })

      // Order Summary section
      doc.setFillColor(230, 230, 230)
      doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
      doc.setFontSize(14)
      doc.text('Order Summary', MARGIN + 5, yPos + 5.5)
      yPos += 12

      // Display summary
      doc.setFontSize(11)
      orderSummary.forEach((quantity, item) => {
        doc.text(`${item}`, MARGIN + 5, yPos)
        doc.text(`${quantity}`, MARGIN + CONTENT_WIDTH - 15, yPos, {
          align: 'right',
        })
        yPos += 7
      })
      yPos += 15

      // Group orders by user
      const userOrders = new Map<string, typeof data.orders>()
      data.orders.forEach((order) => {
        const key = order.user.email
        if (!userOrders.has(key)) {
          userOrders.set(key, [])
        }
        userOrders.get(key)!.push(order)
      })

      // Individual Orders section
      doc.setFillColor(230, 230, 230)
      doc.rect(MARGIN, yPos, CONTENT_WIDTH, 8, 'F')
      doc.setFontSize(14)
      doc.text('Orders by Party', MARGIN + 5, yPos + 5.5)
      yPos += 12

      // Add orders by user
      doc.setFontSize(11)
      userOrders.forEach((orders, email) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          drawHeader(doc, data.campaign.title, 'Preorder Summary')
          yPos = 50
        }

        // User box with light background
        const user = orders[0].user
        const boxHeight = 12 + orders.length * 12
        doc.setFillColor(250, 250, 250)
        doc.roundedRect(MARGIN, yPos - 4, CONTENT_WIDTH, boxHeight, 2, 2, 'F')

        // User details
        doc.setFontSize(11)
        doc.text(`${user.name || 'Guest'}`, MARGIN + 5, yPos)
        doc.text(email, MARGIN + 80, yPos)
        yPos += 8

        // Orders
        doc.setFontSize(10)
        orders.forEach((order) => {
          doc.text(`${order.quantity}x ${order.menuItem.name}`, MARGIN + 10, yPos)
          yPos += 6
          if (order.choices.length > 0) {
            order.choices.forEach((choice) => {
              doc.text(
                `${choice.option.name}: ${choice.selectedChoice.name}`,
                MARGIN + 15,
                yPos
              )
              yPos += 6
            })
          }
          yPos += 2
        })

        yPos += 4 // Space between user groups
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
