import { Router } from 'express'
import { AuditController } from '@/modules/audit/audit.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole, requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant, requireRole('SUPER_ADMIN', 'ADMIN'))

router.get('/', AuditController.list)

export default router
