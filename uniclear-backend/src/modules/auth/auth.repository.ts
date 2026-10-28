import { db } from '@/lib/db'

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: { student: true, officer: true, university: { select: { slug: true } } },
    })
  }

  static async findUserById(id: string) {
    return db.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        universityId: true, 
        isActive: true, 
        passwordSetAt: true,
        student: { select: { firstName: true, lastName: true } },
        officer: { select: { firstName: true, lastName: true } }
      },
    })
  }

  static async findUserWithPasswordById(id: string) {
    return db.user.findUnique({
      where: { id },
    })
  }

  static async updatePassword(userId: string, passwordHash: string) {
    return db.user.update({
      where: { id: userId },
      data: { passwordHash, passwordSetAt: new Date() },
    })
  }

  static async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    // Retry on unique constraint collision (multiple tabs refreshing simultaneously)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await db.refreshToken.create({ data: { userId, token, expiresAt } })
      } catch (err: any) {
        if (err?.code === 'P2002' && attempt < 2) {
          // Generate a new token and retry
          const crypto = await import('crypto')
          token = crypto.randomBytes(64).toString('hex')
          continue
        }
        throw err
      }
    }
    return db.refreshToken.create({ data: { userId, token, expiresAt } })
  }

  static async findRefreshToken(token: string) {
    return db.refreshToken.findUnique({ where: { token }, include: { user: true } })
  }

  static async deleteRefreshToken(token: string) {
    return db.refreshToken.deleteMany({ where: { token } })
  }

  static async deleteAllUserRefreshTokens(userId: string) {
    return db.refreshToken.deleteMany({ where: { userId } })
  }

  static async savePasswordResetToken(userId: string, token: string, expiresAt: Date) {
    await db.passwordResetToken.deleteMany({ where: { userId } })
    return db.passwordResetToken.create({ data: { userId, token, expiresAt } })
  }

  static async saveInviteToken(userId: string, token: string, expiresAt: Date) {
    return AuthRepository.savePasswordResetToken(userId, token, expiresAt)
  }

  static async findPasswordResetToken(token: string) {
    return db.passwordResetToken.findUnique({ where: { token }, include: { user: true } })
  }

  static async markPasswordResetTokenUsed(id: string) {
    return db.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } })
  }
}
