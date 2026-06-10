import { Router } from 'express'
import { db } from '@/lib/db'
import { authMiddleware } from '@/core/middleware/auth.middleware'
import { requireTenant, requireRole } from '@/core/middleware/rbac.middleware'
import { ApiResponse } from '@/core/response/ApiResponse'

const router = Router()

router.use(authMiddleware, requireTenant)

router.get('/faculties', async (req, res, next) => {
  try {
    const data = await db.faculty.findMany({ where: { universityId: req.universityId } })
    return ApiResponse.success(res, data)
  } catch (err) { next(err) }
})

router.post('/faculties', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await db.faculty.create({ data: { name: req.body.name, universityId: req.universityId! } })
    return ApiResponse.success(res, data, 'Created', 201)
  } catch (err) { next(err) }
})

router.delete('/faculties/:id', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await db.faculty.delete({ where: { id: req.params.id } })
    return ApiResponse.success(res, { deleted: true })
  } catch (err) { next(err) }
})

router.get('/departments', async (req, res, next) => {
  try {
    const data = await db.department.findMany({ where: { faculty: { universityId: req.universityId } } })
    return ApiResponse.success(res, data)
  } catch (err) { next(err) }
})

router.post('/departments', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await db.department.create({ data: { name: req.body.name, facultyId: req.body.facultyId } })
    return ApiResponse.success(res, data, 'Created', 201)
  } catch (err) { next(err) }
})

router.delete('/departments/:id', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await db.department.delete({ where: { id: req.params.id } })
    return ApiResponse.success(res, { deleted: true })
  } catch (err) { next(err) }
})

export default router
