const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const sessions = await prisma.academicSession.findMany()
  console.log("SESSIONS:", sessions)
}
main().catch(console.error).finally(() => prisma.$disconnect())
