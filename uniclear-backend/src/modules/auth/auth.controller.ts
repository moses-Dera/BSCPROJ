import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { loginSchema, setPasswordSchema, changePasswordSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema'

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body)
      const result = await AuthService.login(email, password)
      return ApiResponse.success(res, result, 'Login successful')
    } catch (err) { next(err) }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body)
      const result = await AuthService.refresh(refreshToken)
      return ApiResponse.success(res, result)
    } catch (err) { next(err) }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body)
      await AuthService.logout(refreshToken)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }

  static async setPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = setPasswordSchema.parse(req.body)
      await AuthService.setPassword(req.user!.sub, password)
      return ApiResponse.success(res, null, 'Password set successfully')
    } catch (err) { next(err) }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
      await AuthService.changePassword(req.user!.sub, currentPassword, newPassword)
      return ApiResponse.success(res, null, 'Password changed successfully')
    } catch (err) { next(err) }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body)
      await AuthService.forgotPassword(email)
      return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent')
    } catch (err) { next(err) }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body)
      await AuthService.resetPassword(token, password)
      return ApiResponse.success(res, null, 'Password reset successfully')
    } catch (err) { next(err) }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.sub)
      return ApiResponse.success(res, user)
    } catch (err) { next(err) }
  }
}
