const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Create test charity
    const charity = await prisma.charity.create({
      data: {
        name: 'Cornwall Wildlife Trust',
        description: "Protecting Cornwall's wildlife and wild places",
        url: 'https://www.cornwallwildlifetrust.org.uk',
        logoPath: '/charities/cornwall-wildlife-trust.png',
      },
    })

    // Create test venue
    const venue = await prisma.venue.create({
      data: {
        name: 'The Regal Cinema',
        address: '1 High Street',
        city: 'Falmouth',
        postcode: 'TR11 2AB',
        phone: '01326 212355',
        url: 'https://www.regalcinema.co.uk',
        contactEmail: [
          'manager@regalcinema.co.uk',
          'bookings@regalcinema.co.uk',
        ] as string[],
      },
    })

    // Create test screen
    const screen = await prisma.screen.create({
      data: {
        name: 'Screen 1',
        capacity: 200,
        venueId: venue.id,
      },
    })

    // Create test menu items
    const menuItems = await Promise.all([
      prisma.menuItem.create({
        data: {
          name: 'Large Popcorn',
          description: 'Freshly popped popcorn with butter',
          price: 5.5,
          category: 'Snacks',
          venueId: venue.id,
          options: {
            create: [
              {
                name: 'Flavour',
                description: 'Choose your popcorn flavour',
                maxChoices: 1,
                minChoices: 1,
                choices: {
                  create: [
                    { name: 'Sweet', priceAdjustment: 0 },
                    { name: 'Salty', priceAdjustment: 0 },
                    { name: 'Sweet & Salty', priceAdjustment: 0.5 },
                  ],
                },
              },
            ],
          },
        },
      }),
      prisma.menuItem.create({
        data: {
          name: 'Soft Drink',
          description: 'Choice of Coca-Cola, Fanta, or Sprite',
          price: 3.5,
          category: 'Drinks',
          venueId: venue.id,
          options: {
            create: [
              {
                name: 'Size',
                description: 'Choose your drink size',
                maxChoices: 1,
                minChoices: 1,
                choices: {
                  create: [
                    { name: 'Regular', priceAdjustment: 0 },
                    { name: 'Large', priceAdjustment: 1.0 },
                  ],
                },
              },
            ],
          },
        },
      }),
    ])

    // Create test campaign
    const campaign = await prisma.campaign.create({
      data: {
        title: 'Test Campaign',
        description: 'A test campaign for development',
        movieTitle: 'Test Movie',
        screeningDate: new Date('2024-12-31T19:30:00Z'),
        ticketCap: 100,
        currentTickets: 0,
        customBlurb: 'This is a test campaign for development purposes.',
        posterPath: '/test-poster.jpg',
        deadlineDate: new Date('2024-12-24T23:59:59Z'),
        venue: {
          connect: {
            id: venue.id,
          },
        },
        isTest: true,
        currentFunding: '0',
        fundingTarget: '1000',
      },
    })

    console.log('Test data created successfully:')
    console.log('- Charity:', charity.name)
    console.log('- Venue:', venue.name)
    console.log('- Screen:', screen.name)
    console.log('- Menu Items:', menuItems.map((item) => item.name).join(', '))
    console.log('- Campaign:', campaign.title)
  } catch (error) {
    console.error('Error seeding test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
