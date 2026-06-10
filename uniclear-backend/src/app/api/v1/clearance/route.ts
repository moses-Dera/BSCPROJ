import { Router } from 'express'
import { ClearanceController } from '@/modules/clearance/clearance.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole, requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant)

router.post('/start',                       requireRole('STUDENT'),                     ClearanceController.start)
router.get('/status',                       requireRole('STUDENT'),                     ClearanceController.getStatus)
router.get('/queue',                        requireRole('OFFICER'),                     ClearanceController.getQueue)
router.get('/by-student/:studentId',        requireRole('OFFICER', 'SUPER_ADMIN', 'ADMIN'), ClearanceController.getByStudent)
router.post('/:requestId/submit',           requireRole('STUDENT'),                     ClearanceController.submit)
router.post('/:requestId/approve',          requireRole('OFFICER'),                     ClearanceController.approve)
router.post('/:requestId/reject',           requireRole('OFFICER'),                     ClearanceController.reject)
router.get('/:requestId/history',           requireRole('SUPER_ADMIN', 'ADMIN', 'OFFICER', 'STUDENT'), ClearanceController.getHistory)
router.get('/:requestId/certificate',       requireRole('STUDENT', 'SUPER_ADMIN', 'ADMIN'), ClearanceController.getCertificate)

export default router
