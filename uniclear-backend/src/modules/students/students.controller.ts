import { Request, Response, NextFunction } from 'express'
import { StudentsService } from './students.service'
import { ApiResponse } from '@/core/response/ApiResponse'
import { createStudentSchema, updateStudentSchema, listStudentsSchema } from './students.schema'
import { param } from '@/lib/utils/param'

export class StudentsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listStudentsSchema.parse(req.query)
      const { data, total } = await StudentsService.list(req.universityId!, query)
      return ApiResponse.paginated(res, data, total, query.page, query.limit)
    } catch (err) { next(err) }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.getById(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, student)
    } catch (err) { next(err) }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createStudentSchema.parse(req.body)
      const student = await StudentsService.create(req.universityId!, data)
      return ApiResponse.created(res, student)
    } catch (err) { next(err) }
  }

  static async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { bulkCreateStudentSchema } = await import('./students.schema')
      const data = bulkCreateStudentSchema.parse(req.body)
      const result = await StudentsService.bulkCreate(req.universityId!, data)
      return ApiResponse.success(res, result)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateStudentSchema.parse(req.body)
      const student = await StudentsService.update(param(req.params.id), req.universityId!, req.user!.sub, data)
      return ApiResponse.success(res, student)
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await StudentsService.delete(param(req.params.id), req.universityId!)
      return ApiResponse.noContent(res)
    } catch (err) { next(err) }
  }

  static async getClearanceProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await StudentsService.getClearanceProgress(param(req.params.id), req.universityId!)
      return ApiResponse.success(res, progress)
    } catch (err) { next(err) }
  }
}
