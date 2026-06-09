import { Role } from '@prisma/client'

export interface JwtPayload {
  sub: string
  universityId: string | null
  role: Role
  iat?: number
  exp?: number
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    role: Role
    universityId: string | null
    universitySlug: string | null
  }
}
