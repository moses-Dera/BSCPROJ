import { db } from '@/lib/db'

export class UniversitiesRepository {
  static async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
    const [data, total] = await Promise.all([
      db.university.findMany({ where, skip, take: limit, include: { contract: true, _count: { select: { students: true } } }, orderBy: { createdAt: 'desc' } }),
      db.university.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string) {
    return db.university.findUnique({ where: { id }, include: { contract: true, branding: true, _count: { select: { students: true, stages: true } } } })
  }

  static async findBySlug(slug: string) {
    return db.university.findUnique({ where: { slug }, include: { branding: true } })
  }

  static async create(data: { name: string; slug: string; abbreviation: string; address: string; contactEmail: string; website?: string; primaryColor: string; accentColor: string }) {
    return db.university.create({ data })
  }

  static async update(id: string, data: { name?: string; abbreviation?: string; address?: string; contactEmail?: string; website?: string; primaryColor?: string; accentColor?: string }) {
    return db.university.update({ where: { id }, data })
  }

  static async suspend(id: string) {
    return db.university.update({ where: { id }, data: { isActive: false } })
  }

  static async restore(id: string) {
    return db.university.update({ where: { id }, data: { isActive: true } })
  }

  static async delete(id: string) {
    return db.university.delete({ where: { id } })
  }

  static async upsertContract(universityId: string, data: { tier: any; contractRef?: string; expiresAt?: Date; notes?: string }) {
    return db.contractPlan.upsert({
      where: { universityId },
      create: { universityId, ...data },
      update: data,
    })
  }
}
