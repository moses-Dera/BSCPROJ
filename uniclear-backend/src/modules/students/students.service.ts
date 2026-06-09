import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { StudentsRepository } from './students.repository'
import { CreateStudentDto, UpdateStudentDto } from './students.types'
import { ConflictError, NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'
import { AuthRepository } from '@/modules/auth/auth.repository'
import { logger } from '@/core/logger/logger'
import { sendInviteEmail } from '@/modules/notifications/channels/email.channel'
import { env } from '@/core/config/env'

export class StudentsService {
  static async list(universityId: string, opts: { page: number; limit: number; search?: string; facultyId?: string; departmentId?: string }) {
    return StudentsRepository.findAll(universityId, opts)
  }

  static async getById(id: string, universityId: string) {
    const student = await StudentsRepository.findById(id, universityId)
    if (!student) throw new NotFoundError('Student not found')
    return student
  }

  static async create(universityId: string, data: CreateStudentDto) {
    // Check tier limit
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    const limit = TIER_LIMITS[tier].maxStudents
    const count = await StudentsRepository.count(universityId)
    if (count >= limit) throw new TierLimitError(`Student limit (${limit}) reached for your plan`)

    const existing = await StudentsRepository.findByMatricNo(data.matricNo, universityId)
    if (existing) throw new ConflictError('Matric number already exists')

    const existingUser = await db.user.findUnique({ where: { email: data.email } })
    if (existingUser) throw new ConflictError('Email already in use')

    const tempHash = await bcrypt.hash(Math.random().toString(36), 12)
    const user = await db.user.create({
      data: { email: data.email, passwordHash: tempHash, role: 'STUDENT', universityId },
    })

    const token = crypto.randomBytes(32).toString('hex')
    await AuthRepository.saveInviteToken(user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

    const tempPassword = crypto.randomBytes(4).toString('hex')
    const inviteLink = `${env.APP_URL}/set-password?token=${token}`

    await sendInviteEmail({
      to: data.email,
      name: `${data.firstName} ${data.lastName}`,
      role: 'Student',
      inviteLink,
      tempPassword,
    })

    logger.info({ email: data.email, inviteLink }, 'Student invite created')
    const student = await StudentsRepository.create(universityId, user.id, data)
    return { ...student, inviteLink, tempPassword }
  }

  static async update(id: string, universityId: string, data: UpdateStudentDto) {
    await StudentsService.getById(id, universityId)
    return StudentsRepository.update(id, universityId, data)
  }

  static async delete(id: string, universityId: string) {
    await StudentsService.getById(id, universityId)
    return StudentsRepository.delete(id, universityId)
  }

  static async getClearanceProgress(id: string, universityId: string) {
    const student = await StudentsService.getById(id, universityId)
    return db.clearanceRequest.findFirst({
      where: { studentId: student.id, universityId },
      include: { stageApprovals: { include: { stage: true } }, session: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}
