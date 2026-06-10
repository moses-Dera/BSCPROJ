import { Router } from 'express'
import { db } from '@/lib/db'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireTenant } from '@/core/middleware/rbac.middleware'
import { ApiResponse } from '@/core/response/ApiResponse'

const router = Router()

router.use(authMiddleware, requireTenant)

router.get('/faculties', async (req, res, next) => {
  try {
    const data = await db.faculty.findMany({ where: { universityId: req.universityId } })
    return ApiResponse.success(res, data)
  } catch (err) { next(err) }
})

router.get('/departments', async (req, res, next) => {
  try {
    const data = await db.department.findMany({ where: { faculty: { universityId: req.universityId } } })
    return ApiResponse.success(res, data)
  } catch (err) { next(err) }
})

export default router
