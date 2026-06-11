import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { CampaignsService } from './campaigns.service'
import { ApiResponse } from '@/core/response/ApiResponse'

const createSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  eligibilityRules: z.array(z.object({
    facultyId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    level: z.string().optional().nullable()
  })).optional(),
  whitelistEnabled: z.boolean().optional(),
  whitelist: z.array(z.string()).optional(),
  issuesCertificate: z.boolean().optional(),
  issuesClearanceSlip: z.boolean().optional(),
  issuedDataFields: z.array(z.string()).optional(),
  sessionId: z.string().uuid()
})

const updateSchema = createSchema.partial()

export class CampaignsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const campaigns = await CampaignsService.list(req.universityId!)
      return ApiResponse.success(res, campaigns)
    } catch (err) { next(err) }
  }

  static async listActive(req: Request, res: Response, next: NextFunction) {
    try {
      let studentFilter = undefined
      if (req.user?.role === 'STUDENT') {
        studentFilter = { userId: req.user.sub }
      }
      const campaigns = await CampaignsService.listActive(req.universityId!, studentFilter)
      return ApiResponse.success(res, campaigns)
    } catch (err) { next(err) }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body)
      const campaign = await CampaignsService.create(req.universityId!, data as any)
      return ApiResponse.created(res, campaign)
    } catch (err) { next(err) }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body)
      const campaign = await CampaignsService.update(req.params.id, req.universityId!, data)
      return ApiResponse.success(res, campaign)
    } catch (err) { next(err) }
  }

  static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await CampaignsService.toggle(req.params.id, req.universityId!)
      return ApiResponse.success(res, campaign, 'Campaign status toggled')
    } catch (err) { next(err) }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CampaignsService.delete(req.params.id, req.universityId!)
      return ApiResponse.success(res, null, 'Campaign deleted')
    } catch (err) { next(err) }
  }
}
