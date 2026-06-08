import bcrypt from 'bcryptjs'
import { AuthRepository } from './auth.repository'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt/jwt'
import { AuthError, NotFoundError, ValidationError } from '@/core/errors/AppError'
import { LoginResponse } from './auth.types'

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    // Check platform owner first
    const platformOwner = await AuthRepository.findPlatformOwnerByEmail(email)
    if (platformOwner) {
      const valid = await bcrypt.compare(password, platformOwner.passwordHash)
      if (!valid) throw new AuthError('Invalid credentials')

      const payload = { sub: platformOwner.id, universityId: null, role: 'PLATFORM_OWNER' as const }
      const accessToken = signAccessToken(payload)
      const refreshToken = signRefreshToken({ sub: platformOwner.id })

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await AuthRepository.saveRefreshToken(platformOwner.id, refreshToken, expiresAt)

      return { accessToken, refreshToken, user: { id: platformOwner.id, email: platformOwner.email, role: 'PLATFORM_OWNER', universityId: null } }
    }

    const user = await AuthRepository.findUserByEmail(email)
    if (!user) throw new AuthError('Invalid credentials')
    if (!user.isActive) throw new AuthError('Account is inactive')
    if (!user.passwordSetAt) throw new AuthError('Password not set. Check your invite email.')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new AuthError('Invalid credentials')

    const payload = { sub: user.id, universityId: user.universityId, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken({ sub: user.id })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await AuthRepository.saveRefreshToken(user.id, refreshToken, expiresAt)

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, universityId: user.universityId } }
  }

  static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await AuthRepository.findRefreshToken(token)
    if (!stored || stored.expiresAt < new Date()) throw new AuthError('Invalid or expired refresh token')

    const payload = verifyRefreshToken(token)
    const user = stored.user

    // Rotate — delete old token, issue new one
    await AuthRepository.deleteRefreshToken(token)

    const accessToken = signAccessToken({
      sub: payload.sub,
      universityId: user.universityId,
      role: user.role,
    })

    const refreshToken = signRefreshToken({ sub: payload.sub })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await AuthRepository.saveRefreshToken(user.id, refreshToken, expiresAt)

    return { accessToken, refreshToken }
  }

  static async logout(token: string): Promise<void> {
    await AuthRepository.deleteRefreshToken(token).catch(() => {})
  }

  static async setPassword(userId: string, password: string): Promise<void> {
    const user = await AuthRepository.findUserById(userId)
    if (!user) throw new NotFoundError('User not found')
    if (user.passwordSetAt) throw new ValidationError('Password already set')

    const hash = await bcrypt.hash(password, 12)
    await AuthRepository.updatePassword(userId, hash)
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await AuthRepository.findUserByEmail(userId)
    if (!user) throw new NotFoundError('User not found')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new AuthError('Current password is incorrect')

    const hash = await bcrypt.hash(newPassword, 12)
    await AuthRepository.updatePassword(userId, hash)
  }

  static async getMe(userId: string) {
    const user = await AuthRepository.findUserById(userId)
    if (!user) throw new NotFoundError('User not found')
    return user
  }
}
