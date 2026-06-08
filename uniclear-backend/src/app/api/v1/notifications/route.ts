import { Router } from 'express'
import { NotificationsController } from '@/modules/notifications/notification.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant)

router.get('/',                NotificationsController.list)
router.get('/unread-count',    NotificationsController.unreadCount)
router.patch('/read-all',      NotificationsController.markAllRead)
router.patch('/:id/read',      NotificationsController.markRead)
router.delete('/:id',          NotificationsController.delete)

export default router
