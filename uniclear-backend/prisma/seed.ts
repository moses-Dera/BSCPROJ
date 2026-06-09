import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Platform Owner (role-based user, no university)
  const platformOwner = await db.user.upsert({
    where:  { email: 'admin@uniclear.ng' },
    update: {},
    create: {
      email: 'admin@uniclear.ng',
      passwordHash: await bcrypt.hash('Admin@1234', 12),
      passwordSetAt: new Date(),
      role: 'PLATFORM_OWNER',
    },
  })
  console.log('✅ Platform owner created:', platformOwner.email)

  // University: UNN
  const unn = await db.university.upsert({
    where:  { slug: 'unn' },
    update: {},
    create: {
      name: 'University of Nigeria, Nsukka', slug: 'unn', abbreviation: 'UNN',
      primaryColor: '#1B4F72', accentColor: '#2980B9',
      address: 'Nsukka, Enugu State, Nigeria',
      contactEmail: 'registrar@unn.edu.ng',
    },
  })

  await db.contractPlan.upsert({
    where:  { universityId: unn.id },
    update: {},
    create: { universityId: unn.id, tier: 'STANDARD', contractRef: 'UNN-2025-001' },
  })

  // Super Admin for UNN
  const superAdminUser = await db.user.upsert({
    where:  { email: 'superadmin@unn.edu.ng' },
    update: {},
    create: {
      email: 'superadmin@unn.edu.ng', role: 'SUPER_ADMIN', universityId: unn.id,
      passwordHash: await bcrypt.hash('Admin@1234', 12), passwordSetAt: new Date(),
    },
  })
  console.log('✅ UNN super admin created:', superAdminUser.email)

  // Academic Session
  const session = await db.academicSession.upsert({
    where:  { id: 'seed-session-unn-2024' },
    update: {},
    create: {
      id: 'seed-session-unn-2024', universityId: unn.id,
      name: '2024/2025', startDate: new Date('2024-09-01'), endDate: new Date('2025-08-31'), isActive: true,
    },
  })
  console.log('✅ Academic session created:', session.name)

  // Clearance Stages
  const stageNames = ['Library Clearance', 'Bursary / Finance', 'Medical Centre', 'Hostel', 'Faculty Officer']
  for (let i = 0; i < stageNames.length; i++) {
    await db.clearanceStage.upsert({
      where:  { id: `seed-stage-unn-${i}` },
      update: { name: stageNames[i], orderIndex: i + 1 },
      create: { id: `seed-stage-unn-${i}`, universityId: unn.id, name: stageNames[i], orderIndex: i + 1 },
    })
  }
  console.log('✅ UNN stages created')

  // Document Types
  const docTypes = [
    { name: 'JAMB Admission Letter', description: 'Upload both Institution and Candidate copies as one PDF' },
    { name: 'Birth Certificate',     description: 'Original or certified true copy' },
    { name: 'Medical Fitness Certificate', description: 'Signed by a licensed medical doctor' },
    { name: 'O-Level Result',        description: 'WAEC or NECO result' },
  ]
  for (let i = 0; i < docTypes.length; i++) {
    await db.documentType.upsert({
      where:  { id: `seed-doctype-unn-${i}` },
      update: {},
      create: { id: `seed-doctype-unn-${i}`, universityId: unn.id, ...docTypes[i], order: i + 1 },
    })
  }
  console.log('✅ UNN document types created')

  // Faculty & Department
  const faculty = await db.faculty.upsert({
    where:  { id: 'seed-faculty-unn-0' },
    update: {},
    create: { id: 'seed-faculty-unn-0', universityId: unn.id, name: 'Faculty of Engineering' },
  })

  const department = await db.department.upsert({
    where:  { id: 'seed-dept-unn-0' },
    update: {},
    create: { id: 'seed-dept-unn-0', facultyId: faculty.id, name: 'Computer Engineering' },
  })
  console.log('✅ Faculty and department created')

  // Officer user
  const officerUser = await db.user.upsert({
    where:  { email: 'officer@unn.edu.ng' },
    update: {},
    create: {
      email: 'officer@unn.edu.ng', role: 'OFFICER', universityId: unn.id,
      passwordHash: await bcrypt.hash('Admin@1234', 12), passwordSetAt: new Date(),
    },
  })

  // Get first stage to assign officer
  const firstStage = await db.clearanceStage.findFirst({
    where: { universityId: unn.id },
    orderBy: { orderIndex: 'asc' },
  })

  await db.officer.upsert({
    where:  { userId: officerUser.id },
    update: {},
    create: {
      id: 'seed-officer-unn-0',
      universityId: unn.id,
      userId: officerUser.id,
      firstName: 'Chukwuemeka',
      lastName:  'Obi',
      stageId:   firstStage?.id ?? null,
    },
  })
  console.log('✅ Officer created:', officerUser.email)

  // Student user
  const studentUser = await db.user.upsert({
    where:  { email: 'student@unn.edu.ng' },
    update: {},
    create: {
      email: 'student@unn.edu.ng', role: 'STUDENT', universityId: unn.id,
      passwordHash: await bcrypt.hash('Admin@1234', 12), passwordSetAt: new Date(),
    },
  })

  await db.student.upsert({
    where:  { userId: studentUser.id },
    update: {},
    create: {
      id:           'seed-student-unn-0',
      universityId: unn.id,
      userId:       studentUser.id,
      matricNo:     'UNN/2021/001',
      firstName:    'Adaeze',
      lastName:     'Nwosu',
      facultyId:    faculty.id,
      departmentId: department.id,
      level:        '500',
    },
  })
  console.log('✅ Student created:', studentUser.email)

  console.log('\n🎉 Seed complete!')
  console.log('Platform Owner  — admin@uniclear.ng         / Admin@1234')
  console.log('UNN Super Admin — superadmin@unn.edu.ng     / Admin@1234')
  console.log('UNN Officer     — officer@unn.edu.ng        / Admin@1234')
  console.log('UNN Student     — student@unn.edu.ng        / Admin@1234')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
