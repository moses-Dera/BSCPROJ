import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { OfficersRepository } from './officers.repository'
import { ConflictError, NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'

export class OfficersService {
  static async list(universityId: string, opts: { page: number; limit: number; stageId?: string }) {
    return OfficersRepository.findAll(universityId, opts)
  }

  static async getById(id: string, universityId: string) {
    const officer = await OfficersRepository.findById(id, universityId)
    if (!officer) throw new NotFoundError('Officer not found')
    return officer
  }

  static async create(universityId: string, data: { email: string; firstName: string; lastName: string; stageId?: string }) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    const limit = TIER_LIMITS[tier].maxOfficers
    const count = await OfficersRepository.count(universityId)
    if (count >= limit) throw new TierLimitError(`Officer limit (${limit}) reached for your plan`)

    const existing = await db.user.findUnique({ where: { email: data.email } })
    if (existing) throw new ConflictError('Email already in use')

    const tempHash = await bcrypt.hash(Math.random().toString(36), 12)
    const user = await db.user.create({
      data: { email: data.email, passwordHash: tempHash, role: 'OFFICER', universityId },
    })

    return OfficersRepository.create(universityId, user.id, { firstName: data.firstName, lastName: data.lastName, stageId: data.stageId })
  }

  static async update(id: string, universityId: string, data: { firstName?: string; lastName?: string; stageId?: string | null }) {
    await OfficersService.getById(id, universityId)
    return OfficersRepository.update(id, data)
  }

  static async delete(id: string, universityId: string) {
    await OfficersService.getById(id, universityId)
    return OfficersRepository.delete(id)
  }
}
