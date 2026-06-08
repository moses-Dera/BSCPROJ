import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, AuthError } from '@/core/errors/AppError'
import { Role } from '@prisma/client'

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AuthError())
    if (!roles.includes(req.user.role as Role)) return next(new ForbiddenError())
    next()
  }
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.universityId) return next(new ForbiddenError('Tenant not resolved'))
  next()
}

export function requireSameTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(new AuthError())
  if (req.user.role === 'PLATFORM_OWNER') return next()
  if (req.user.universityId !== req.universityId) return next(new ForbiddenError())
  next()
}
