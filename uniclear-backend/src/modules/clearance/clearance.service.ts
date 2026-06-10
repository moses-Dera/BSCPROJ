import { ClearanceRepository } from './clearance.repository'
import { StagesRepository } from '@/modules/stages/stages.repository'
import { DocumentTypesRepository } from '@/modules/document-types/document-types.repository'
import { DocumentsRepository } from '@/modules/documents/document.repository'
import { OfficersRepository } from '@/modules/officers/officers.repository'
import { StudentsRepository } from '@/modules/students/students.repository'
import { eventBus } from '@/core/events/EventBus'
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

export class ClearanceService {
  static async start(userId: string, universityId: string, sessionId: string, campaignId: string) {
    const student = await StudentsRepository.findByUserId(userId, universityId)
    if (!student) throw new NotFoundError('Student profile not found')

    const existing = await ClearanceRepository.findActive(student.id, universityId, sessionId, campaignId)
    if (existing) throw new ConflictError('Clearance already in progress for this campaign')

    const firstStage = await StagesRepository.findFirst(campaignId)
    if (!firstStage) throw new NotFoundError('No clearance stages configured for this campaign')

    const session = await db.academicSession.findFirst({ where: { id: sessionId, universityId } })
    if (!session) throw new NotFoundError('Academic session not found')

    const clearance = await ClearanceRepository.create({ studentId: student.id, universityId, campaignId, sessionId, currentStageId: firstStage.id })
    await ClearanceRepository.updateStage(clearance.id, firstStage.id, 'IN_PROGRESS')

    eventBus.emit('clearance.started', { clearanceId: clearance.id, studentId: student.id, universityId })
    return clearance
  }

  static async getByStudentId(studentId: string, universityId: string) {
    const clearances = await ClearanceRepository.findByStudent(studentId, universityId)
    return clearances
  }

  static async getStatus(userId: string, universityId: string) {
    const student = await StudentsRepository.findByUserId(userId, universityId)
    if (!student) throw new NotFoundError('Student profile not found')
    return ClearanceRepository.findByStudent(student.id, universityId)
  }

  static async submit(requestId: string, userId: string, universityId: string) {
    const clearance = await ClearanceRepository.findById(requestId, universityId)
    if (!clearance) throw new NotFoundError('Clearance request not found')
    if (clearance.student.userId !== userId) throw new ForbiddenError()
    if (!clearance.currentStageId) throw new ValidationError('No active stage to submit')

    // Ensure all required docs for this stage are uploaded
    const student      = await db.student.findUnique({ where: { id: clearance.studentId } })
    const requirements = await DocumentTypesRepository.findByStage(clearance.currentStageId, universityId, {
      facultyId:    student?.facultyId    ?? undefined,
      departmentId: student?.departmentId ?? undefined,
      sessionId:    clearance.sessionId,
      level:        student?.level        ?? undefined,
    })
    const required = requirements.filter(r => r.isRequired)
    const uploaded = await DocumentsRepository.findByStage(requestId, clearance.currentStageId, universityId)
    const uploadedTypeIds = uploaded.map(d => d.documentTypeId)
    const missing = required.filter(r => !uploadedTypeIds.includes(r.documentTypeId))

    if (missing.length > 0) {
      throw new ValidationError(`Missing required documents: ${missing.map(m => m.documentType.name).join(', ')}`)
    }

    await ClearanceRepository.updateStageStatus(requestId, 'SUBMITTED')

    eventBus.emit('stage.submitted', { requestId, stageId: clearance.currentStageId, studentId: clearance.studentId, universityId })
    return clearance
  }

  static async approve(requestId: string, officerUserId: string, universityId: string, remarks?: string, attachmentUrl?: string, attachmentKey?: string, ipAddress?: string) {
    const clearance = await ClearanceRepository.findById(requestId, universityId)
    if (!clearance) throw new NotFoundError('Clearance request not found')
    if (!clearance.currentStageId) throw new ValidationError('No active stage')

    const officer = await OfficersRepository.findByUserId(officerUserId)
    if (!officer || !officer.stageAssignments.some(a => a.stageId === clearance.currentStageId)) {
      throw new ForbiddenError('You are not assigned to this stage')
    }

    await ClearanceRepository.createStageApproval({
      universityId, requestId, stageId: clearance.currentStageId,
      officerId: officerUserId, status: 'APPROVED', remarks, attachmentUrl, attachmentKey, ipAddress,
    })

    const currentStage = await db.clearanceStage.findUnique({ where: { id: clearance.currentStageId } })
    const nextStage = await StagesRepository.findNext(clearance.campaignId, currentStage!.orderIndex)

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
    if (!officer || !officer.stageAssignments.some(a => a.stageId === clearance.currentStageId)) {
      throw new ForbiddenError('You are not assigned to this stage')
    }

    await ClearanceRepository.createStageApproval({
      universityId, requestId, stageId: clearance.currentStageId,
      officerId: officerUserId, status: 'REJECTED', remarks, ipAddress,
    })

    await ClearanceRepository.updateStageStatus(requestId, 'REJECTED')

    eventBus.emit('stage.rejected', { requestId, stageId: clearance.currentStageId, officerId: officerUserId, remarks, universityId, studentId: clearance.studentId })
    return clearance
  }

  static async getQueue(officerUserId: string, universityId: string, opts: { page: number; limit: number; search?: string }) {
    const officer = await OfficersRepository.findByUserId(officerUserId)
    if (!officer?.stageAssignments?.length) throw new ForbiddenError('You are not assigned to any stage')

    // Find the active assignment for this officer
    const assignment = officer.stageAssignments[0]
    const stageId    = assignment.stageId
    const facultyId  = assignment.facultyId ?? undefined
    const departmentId = assignment.departmentId ?? undefined

    return ClearanceRepository.findOfficerQueue(universityId, stageId, facultyId, departmentId, opts)
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
