import { NotificationsRepository } from './notification.repository'
import { NotificationType } from '@prisma/client'

export class NotificationsService {
  static async list(userId: string, universityId: string, page = 1, limit = 20) {
    return NotificationsRepository.findAll(userId, universityId, page, limit)
  }

  static async unreadCount(userId: string, universityId: string) {
    return NotificationsRepository.unreadCount(userId, universityId)
  }

  static async send(universityId: string, userId: string, type: NotificationType, title: string, message: string, metadata?: object) {
    return NotificationsRepository.create({ universityId, userId, type, title, message, metadata })
  }

  static async markRead(id: string, userId: string) {
    return NotificationsRepository.markRead(id, userId)
  }

  static async markAllRead(userId: string, universityId: string) {
    return NotificationsRepository.markAllRead(userId, universityId)
  }

  static async delete(id: string, userId: string) {
    return NotificationsRepository.delete(id, userId)
  }
}
