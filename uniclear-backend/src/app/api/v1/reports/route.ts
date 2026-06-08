import { Router } from 'express'
import { ReportsController } from '@/modules/reports/reports.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole, requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant, requireRole('SUPER_ADMIN', 'ADMIN'))

router.get('/summary',   ReportsController.summary)
router.get('/by-stage',  ReportsController.byStage)
router.get('/export',    ReportsController.export)

export default router
