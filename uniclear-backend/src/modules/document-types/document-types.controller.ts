import { Request, Response, NextFunction } from 'express'
import { DocumentTypesService } from './document-types.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { createDocTypeSchema, updateDocTypeSchema, assignStageSchema } from './document-types.schema'
import { param } from '@/lib/utils/param'

export class DocumentTypesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await DocumentTypesService.list(req.universityId!)
      return ApiResponse.success(res, types)
    } catch (err) { next(err) }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await DocumentTypesService.getById(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, type)
    } catch (err) { next(err) }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDocTypeSchema.parse(req.body)
      const type = await DocumentTypesService.create(req.universityId!, data)
      return ApiResponse.created(res, type)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateDocTypeSchema.parse(req.body)
      const type = await DocumentTypesService.update(param(req.params.id), req.universityId!, data)
      return ApiResponse.success(res, type)
    } catch (err) { next(err) }
  }

  static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await DocumentTypesService.toggle(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, type)
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentTypesService.delete(param(req.params.id), req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }

  static async assignToStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { stageId, isRequired } = assignStageSchema.parse(req.body)
      const result = await DocumentTypesService.assignToStage(param(req.params.id), req.universityId!, stageId, isRequired)
      return ApiResponse.success(res, result)
    } catch (err) { next(err) }
  }

  static async removeFromStage(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentTypesService.removeFromStage(param(req.params.id), req.universityId!, param(req.params.stageId))
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }
}
