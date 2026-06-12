import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthRepository } from './auth.repository'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt/jwt'
import { AuthError, NotFoundError, ValidationError } from '@/core/errors/AppError'
import { LoginResponse } from './auth.types'
import { logger } from '@/core/logger/logger'
import { sendInviteEmail } from '@/modules/notifications/channels/email.channel'
import { env } from '@/core/config/env'

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const user = await AuthRepository.findUserByEmail(email)
    if (!user) throw new AuthError('Invalid credentials')
    if (!user.isActive) throw new AuthError('Account is inactive')
    if (!user.passwordSetAt) throw new AuthError('Password not set. Check your invite email.')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new AuthError('Invalid credentials')

    const accessToken = signAccessToken({ sub: user.id, universityId: user.universityId, role: user.role })
    const refreshToken = signRefreshToken({ sub: user.id })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await AuthRepository.saveRefreshToken(user.id, refreshToken, expiresAt)

    return { 
      accessToken, 
      refreshToken, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        universityId: user.universityId, 
        universitySlug: user.university?.slug ?? null,
        student: user.student,
        officer: user.officer
      } 
    }
  }

  static async register(data: { universitySlug: string, jambRegNo: string, email: string, password: string }): Promise<LoginResponse> {
    const { db } = await import('@/lib/db')
    const university = await db.university.findUnique({ where: { slug: data.universitySlug } })
    if (!university) throw new NotFoundError('University not found')

    const studentRecord = await db.student.findUnique({ where: { universityId_jambRegNo: { universityId: university.id, jambRegNo: data.jambRegNo } } })
    if (!studentRecord) throw new AuthError('You are not on the admission list. Please contact the registry.')
    if (studentRecord.userId) throw new AuthError('An account has already been claimed for this JAMB Reg No.')

    const existingUser = await db.user.findUnique({ where: { email: data.email } })
    if (existingUser) throw new AuthError('Email is already in use.')

    const hash = await bcrypt.hash(data.password, 12)
    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        role: 'STUDENT',
        universityId: university.id,
        passwordSetAt: new Date(),
        isActive: true,
      }
    })

    await db.student.update({
      where: { id: studentRecord.id },
      data: { userId: user.id }
    })

    const accessToken = signAccessToken({ sub: user.id, universityId: university.id, role: user.role })
    const refreshToken = signRefreshToken({ sub: user.id })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await AuthRepository.saveRefreshToken(user.id, refreshToken, expiresAt)

    return { 
      accessToken, 
      refreshToken, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        universityId: university.id, 
        universitySlug: university.slug,
        student: studentRecord
      } 
    }
  }

  static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await AuthRepository.findRefreshToken(token)
    if (!stored || stored.expiresAt < new Date()) throw new AuthError('Invalid or expired refresh token')

    const payload = verifyRefreshToken(token)
    const { user } = stored
    if (!user) throw new AuthError('Invalid or expired refresh token')

    await AuthRepository.deleteRefreshToken(token)

    const accessToken = signAccessToken({ sub: payload.sub, universityId: user.universityId, role: user.role })
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

  static async forgotPassword(email: string): Promise<void> {
    const user = await AuthRepository.findUserByEmail(email)
    if (!user || !user.isActive) return

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await AuthRepository.savePasswordResetToken(user.id, token, expiresAt)

    const resetLink = `${env.APP_URL}/set-password?token=${token}`
    logger.info({ email, resetLink }, 'Password reset requested')

    await sendInviteEmail({
      to: email,
      name: email,
      role: 'password reset',
      inviteLink: resetLink,
      tempPassword: '',
    })
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    const record = await AuthRepository.findPasswordResetToken(token)
    if (!record) throw new ValidationError('Invalid or expired reset token')
    if (record.usedAt) throw new ValidationError('Reset token has already been used')
    if (record.expiresAt < new Date()) throw new ValidationError('Reset token has expired')

    const hash = await bcrypt.hash(password, 12)
    await AuthRepository.updatePassword(record.userId, hash)
    await AuthRepository.markPasswordResetTokenUsed(record.id)
  }

  static async getMe(userId: string) {
    const user = await AuthRepository.findUserById(userId)
    if (!user) throw new NotFoundError('User not found')
    return user
  }
}
