import { Router } from 'express'
import { StudentsController } from '@/modules/students/students.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole, requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant)

router.get('/',                        requireRole('SUPER_ADMIN', 'ADMIN'), StudentsController.list)
router.get('/:id',                     requireRole('SUPER_ADMIN', 'ADMIN'), StudentsController.getById)
router.post('/',                       requireRole('SUPER_ADMIN', 'ADMIN'), StudentsController.create)
router.post('/bulk',                   requireRole('SUPER_ADMIN', 'ADMIN'), StudentsController.bulkCreate)
router.patch('/:id',                   requireRole('SUPER_ADMIN', 'ADMIN'), StudentsController.update)
router.delete('/:id',                  requireRole('SUPER_ADMIN'),          StudentsController.delete)
router.get('/:id/clearance',           requireRole('SUPER_ADMIN', 'ADMIN'), StudentsController.getClearanceProgress)

export default router
