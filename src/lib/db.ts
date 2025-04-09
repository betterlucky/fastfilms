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
      c.movie_title as "movieTitle",
      c.screening_date as "screeningDate",
      c.ticket_cap as "ticketCap",
      c.current_tickets as "currentTickets",
      c.custom_blurb as "customBlurb",
      c.poster_path as "posterPath",
      c.deadline_date as "deadlineDate",
      c.screen_id as "screenId",
      c.venue_id as "venueId",
      c.charity_id as "charityId",
      c.is_test as "isTest",
      c.current_funding as "currentFunding",
      c.funding_target as "fundingTarget",
      v.name as "venueName",
      v.address as "venueAddress",
      v.city as "venueCity",
      v.postcode as "venuePostcode",
      v.phone as "venuePhone",
      v.url as "venueUrl",
      v.contact_email as "venueContactEmail",
      s.name as "screenName",
      s.capacity as "screenCapacity",
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
    LEFT JOIN "Screen" s ON c.screen_id = s.id
    JOIN "Venue" v ON c.venue_id = v.id
    LEFT JOIN "Charity" ch ON c.charity_id = ch.id
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
    deadlineDate: result[0].deadlineDate,
    fundingTarget: result[0].fundingTarget,
    currentFunding: result[0].currentFunding,
    ticketCap: result[0].ticketCap,
    currentTickets: result[0].currentTickets,
    status: result[0].isTest ? 'test' : 'live',
    isFeatured: false,
    screen: result[0]['screenName']
      ? {
          name: result[0]['screenName'],
          capacity: result[0]['screenCapacity'],
        }
      : null,
    venue: {
      name: result[0]['venueName'],
      address: result[0]['venueAddress'],
      city: result[0]['venueCity'],
      postcode: result[0]['venuePostcode'],
      phone: result[0]['venuePhone'],
      url: result[0]['venueUrl'],
      contactEmail: result[0]['venueContactEmail'],
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
