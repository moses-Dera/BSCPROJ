import { db } from '@/lib/db'
import { StagesRepository } from './stages.repository'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'

export class StagesService {
  static async list(universityId: string, campaignId?: string) {
    return StagesRepository.findAll(universityId, campaignId)
  }

  static async getById(id: string, universityId: string) {
    const stage = await StagesRepository.findById(id, universityId)
    if (!stage) throw new NotFoundError('Stage not found')
    return stage
  }

  static async create(universityId: string, data: { campaignId: string; name: string; description?: string; orderIndex?: number; scope?: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT' }) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    const limit = TIER_LIMITS[tier].maxStages
    const count = await StagesRepository.count(universityId, data.campaignId)
    if (count >= limit) throw new TierLimitError(`Stage limit (${limit}) reached for this campaign on your plan`)
    
    let orderIndex = data.orderIndex
    if (!orderIndex) {
      const maxStage = await db.clearanceStage.findFirst({
        where: { universityId, campaignId: data.campaignId },
        orderBy: { orderIndex: 'desc' }
      })
      orderIndex = maxStage ? maxStage.orderIndex + 1 : 1
    }
    
    return StagesRepository.create({ universityId, ...data, orderIndex })
  }

  static async update(id: string, universityId: string, data: { name?: string; description?: string; scope?: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT'; isActive?: boolean }) {
    await StagesService.getById(id, universityId)
    return StagesRepository.update(id, data)
  }

  static async reorder(universityId: string, stages: { id: string; orderIndex: number }[]) {
    return StagesRepository.reorder(stages)
  }

  static async toggle(id: string, universityId: string) {
    const stage = await StagesService.getById(id, universityId)
    return StagesRepository.toggle(id, !stage.isActive)
  }

  static async delete(id: string, universityId: string) {
    await StagesService.getById(id, universityId)
    return StagesRepository.delete(id)
  }
}
