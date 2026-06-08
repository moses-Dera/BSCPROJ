import { db } from '@/lib/db'

export class AuditRepository {
  static async log(data: { universityId: string; actorId: string; action: string; targetId?: string; targetType?: string; metadata?: object; ipAddress?: string }) {
    return db.auditLog.create({ data })
  }

  static async findAll(universityId: string, opts: { page: number; limit: number; actorId?: string; targetId?: string }) {
    const { page, limit, actorId, targetId } = opts
    const skip = (page - 1) * limit
    const where: any = { universityId }
    if (actorId)  where.actorId  = actorId
    if (targetId) where.targetId = targetId
    const [data, total] = await Promise.all([
      db.auditLog.findMany({ where, skip, take: limit, include: { actor: { select: { email: true, role: true } } }, orderBy: { createdAt: 'desc' } }),
      db.auditLog.count({ where }),
    ])
    return { data, total }
  }
}
