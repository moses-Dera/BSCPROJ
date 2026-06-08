import { JwtPayload } from '@/modules/auth/auth.types'

declare global {
  namespace Express {
    interface Request {
      universityId?: string
      user?: JwtPayload
    }
  }
}

export {}
