import { eventBus } from './EventBus'
import { AuditService } from '@/modules/audit/audit.service'
import { NotificationsService } from '@/modules/notifications/notification.service'
import { db } from '@/lib/db'

export function registerListeners() {
  // ── Clearance started ──────────────────────────────────────────
  eventBus.on('clearance.started', async ({ clearanceId, studentId, universityId }) => {
    await AuditService.log({ universityId, actorId: studentId, action: 'CLEARANCE_STARTED', targetId: clearanceId, targetType: 'ClearanceRequest' })
  })

  // ── Stage submitted ────────────────────────────────────────────
  eventBus.on('stage.submitted', async ({ requestId, stageId, studentId, universityId }) => {
    await AuditService.log({ universityId, actorId: studentId, action: 'STAGE_SUBMITTED', targetId: requestId, targetType: 'ClearanceRequest', metadata: { stageId } })

    // Notify officer
    const stage = await db.clearanceStage.findUnique({ where: { id: stageId }, include: { officers: { include: { user: true } } } })
    if (stage?.officers) {
      await Promise.all(
        stage.officers.map(officer =>
          NotificationsService.send(universityId, officer.userId, 'DOCUMENT_UPLOADED', 'New submission', `A student has submitted documents for ${stage.name}`)
        )
      )
    }
  })

  // ── Stage approved ─────────────────────────────────────────────
  eventBus.on('stage.approved', async ({ requestId, stageId, officerId, universityId, studentId }) => {
    await AuditService.log({ universityId, actorId: officerId, action: 'STAGE_APPROVED', targetId: requestId, targetType: 'ClearanceRequest', metadata: { stageId } })

    const stage = await db.clearanceStage.findUnique({ where: { id: stageId } })

    await NotificationsService.send(
      universityId, studentId, 'STAGE_APPROVED',
      `${stage?.name} Approved!`,
      `Your ${stage?.name} stage has been approved. Proceed to the next stage.`
    )
  })

  // ── Stage rejected ─────────────────────────────────────────────
  eventBus.on('stage.rejected', async ({ requestId, stageId, officerId, remarks, universityId, studentId }) => {
    await AuditService.log({ universityId, actorId: officerId, action: 'STAGE_REJECTED', targetId: requestId, targetType: 'ClearanceRequest', metadata: { stageId, remarks } })

    const stage = await db.clearanceStage.findUnique({ where: { id: stageId } })

    await NotificationsService.send(
      universityId, studentId, 'STAGE_REJECTED',
      `${stage?.name} Rejected`,
      `Your ${stage?.name} stage was rejected. Reason: ${remarks}`,
      { remarks }
    )
  })

  // ── Clearance complete ─────────────────────────────────────────
  eventBus.on('clearance.complete', async ({ requestId, studentId, universityId }) => {
    await AuditService.log({ universityId, actorId: studentId, action: 'CLEARANCE_COMPLETED', targetId: requestId, targetType: 'ClearanceRequest' })

    await NotificationsService.send(
      universityId, studentId, 'CLEARANCE_COMPLETE',
      '🎉 Clearance Complete!',
      'Congratulations! All your clearance stages have been approved. Your certificate is ready for download.'
    )
  })

  // ── Document uploaded ──────────────────────────────────────────
  eventBus.on('document.uploaded', async ({ documentId, studentId, universityId }) => {
    await AuditService.log({ universityId, actorId: studentId, action: 'DOCUMENT_UPLOADED', targetId: documentId, targetType: 'Document' })
  })
}
