import { Request, Response, NextFunction } from 'express'
import { DocumentsService } from './document.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { ValidationError } from '@/core/errors/AppError'
import { param } from '@/lib/utils/param'

export class DocumentsController {
  static async getByRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await DocumentsService.getByRequest(param(req.params.requestId), req.universityId!)
      return ApiResponse.success(res, docs)
    } catch (err) { next(err) }
  }

  static async getByStage(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await DocumentsService.getByStage(param(req.params.requestId), param(req.params.stageId), req.universityId!)
      return ApiResponse.success(res, docs)
    } catch (err) { next(err) }
  }

  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('No file uploaded')
      const { requestId, documentTypeId } = req.body
      const doc = await DocumentsService.upload(req.universityId!, req.user!.sub, requestId, documentTypeId, req.file)
      return ApiResponse.created(res, doc)
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentsService.delete(param(req.params.id), req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }

  static async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const url = await DocumentsService.getSignedUrl(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, { url })
    } catch (err) { next(err) }
  }
}
