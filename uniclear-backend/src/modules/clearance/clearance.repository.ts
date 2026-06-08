import { db } from '@/lib/db'
import { ClearanceStatus, StageStatus } from '@prisma/client'

export class ClearanceRepository {
  static async findActive(studentId: string, universityId: string, sessionId: string) {
    return db.clearanceRequest.findFirst({
      where: { studentId, universityId, sessionId, status: { not: 'COMPLETED' } },
    })
  }

  static async findById(id: string, universityId: string) {
    return db.clearanceRequest.findFirst({
      where: { id, universityId },
      include: {
        student: true,
        session: true,
        stageApprovals: { include: { stage: true }, orderBy: { decidedAt: 'desc' } },
        documents: { include: { documentType: true } },
      },
    })
  }

  static async findByStudent(studentId: string, universityId: string) {
    return db.clearanceRequest.findFirst({
      where: { studentId, universityId },
      include: {
        session: true,
        stageApprovals: { include: { stage: true }, orderBy: { decidedAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async create(data: { studentId: string; universityId: string; sessionId: string; currentStageId: string }) {
    return db.clearanceRequest.create({ data })
  }

  static async updateStage(id: string, currentStageId: string | null, status: ClearanceStatus) {
    return db.clearanceRequest.update({ where: { id }, data: { currentStageId, status, completedAt: status === 'COMPLETED' ? new Date() : undefined } })
  }

  static async findOfficerQueue(universityId: string, stageId: string, opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const skip = (page - 1) * limit
    const where: any = {
      universityId,
      currentStageId: stageId,
      status: 'IN_PROGRESS',
      stageApprovals: { none: { stageId, status: { in: ['APPROVED', 'REJECTED'] as StageStatus[] }, decidedAt: { gte: new Date(Date.now() - 1000) } } },
    }
    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { matricNo: { contains: search, mode: 'insensitive' } },
        ],
      }
    }
    const [data, total] = await Promise.all([
      db.clearanceRequest.findMany({ where, skip, take: limit, include: { student: { include: { faculty: true, department: true } } }, orderBy: { updatedAt: 'asc' } }),
      db.clearanceRequest.count({ where }),
    ])
    return { data, total }
  }

  static async createStageApproval(data: { universityId: string; requestId: string; stageId: string; officerId: string; status: StageStatus; remarks?: string; ipAddress?: string }) {
    return db.stageApproval.create({ data })
  }

  static async getHistory(requestId: string, universityId: string) {
    return db.stageApproval.findMany({
      where: { requestId, universityId },
      include: { stage: true, officer: { select: { id: true, email: true } } },
      orderBy: { decidedAt: 'asc' },
    })
  }
}
