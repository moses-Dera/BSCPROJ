import { db as prisma } from '../src/lib/db'

async function main() {
  console.log('Assigning a default session to all campaigns...')
  
  const campaigns = await prisma.clearanceCampaign.findMany({
    where: { sessionId: null }
  })

  if (campaigns.length === 0) {
    console.log('No campaigns need updating.')
    return
  }

  const uniId = campaigns[0].universityId

  let defaultSession = await prisma.academicSession.findFirst({
    where: { universityId: uniId }
  })

  if (!defaultSession) {
    console.log('Creating a default session...')
    defaultSession = await prisma.academicSession.create({
      data: {
        universityId: uniId,
        name: '2024/2025 Academic Session',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-08-31'),
        isActive: true
      }
    })
  }

  const update = await prisma.clearanceCampaign.updateMany({
    where: { sessionId: null },
    data: { sessionId: defaultSession.id }
  })

  console.log(`Successfully updated ${update.count} campaigns with session ID.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
