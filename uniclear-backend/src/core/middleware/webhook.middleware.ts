import { Request, Response, NextFunction } from 'express'
import { db } from '@/lib/db'
import { AuthError } from '@/core/errors/AppError'

export const webhookMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '')
    
    if (!apiKey || typeof apiKey !== 'string') {
      throw new AuthError('Missing API Key')
    }

    const university = await db.university.findUnique({
      where: { webhookSecret: apiKey }
    })

    if (!university) {
      throw new AuthError('Invalid API Key')
    }

    req.user = { sub: 'webhook', role: 'ADMIN', universityId: university.id }
    next()
  } catch (error) {
    next(error)
  }
}
