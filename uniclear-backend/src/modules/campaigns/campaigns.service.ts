import { CampaignsRepository } from './campaigns.repository'
import { NotFoundError } from '@/core/errors/AppError'

import { StudentsRepository } from '@/modules/students/students.repository'

export class CampaignsService {
  static async list(universityId: string) {
    return CampaignsRepository.findAll(universityId)
  }

  static async listActive(universityId: string, studentFilter?: { userId: string }) {
    if (studentFilter) {
      const student = await StudentsRepository.findByUserId(studentFilter.userId, universityId)
      if (student) {
        return CampaignsRepository.findActive(universityId, {
          facultyId: student.facultyId || undefined,
          departmentId: student.departmentId || undefined,
          level: student.level || undefined,
          identifiers: [student.jambRegNo, student.matricNo].filter(Boolean) as string[],
        })
      }
    }
    return CampaignsRepository.findActive(universityId)
  }

  static async getById(id: string, universityId: string) {
    const campaign = await CampaignsRepository.findById(id, universityId)
    if (!campaign) throw new NotFoundError('Campaign not found')
    return campaign
  }

  static async create(universityId: string, data: { name: string; description?: string; sessionId: string; eligibilityRules?: { facultyId?: string | null; departmentId?: string | null; level?: string | null }[]; whitelistEnabled?: boolean; whitelist?: string[]; issuesCertificate?: boolean; issuesClearanceSlip?: boolean; issuedDataFields?: string[] }) {
    const { eligibilityRules, ...rest } = data
    return CampaignsRepository.create({
      universityId,
      ...rest,
      eligibilityRules: {
        create: eligibilityRules || []
      }
    })
  }

  static async update(id: string, universityId: string, data: any) {
    await CampaignsService.getById(id, universityId)
    const { eligibilityRules, ...rest } = data
    const updateData: any = { ...rest }
    
    if (eligibilityRules) {
      updateData.eligibilityRules = {
        deleteMany: {},
        create: eligibilityRules
      }
    }
    
    return CampaignsRepository.update(id, updateData)
  }

  static async toggle(id: string, universityId: string) {
    const campaign = await CampaignsService.getById(id, universityId)
    return CampaignsRepository.toggle(id, !campaign.isActive)
  }

  static async delete(id: string, universityId: string) {
    await CampaignsService.getById(id, universityId)
    return CampaignsRepository.delete(id)
  }
}
