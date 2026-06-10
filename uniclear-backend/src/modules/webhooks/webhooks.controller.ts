import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@/core/response/ApiResponse'
import { StudentsService } from '@/modules/students/students.service'
import { bulkCreateStudentSchema } from '@/modules/students/students.schema'
import { z } from 'zod'

const syncPayloadSchema = z.object({
  students: bulkCreateStudentSchema
})

export class WebhookController {
  static async syncStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { students } = syncPayloadSchema.parse(req.body)
      const universityId = req.user!.universityId!
      
      const result = await StudentsService.bulkCreate(universityId, students)
      
      return ApiResponse.success(res, result, 'Students synchronized successfully')
    } catch (err) {
      next(err)
    }
  }
}
