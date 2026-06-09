import { Request, Response, NextFunction } from 'express'
import { OfficersService } from './officers.service'
import { OfficersRepository } from './officers.repository'
import { ApiResponse } from '@/core/response/ApiResponse'
import { NotFoundError } from '@/core/errors/AppError'
import { createOfficerSchema, updateOfficerSchema, listOfficersSchema } from './officers.schema'
import { param } from '@/lib/utils/param'

export class OfficersController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const officer = await OfficersRepository.findByUserId(req.user!.sub)
      if (!officer) throw new NotFoundError('Officer profile not found')
      const full = await OfficersService.getById(officer.id, req.universityId!)
      return ApiResponse.success(res, full)
    } catch (err) { next(err) }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listOfficersSchema.parse(req.query)
      const { data, total } = await OfficersService.list(req.universityId!, query)
      return ApiResponse.paginated(res, data, total, query.page, query.limit)
    } catch (err) { next(err) }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const officer = await OfficersService.getById(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, officer)
    } catch (err) { next(err) }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createOfficerSchema.parse(req.body)
      const officer = await OfficersService.create(req.universityId!, data)
      return ApiResponse.created(res, officer)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateOfficerSchema.parse(req.body)
      const officer = await OfficersService.update(param(req.params.id), req.universityId!, data)
      return ApiResponse.success(res, officer)
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await OfficersService.delete(param(req.params.id), req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }
}
