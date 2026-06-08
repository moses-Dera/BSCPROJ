import { db } from '@/lib/db'

export class SessionsRepository {
  static async findAll(universityId: string) {
    return db.academicSession.findMany({ where: { universityId }, orderBy: { startDate: 'desc' } })
  }

  static async findById(id: string, universityId: string) {
    return db.academicSession.findFirst({ where: { id, universityId } })
  }

  static async findActive(universityId: string) {
    return db.academicSession.findFirst({ where: { universityId, isActive: true } })
  }

  static async create(data: { universityId: string; name: string; startDate: Date; endDate: Date }) {
    return db.academicSession.create({ data })
  }

  static async update(id: string, data: { name?: string; startDate?: Date; endDate?: Date }) {
    return db.academicSession.update({ where: { id }, data })
  }

  static async activate(id: string, universityId: string) {
    return db.$transaction([
      db.academicSession.updateMany({ where: { universityId }, data: { isActive: false } }),
      db.academicSession.update({ where: { id }, data: { isActive: true } }),
    ])
  }

  static async delete(id: string) {
    return db.academicSession.delete({ where: { id } })
  }
}
