const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
async function main() {
  const sessions = await prisma.academicSession.findMany()
  fs.writeFileSync('out.json', JSON.stringify(sessions, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
