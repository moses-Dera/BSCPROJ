import { Request, Response, NextFunction } from 'express'
import { ReportsService } from './reports.service'
import { ApiResponse } from '@/core/response/ApiResponse'

export class ReportsController {
  static async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportsService.summary(req.universityId!)
      return ApiResponse.success(res, data)
    } catch (err) { next(err) }
  }

  static async byStage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportsService.byStage(req.universityId!)
      return ApiResponse.success(res, data)
    } catch (err) { next(err) }
  }

  static async export(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.query.sessionId as string | undefined
      const data = await ReportsService.export(req.universityId!, sessionId)
      return ApiResponse.success(res, data)
    } catch (err) { next(err) }
  }
}
