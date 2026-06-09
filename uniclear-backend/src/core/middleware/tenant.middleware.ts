/// <reference path="../../lib/utils/express.d.ts" />
import { Request, Response, NextFunction } from 'express'
import { db } from '@/lib/db'
import { NotFoundError } from '@/core/errors/AppError'

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const host = req.hostname
    let slug: string | undefined

    if (req.query.tenant) {
      slug = req.query.tenant as string
    } else {
      const parts = host.split('.')
      if (parts.length >= 3) slug = parts[0]
    }

    if (slug && slug !== 'www') {
      const university = await db.university.findUnique({
        where: { slug },
        select: { id: true, isActive: true },
      })
      if (!university) throw new NotFoundError('University not found')
      if (!university.isActive) throw new NotFoundError('University is suspended')
      req.universityId = university.id
      return next()
    }

    // Fallback: resolve from JWT universityId (already verified by authMiddleware)
    if (req.user?.universityId) {
      req.universityId = req.user.universityId
      return next()
    }

    next()
  } catch (err) {
    next(err)
  }
}
