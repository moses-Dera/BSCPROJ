import { db } from '@/lib/db'
import { NotificationType } from '@prisma/client'

export class NotificationsRepository {
  static async findAll(userId: string, universityId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      db.notification.findMany({ where: { userId, universityId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.notification.count({ where: { userId, universityId } }),
    ])
    return { data, total }
  }

  static async unreadCount(userId: string, universityId: string) {
    return db.notification.count({ where: { userId, universityId, isRead: false } })
  }

  static async create(data: { universityId: string; userId: string; type: NotificationType; title: string; message: string; metadata?: object }) {
    return db.notification.create({ data })
  }

  static async markRead(id: string, userId: string) {
    return db.notification.update({ where: { id }, data: { isRead: true } })
  }

  static async markAllRead(userId: string, universityId: string) {
    return db.notification.updateMany({ where: { userId, universityId, isRead: false }, data: { isRead: true } })
  }

  static async delete(id: string, userId: string) {
    return db.notification.delete({ where: { id } })
  }
}
