import { Router } from 'express'
import { WebhookController } from '@/modules/webhooks/webhooks.controller'
import { webhookMiddleware } from '@/core/middleware/webhook.middleware'

const router = Router()

// Protect all webhook routes with the API Key middleware
router.use(webhookMiddleware)

router.post('/students/sync', WebhookController.syncStudents)

export default router
