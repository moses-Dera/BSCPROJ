import { db } from '@/lib/db'

export class OfficersRepository {
  static async findAll(universityId: string, opts: { page: number; limit: number; stageId?: string }) {
    const { page, limit, stageId } = opts
    const skip = (page - 1) * limit
    const where: any = { universityId }
    if (stageId) where.stageId = stageId
    const [data, total] = await Promise.all([
      db.officer.findMany({ where, skip, take: limit, include: { user: { select: { email: true } }, stage: true }, orderBy: { createdAt: 'desc' } }),
      db.officer.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string, universityId: string) {
    return db.officer.findFirst({ where: { id, universityId }, include: { user: { select: { email: true } }, stage: true } })
  }

  static async findByUserId(userId: string) {
    return db.officer.findUnique({ where: { userId } })
  }

  static async create(universityId: string, userId: string, data: { firstName: string; lastName: string; stageId?: string }) {
    return db.officer.create({ data: { universityId, userId, ...data } })
  }

  static async update(id: string, data: { firstName?: string; lastName?: string; stageId?: string | null }) {
    return db.officer.update({ where: { id }, data })
  }

  static async delete(id: string) {
    return db.officer.delete({ where: { id } })
  }

  static async count(universityId: string) {
    return db.officer.count({ where: { universityId } })
  }
}
