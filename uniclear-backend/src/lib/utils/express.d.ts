import { Role } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      universityId?: string
      user?: {
        sub: string
        universityId: string | null
        role: Role
        iat?: number
        exp?: number
      }
    }
  }
}

export {}
