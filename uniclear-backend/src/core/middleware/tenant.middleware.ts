import { Request, Response, NextFunction } from 'express'
import { db } from '@/lib/db'
import { NotFoundError } from '@/core/errors/AppError'

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const host = req.hostname
    let slug: string | undefined

    // Dev: ?tenant=unn  |  Prod: unn.uniclear.ng
    if (req.query.tenant) {
      slug = req.query.tenant as string
    } else {
      const parts = host.split('.')
      if (parts.length >= 3) slug = parts[0]
    }

    if (!slug || slug === 'www') return next()

    const university = await db.university.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    })

    if (!university) throw new NotFoundError('University not found')
    if (!university.isActive) throw new NotFoundError('University is suspended')

    req.universityId = university.id
    next()
  } catch (err) {
    next(err)
  }
}
