import { Request, Response, NextFunction } from 'express'
import { BrandingService } from './branding.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { ValidationError } from '@/core/errors/AppError'
import { z } from 'zod'

const updateBrandingSchema = z.object({
  primaryColor:  z.string().optional(),
  accentColor:   z.string().optional(),
  bannerMessage: z.string().optional(),
  footerText:    z.string().optional(),
  certificateCoordinates: z.any().optional(),
})

export class BrandingController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const branding = await BrandingService.get(req.universityId!)
      return ApiResponse.success(res, branding)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateBrandingSchema.parse(req.body)
      const branding = await BrandingService.update(req.universityId!, data)
      return ApiResponse.success(res, branding)
    } catch (err) { next(err) }
  }

  static async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('No file uploaded')
      const result = await BrandingService.uploadLogo(req.universityId!, req.file)
      return ApiResponse.success(res, result)
    } catch (err) { next(err) }
  }

  static async uploadLoginBg(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('No file uploaded')
      const result = await BrandingService.uploadLoginBg(req.universityId!, req.file)
      return ApiResponse.success(res, result)
    } catch (err) { next(err) }
  }
}
