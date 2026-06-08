import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { AuthController } from '@/modules/auth/auth.controller'
import { authMiddleware } from '@/core/middleware/auth.middleware'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login',            loginLimiter, AuthController.login)
router.post('/refresh',          AuthController.refresh)
router.post('/logout',           AuthController.logout)
router.get('/me',                authMiddleware, AuthController.getMe)
router.post('/set-password',     authMiddleware, AuthController.setPassword)
router.patch('/change-password', authMiddleware, AuthController.changePassword)

export default router
