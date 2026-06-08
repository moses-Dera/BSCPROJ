import { Request, Response, NextFunction } from 'express'
import { NotificationsService } from './notification.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { z } from 'zod'
import { param } from '@/lib/utils/param'

const querySchema = z.object({ page: z.coerce.number().default(1), limit: z.coerce.number().default(20) })

export class NotificationsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = querySchema.parse(req.query)
      const { data, total } = await NotificationsService.list(req.user!.sub, req.universityId!, page, limit)
      return ApiResponse.paginated(res, data, total, page, limit)
    } catch (err) { next(err) }
  }

  static async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await NotificationsService.unreadCount(req.user!.sub, req.universityId!)
      return ApiResponse.success(res, { count })
    } catch (err) { next(err) }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markRead(param(req.params.id), req.user!.sub)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }

  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAllRead(req.user!.sub, req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.delete(param(req.params.id), req.user!.sub)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }
}
