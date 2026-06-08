import { UniversitiesRepository } from './universities.repository'
import { ConflictError, NotFoundError } from '@/core/errors/AppError'

export class UniversitiesService {
  static async list(page: number, limit: number, search?: string) {
    return UniversitiesRepository.findAll(page, limit, search)
  }

  static async getById(id: string) {
    const uni = await UniversitiesRepository.findById(id)
    if (!uni) throw new NotFoundError('University not found')
    return uni
  }

  static async create(data: { name: string; slug: string; abbreviation: string; address: string; contactEmail: string; website?: string; primaryColor: string; accentColor: string; tier: 'TRIAL' | 'STANDARD' | 'ENTERPRISE' }) {
    const existing = await UniversitiesRepository.findBySlug(data.slug)
    if (existing) throw new ConflictError('Slug already in use')

    const { tier, ...rest } = data
    const university = await UniversitiesRepository.create(rest)
    await UniversitiesRepository.upsertContract(university.id, { tier })
    return university
  }

  static async update(id: string, data: { name?: string; abbreviation?: string; address?: string; contactEmail?: string; website?: string; primaryColor?: string; accentColor?: string }) {
    await UniversitiesService.getById(id)
    return UniversitiesRepository.update(id, data)
  }

  static async suspend(id: string) {
    await UniversitiesService.getById(id)
    return UniversitiesRepository.suspend(id)
  }

  static async restore(id: string) {
    await UniversitiesService.getById(id)
    return UniversitiesRepository.restore(id)
  }

  static async delete(id: string) {
    await UniversitiesService.getById(id)
    return UniversitiesRepository.delete(id)
  }

  static async updateContract(id: string, data: { tier: any; contractRef?: string; expiresAt?: Date; notes?: string }) {
    await UniversitiesService.getById(id)
    return UniversitiesRepository.upsertContract(id, data)
  }
}
