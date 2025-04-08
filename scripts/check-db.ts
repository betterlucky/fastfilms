import { main } from './prisma-setup'

async function checkDb() {
  const client = await main()

  try {
    // Get Venue table info
    const tableInfo = await client.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Venue'
      ORDER BY ordinal_position;
    `
    console.log('\nVenue table columns:')
    console.table(tableInfo)

    // Get existing venues
    const venues = await client.venue.findMany()
    console.log('\nExisting venues:', venues)
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await client.$disconnect()
  }
}

checkDb()
