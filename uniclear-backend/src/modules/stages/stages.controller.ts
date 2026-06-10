import { Request, Response, NextFunction } from 'express'
import { StagesService } from './stages.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { createStageSchema, updateStageSchema, reorderStagesSchema } from './stages.schema'
import { param } from '@/lib/utils/param'

export class StagesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const campaignId = req.query.campaignId as string | undefined
      const stages = await StagesService.list(req.universityId!, campaignId)
      return ApiResponse.success(res, stages)
    } catch (err) { next(err) }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const stage = await StagesService.getById(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, stage)
    } catch (err) { next(err) }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createStageSchema.parse(req.body)
      const stage = await StagesService.create(req.universityId!, data)
      return ApiResponse.created(res, stage)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateStageSchema.parse(req.body)
      const stage = await StagesService.update(param(req.params.id), req.universityId!, data)
      return ApiResponse.success(res, stage)
    } catch (err) { next(err) }
  }

  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { stages } = reorderStagesSchema.parse(req.body)
      await StagesService.reorder(req.universityId!, stages)
      return ApiResponse.success(res, null, 'Stages reordered')
    } catch (err) { next(err) }
  }

  static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const stage = await StagesService.toggle(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, stage)
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await StagesService.delete(param(req.params.id), req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }
}
