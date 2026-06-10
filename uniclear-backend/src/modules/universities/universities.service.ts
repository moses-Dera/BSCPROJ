import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { UniversitiesRepository } from './universities.repository'
import { ConflictError, NotFoundError } from '@/core/errors/AppError'
import { AuthRepository } from '@/modules/auth/auth.repository'
import { logger } from '@/core/logger/logger'
import { sendInviteEmail } from '@/modules/notifications/channels/email.channel'
import { env } from '@/core/config/env'

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

    // Create super admin user for this university
    const tempHash = await bcrypt.hash(Math.random().toString(36), 12)
    const adminUser = await db.user.create({
      data: { email: data.contactEmail, passwordHash: tempHash, role: 'SUPER_ADMIN', universityId: university.id },
    })

    const token = crypto.randomBytes(32).toString('hex')
    await AuthRepository.saveInviteToken(adminUser.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

    const tempPassword = crypto.randomBytes(4).toString('hex')  // 8-char readable temp password
    const inviteLink = `${env.APP_URL}/set-password?token=${token}`

    await sendInviteEmail({
      to: data.contactEmail,
      name: data.name,
      role: 'Super Admin',
      inviteLink,
      tempPassword,
    })

    logger.info({ email: data.contactEmail, inviteLink }, 'University super admin invite created')
    return { ...university, adminInviteLink: inviteLink, tempPassword }
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

  static async getApiKey(id: string) {
    const uni = await UniversitiesService.getById(id)
    return { apiKey: uni.webhookSecret }
  }

  static async generateApiKey(id: string) {
    await UniversitiesService.getById(id)
    const newKey = `uc_live_${crypto.randomBytes(32).toString('hex')}`
    await db.university.update({ where: { id }, data: { webhookSecret: newKey } })
    return { apiKey: newKey }
  }

  static async getPlatformStats() {
    const [totalStudents, totalClearances, totalOfficers] = await Promise.all([
      db.student.count(),
      db.clearanceRequest.count(),
      db.officer.count(),
    ])
    return { totalStudents, totalClearances, totalOfficers }
  }
}
