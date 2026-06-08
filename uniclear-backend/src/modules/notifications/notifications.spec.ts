import { NotificationsService } from './notification.service'
import { NotificationsRepository } from './notification.repository'

jest.mock('./notification.repository')

const mockNotification = {
  id: 'notif-id', universityId: 'uni-id', userId: 'user-id',
  type: 'STAGE_APPROVED' as const, title: 'Stage Approved', message: 'Your stage was approved',
  isRead: false, createdAt: new Date(),
}

describe('NotificationsService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('list', () => {
    it('should return paginated notifications', async () => {
      jest.spyOn(NotificationsRepository, 'findAll').mockResolvedValue({ data: [mockNotification as any], total: 1 })
      const result = await NotificationsService.list('user-id', 'uni-id', 1, 20)
      expect(result.total).toBe(1)
      expect(result.data[0].title).toBe('Stage Approved')
    })
  })

  describe('unreadCount', () => {
    it('should return unread count', async () => {
      jest.spyOn(NotificationsRepository, 'unreadCount').mockResolvedValue(3)
      const count = await NotificationsService.unreadCount('user-id', 'uni-id')
      expect(count).toBe(3)
    })
  })

  describe('send', () => {
    it('should create a notification', async () => {
      const spy = jest.spyOn(NotificationsRepository, 'create').mockResolvedValue(mockNotification as any)
      await NotificationsService.send('uni-id', 'user-id', 'STAGE_APPROVED', 'Stage Approved', 'Approved!')
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Stage Approved' }))
    })
  })

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      const spy = jest.spyOn(NotificationsRepository, 'markRead').mockResolvedValue({ ...mockNotification, isRead: true } as any)
      await NotificationsService.markRead('notif-id', 'user-id')
      expect(spy).toHaveBeenCalledWith('notif-id', 'user-id')
    })
  })

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      const spy = jest.spyOn(NotificationsRepository, 'markAllRead').mockResolvedValue({ count: 5 } as any)
      await NotificationsService.markAllRead('user-id', 'uni-id')
      expect(spy).toHaveBeenCalledWith('user-id', 'uni-id')
    })
  })
})
