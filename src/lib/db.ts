import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getCampaign(id: string) {
  const result = await prisma.$queryRaw`
    SELECT 
      c.id,
      c.title,
      c.description,
      c."movieTitle",
      c."posterPath",
      c."screeningDate",
      c."screeningTime",
      c."deadlineDate",
      c."fundingTarget",
      c."currentFunding",
      c."ticketCap",
      c."currentTickets",
      c.status,
      c."isFeatured",
      s.name as "screen.name",
      s.capacity as "screen.capacity",
      v.name as "venue.name",
      v.address as "venue.address",
      v.city as "venue.city",
      v.postcode as "venue.postcode",
      ch.name as "charity.name",
      ch.description as "charity.description",
      ch."logoPath" as "charity.logoPath",
      COALESCE(
        json_agg(
          json_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', mi.description,
            'price', mi.price,
            'category', mi.category,
            'options', (
              SELECT json_agg(
                json_build_object(
                  'id', mio.id,
                  'name', mio.name,
                  'minChoices', mio."minChoices",
                  'maxChoices', mio."maxChoices",
                  'choices', (
                    SELECT json_agg(
                      json_build_object(
                        'id', mioc.id,
                        'name', mioc.name,
                        'priceAdjustment', mioc."priceAdjustment"
                      )
                    )
                    FROM "MenuItemOptionChoice" mioc
                    WHERE mioc."optionId" = mio.id
                  )
                )
              )
              FROM "MenuItemOption" mio
              WHERE mio."menuItemId" = mi.id
            )
          )
        ) FILTER (WHERE mi.id IS NOT NULL),
        '[]'
      ) as "menuItems"
    FROM "Campaign" c
    LEFT JOIN "Screen" s ON c."screenId" = s.id
    JOIN "Venue" v ON c."venueId" = v.id
    LEFT JOIN "Charity" ch ON c."charityId" = ch.id
    LEFT JOIN "CampaignMenuItem" cmi ON c.id = cmi."campaignId"
    LEFT JOIN "MenuItem" mi ON cmi."menuItemId" = mi.id
    WHERE c.id = ${id}
    GROUP BY c.id, s.id, v.id, ch.id
  `

  if (!result || !Array.isArray(result) || result.length === 0) {
    return null
  }

  return {
    id: result[0].id,
    title: result[0].title,
    description: result[0].description,
    movieTitle: result[0].movieTitle,
    posterPath: result[0].posterPath,
    screeningDate: result[0].screeningDate,
    screeningTime: result[0].screeningTime,
    deadlineDate: result[0].deadlineDate,
    fundingTarget: result[0].fundingTarget,
    currentFunding: result[0].currentFunding,
    ticketCap: result[0].ticketCap,
    currentTickets: result[0].currentTickets,
    status: result[0].status,
    isFeatured: result[0].isFeatured,
    screen: result[0]['screen.name']
      ? {
          name: result[0]['screen.name'],
          capacity: result[0]['screen.capacity'],
        }
      : null,
    venue: {
      name: result[0]['venue.name'],
      address: result[0]['venue.address'],
      city: result[0]['venue.city'],
      postcode: result[0]['venue.postcode'],
    },
    charity: result[0]['charity.name']
      ? {
          name: result[0]['charity.name'],
          description: result[0]['charity.description'],
          logoPath: result[0]['charity.logoPath'],
        }
      : null,
    menuItems: result[0].menuItems || [],
  }
}
