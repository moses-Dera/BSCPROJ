import { Router } from 'express'
import { CampaignsController } from '@/modules/campaigns/campaigns.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireRole, requireTenant } from '@/core/middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, requireTenant)

router.get('/',               requireRole('SUPER_ADMIN', 'ADMIN', 'OFFICER'), CampaignsController.list)
router.get('/active',         requireRole('SUPER_ADMIN', 'ADMIN', 'OFFICER', 'STUDENT'), CampaignsController.listActive)
router.post('/',              requireRole('SUPER_ADMIN'), CampaignsController.create)
router.patch('/:id',          requireRole('SUPER_ADMIN'), CampaignsController.update)
router.patch('/:id/toggle',   requireRole('SUPER_ADMIN'), CampaignsController.toggle)
router.delete('/:id',         requireRole('SUPER_ADMIN'), CampaignsController.delete)

export default router
