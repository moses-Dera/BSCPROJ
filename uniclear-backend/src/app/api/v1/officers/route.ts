import { Router } from 'express'
import { OfficersController } from '@/modules/officers/officers.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole, requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant)

router.get('/me',     requireRole('OFFICER'),                    OfficersController.getMe)
router.get('/',       requireRole('SUPER_ADMIN', 'ADMIN'),        OfficersController.list)
router.get('/:id',    requireRole('SUPER_ADMIN', 'ADMIN'),        OfficersController.getById)
router.post('/',      requireRole('SUPER_ADMIN'),                 OfficersController.create)
router.patch('/:id',  requireRole('SUPER_ADMIN'),                 OfficersController.update)
router.delete('/:id', requireRole('SUPER_ADMIN'),                 OfficersController.delete)

export default router
