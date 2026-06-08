import { Request, Response, NextFunction } from 'express'
import { SessionsService } from './sessions.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { createSessionSchema, updateSessionSchema } from './sessions.schema'
import { param } from '@/lib/utils/param'

export class SessionsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await SessionsService.list(req.universityId!)
      return ApiResponse.success(res, sessions)
    } catch (err) { next(err) }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await SessionsService.getById(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, session)
    } catch (err) { next(err) }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSessionSchema.parse(req.body)
      const session = await SessionsService.create(req.universityId!, data)
      return ApiResponse.created(res, session)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSessionSchema.parse(req.body)
      const session = await SessionsService.update(param(req.params.id), req.universityId!, data)
      return ApiResponse.success(res, session)
    } catch (err) { next(err) }
  }

  static async activate(req: Request, res: Response, next: NextFunction) {
    try {
      await SessionsService.activate(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, null, 'Session activated')
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SessionsService.delete(param(req.params.id), req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }
}
