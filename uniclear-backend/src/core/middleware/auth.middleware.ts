import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '@/core/config/env'
import { AuthError } from '@/core/errors/AppError'
import { JwtPayload } from '@/modules/auth/auth.types'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) throw new AuthError()

    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload

    req.user = payload
    next()
  } catch (err) {
    next(new AuthError())
  }
}
