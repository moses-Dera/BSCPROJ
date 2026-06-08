import { ClearanceRepository } from './clearance.repository'
import { StagesRepository } from '@/modules/stages/stages.repository'
import { DocumentTypesRepository } from '@/modules/document-types/document-types.repository'
import { DocumentsRepository } from '@/modules/documents/document.repository'
import { OfficersRepository } from '@/modules/officers/officers.repository'
import { eventBus } from '@/core/events/EventBus'
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

export class ClearanceService {
  static async start(studentId: string, universityId: string, sessionId: string) {
    const existing = await ClearanceRepository.findActive(studentId, universityId, sessionId)
    if (existing) throw new ConflictError('Clearance already in progress for this session')

    const firstStage = await StagesRepository.findFirst(universityId)
    if (!firstStage) throw new NotFoundError('No clearance stages configured for this university')

    const session = await db.academicSession.findFirst({ where: { id: sessionId, universityId } })
    if (!session) throw new NotFoundError('Academic session not found')

    const clearance = await ClearanceRepository.create({ studentId, universityId, sessionId, currentStageId: firstStage.id })
    await ClearanceRepository.updateStage(clearance.id, firstStage.id, 'IN_PROGRESS')

    eventBus.emit('clearance.started', { clearanceId: clearance.id, studentId, universityId })
    return clearance
  }

  static async getStatus(studentId: string, universityId: string) {
    return ClearanceRepository.findByStudent(studentId, universityId)
  }

  static async submit(requestId: string, studentId: string, universityId: string) {
    const clearance = await ClearanceRepository.findById(requestId, universityId)
    if (!clearance) throw new NotFoundError('Clearance request not found')
    if (clearance.student.userId !== studentId) throw new ForbiddenError()
    if (!clearance.currentStageId) throw new ValidationError('No active stage to submit')

    // Ensure all required docs for this stage are uploaded
    const requirements = await DocumentTypesRepository.findByStage(clearance.currentStageId, universityId)
    const required = requirements.filter(r => r.isRequired)
    const uploaded = await DocumentsRepository.findByStage(requestId, clearance.currentStageId, universityId)
    const uploadedTypeIds = uploaded.map(d => d.documentTypeId)
    const missing = required.filter(r => !uploadedTypeIds.includes(r.documentTypeId))

    if (missing.length > 0) {
      throw new ValidationError(`Missing required documents: ${missing.map(m => m.documentType.name).join(', ')}`)
    }

    eventBus.emit('stage.submitted', { requestId, stageId: clearance.currentStageId, studentId, universityId })
    return clearance
  }

  static async approve(requestId: string, officerUserId: string, universityId: string, remarks?: string, ipAddress?: string) {
    const clearance = await ClearanceRepository.findById(requestId, universityId)
    if (!clearance) throw new NotFoundError('Clearance request not found')
    if (!clearance.currentStageId) throw new ValidationError('No active stage')

    const officer = await OfficersRepository.findByUserId(officerUserId)
    if (!officer || officer.stageId !== clearance.currentStageId) throw new ForbiddenError('You are not assigned to this stage')

    await ClearanceRepository.createStageApproval({
      universityId, requestId, stageId: clearance.currentStageId,
      officerId: officerUserId, status: 'APPROVED', remarks, ipAddress,
    })

    const currentStage = await db.clearanceStage.findUnique({ where: { id: clearance.currentStageId } })
    const nextStage = await StagesRepository.findNext(universityId, currentStage!.orderIndex)

    if (nextStage) {
      await ClearanceRepository.updateStage(clearance.id, nextStage.id, 'IN_PROGRESS')
    } else {
      await ClearanceRepository.updateStage(clearance.id, null, 'COMPLETED')
      eventBus.emit('clearance.complete', { requestId, studentId: clearance.studentId, universityId })
    }

    eventBus.emit('stage.approved', { requestId, stageId: clearance.currentStageId, officerId: officerUserId, universityId, studentId: clearance.studentId })
    return clearance
  }

  static async reject(requestId: string, officerUserId: string, universityId: string, remarks: string, ipAddress?: string) {
    const clearance = await ClearanceRepository.findById(requestId, universityId)
    if (!clearance) throw new NotFoundError('Clearance request not found')
    if (!clearance.currentStageId) throw new ValidationError('No active stage')

    const officer = await OfficersRepository.findByUserId(officerUserId)
    if (!officer || officer.stageId !== clearance.currentStageId) throw new ForbiddenError('You are not assigned to this stage')

    await ClearanceRepository.createStageApproval({
      universityId, requestId, stageId: clearance.currentStageId,
      officerId: officerUserId, status: 'REJECTED', remarks, ipAddress,
    })

    eventBus.emit('stage.rejected', { requestId, stageId: clearance.currentStageId, officerId: officerUserId, remarks, universityId, studentId: clearance.studentId })
    return clearance
  }

  static async getQueue(officerUserId: string, universityId: string, opts: { page: number; limit: number; search?: string }) {
    const officer = await OfficersRepository.findByUserId(officerUserId)
    if (!officer?.stageId) throw new ForbiddenError('You are not assigned to any stage')
    return ClearanceRepository.findOfficerQueue(universityId, officer.stageId, opts)
  }

  static async getHistory(requestId: string, universityId: string) {
    return ClearanceRepository.getHistory(requestId, universityId)
  }

  static async getCertificate(requestId: string, universityId: string) {
    const clearance = await ClearanceRepository.findById(requestId, universityId)
    if (!clearance) throw new NotFoundError('Clearance request not found')
    if (clearance.status !== 'COMPLETED') throw new ValidationError('Clearance not yet completed')
    return clearance
  }
}
