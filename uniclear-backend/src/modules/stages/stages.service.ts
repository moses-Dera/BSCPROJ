import { db } from '@/lib/db'
import { StagesRepository } from './stages.repository'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'

export class StagesService {
  static async list(universityId: string) {
    return StagesRepository.findAll(universityId)
  }

  static async getById(id: string, universityId: string) {
    const stage = await StagesRepository.findById(id, universityId)
    if (!stage) throw new NotFoundError('Stage not found')
    return stage
  }

  static async create(universityId: string, data: { name: string; description?: string; orderIndex: number; scope?: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT' }) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    const limit = TIER_LIMITS[tier].maxStages
    const count = await StagesRepository.count(universityId)
    if (count >= limit) throw new TierLimitError(`Stage limit (${limit}) reached for your plan`)
    return StagesRepository.create({ universityId, ...data })
  }

  static async update(id: string, universityId: string, data: { name?: string; description?: string; scope?: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT' }) {
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
