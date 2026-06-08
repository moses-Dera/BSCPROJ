import { AuthService } from './auth.service'
import { AuthRepository } from './auth.repository'
import { AuthError, ValidationError } from '@/core/errors/AppError'
import bcrypt from 'bcryptjs'

jest.mock('./auth.repository')
jest.mock('@/lib/jwt/jwt', () => ({
  signAccessToken:    jest.fn().mockReturnValue('access-token'),
  signRefreshToken:   jest.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: jest.fn().mockReturnValue({ sub: 'user-id' }),
}))

const mockUser = {
  id: 'user-id', email: 'test@unn.edu.ng', role: 'STUDENT' as const,
  universityId: 'uni-id', isActive: true,
  passwordHash: bcrypt.hashSync('password123', 10),
  passwordSetAt: new Date(), officer: null,
}

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      jest.spyOn(AuthRepository, 'findPlatformOwnerByEmail').mockResolvedValue(null)
      jest.spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(mockUser as any)
      jest.spyOn(AuthRepository, 'saveRefreshToken').mockResolvedValue({} as any)

      const result = await AuthService.login('test@unn.edu.ng', 'password123')

      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
      expect(result.user.email).toBe('test@unn.edu.ng')
    })

    it('should throw AuthError on invalid password', async () => {
      jest.spyOn(AuthRepository, 'findPlatformOwnerByEmail').mockResolvedValue(null)
      jest.spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(mockUser as any)

      await expect(AuthService.login('test@unn.edu.ng', 'wrongpassword'))
        .rejects.toThrow(AuthError)
    })

    it('should throw AuthError when user not found', async () => {
      jest.spyOn(AuthRepository, 'findPlatformOwnerByEmail').mockResolvedValue(null)
      jest.spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(null)

      await expect(AuthService.login('notfound@unn.edu.ng', 'password123'))
        .rejects.toThrow(AuthError)
    })

    it('should throw AuthError when account is inactive', async () => {
      jest.spyOn(AuthRepository, 'findPlatformOwnerByEmail').mockResolvedValue(null)
      jest.spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue({ ...mockUser, isActive: false } as any)

      await expect(AuthService.login('test@unn.edu.ng', 'password123'))
        .rejects.toThrow(AuthError)
    })

    it('should throw AuthError when password not set yet', async () => {
      jest.spyOn(AuthRepository, 'findPlatformOwnerByEmail').mockResolvedValue(null)
      jest.spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue({ ...mockUser, passwordSetAt: null } as any)

      await expect(AuthService.login('test@unn.edu.ng', 'password123'))
        .rejects.toThrow(AuthError)
    })
  })

  describe('setPassword', () => {
    it('should set password for new user', async () => {
      jest.spyOn(AuthRepository, 'findUserById').mockResolvedValue({ ...mockUser, passwordSetAt: null } as any)
      jest.spyOn(AuthRepository, 'updatePassword').mockResolvedValue({} as any)

      await expect(AuthService.setPassword('user-id', 'NewPass@123')).resolves.not.toThrow()
    })

    it('should throw ValidationError if password already set', async () => {
      jest.spyOn(AuthRepository, 'findUserById').mockResolvedValue(mockUser as any)

      await expect(AuthService.setPassword('user-id', 'NewPass@123'))
        .rejects.toThrow(ValidationError)
    })
  })

  describe('logout', () => {
    it('should delete refresh token', async () => {
      const spy = jest.spyOn(AuthRepository, 'deleteRefreshToken').mockResolvedValue({} as any)
      await AuthService.logout('refresh-token')
      expect(spy).toHaveBeenCalledWith('refresh-token')
    })
  })

  describe('getMe', () => {
    it('should return user by id', async () => {
      jest.spyOn(AuthRepository, 'findUserById').mockResolvedValue(mockUser as any)
      const result = await AuthService.getMe('user-id')
      expect(result.email).toBe('test@unn.edu.ng')
    })
  })
})
