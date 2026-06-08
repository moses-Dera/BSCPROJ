import { Router } from 'express'
import { UniversitiesController } from '@/modules/universities/universities.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireRole('PLATFORM_OWNER'))

router.get('/',                      UniversitiesController.list)
router.get('/:id',                   UniversitiesController.getById)
router.post('/',                     UniversitiesController.create)
router.patch('/:id',                 UniversitiesController.update)
router.patch('/:id/suspend',         UniversitiesController.suspend)
router.patch('/:id/restore',         UniversitiesController.restore)
router.delete('/:id',                UniversitiesController.delete)
router.patch('/:id/contract',        UniversitiesController.updateContract)

export default router
