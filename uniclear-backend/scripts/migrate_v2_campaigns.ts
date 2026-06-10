import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting V2 Campaign Migration...')

  const universities = await prisma.university.findMany()

  for (const uni of universities) {
    // Check if a default campaign exists
    let defaultCampaign = await prisma.clearanceCampaign.findFirst({
      where: { universityId: uni.id, name: 'Default Legacy Campaign' }
    })

    if (!defaultCampaign) {
      console.log(`Creating default campaign for university: ${uni.name}`)
      defaultCampaign = await prisma.clearanceCampaign.create({
        data: {
          name: 'Default Legacy Campaign',
          description: 'Auto-generated campaign for legacy clearance data.',
          universityId: uni.id,
          isActive: true,
        }
      })
    }

    // Migrate Stages
    const stagesUpdate = await prisma.clearanceStage.updateMany({
      where: {
        universityId: uni.id,
        campaignId: null
      },
      data: {
        campaignId: defaultCampaign.id
      }
    })
    console.log(`Migrated ${stagesUpdate.count} stages for ${uni.name}`)

    // Migrate Clearance Requests
    const requestsUpdate = await prisma.clearanceRequest.updateMany({
      where: {
        universityId: uni.id,
        campaignId: null
      },
      data: {
        campaignId: defaultCampaign.id
      }
    })
    console.log(`Migrated ${requestsUpdate.count} clearance requests for ${uni.name}`)
  }

  console.log('Migration Complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
