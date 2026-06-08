import { db } from '@/lib/db'
import { DocumentTypesRepository } from './document-types.repository'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'

export class DocumentTypesService {
  static async list(universityId: string) {
    return DocumentTypesRepository.findAll(universityId)
  }

  static async getById(id: string, universityId: string) {
    const docType = await DocumentTypesRepository.findById(id, universityId)
    if (!docType) throw new NotFoundError('Document type not found')
    return docType
  }

  static async create(universityId: string, data: { name: string; description?: string; isRequired: boolean; allowedFormats: string[]; maxFileSizeMB: number; order: number; stageId?: string }) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    const limit = TIER_LIMITS[tier].maxDocumentTypes
    const count = await DocumentTypesRepository.count(universityId)
    if (count >= limit) throw new TierLimitError(`Document type limit (${limit}) reached for your plan`)

    const { stageId, ...rest } = data
    const docType = await DocumentTypesRepository.create({ universityId, ...rest })

    if (stageId) {
      await DocumentTypesRepository.assignToStage(docType.id, stageId, universityId, data.isRequired)
    }

    return docType
  }

  static async update(id: string, universityId: string, data: { name?: string; description?: string; isRequired?: boolean; allowedFormats?: string[]; maxFileSizeMB?: number; order?: number }) {
    await DocumentTypesService.getById(id, universityId)
    return DocumentTypesRepository.update(id, data)
  }

  static async toggle(id: string, universityId: string) {
    const docType = await DocumentTypesService.getById(id, universityId)
    return DocumentTypesRepository.toggle(id, !docType.isActive)
  }

  static async delete(id: string, universityId: string) {
    await DocumentTypesService.getById(id, universityId)
    return DocumentTypesRepository.delete(id)
  }

  static async assignToStage(id: string, universityId: string, stageId: string, isRequired: boolean) {
    await DocumentTypesService.getById(id, universityId)
    return DocumentTypesRepository.assignToStage(id, stageId, universityId, isRequired)
  }

  static async removeFromStage(id: string, universityId: string, stageId: string) {
    await DocumentTypesService.getById(id, universityId)
    return DocumentTypesRepository.removeFromStage(id, stageId)
  }
}
