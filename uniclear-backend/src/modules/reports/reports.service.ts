import { db } from '@/lib/db'

export class ReportsService {
  static async summary(universityId: string) {
    const [totalStudents, totalClearances, completed, inProgress] = await Promise.all([
      db.student.count({ where: { universityId } }),
      db.clearanceRequest.count({ where: { universityId } }),
      db.clearanceRequest.count({ where: { universityId, status: 'COMPLETED' } }),
      db.clearanceRequest.count({ where: { universityId, status: 'IN_PROGRESS' } }),
    ])

    const completedRequests = await db.clearanceRequest.findMany({
      where: { universityId, status: 'COMPLETED', completedAt: { not: null } },
      select: { createdAt: true, completedAt: true }
    })
    
    let totalMs = 0
    completedRequests.forEach(req => {
      totalMs += req.completedAt!.getTime() - req.createdAt.getTime()
    })
    const avgMs = completedRequests.length ? totalMs / completedRequests.length : 0
    const avgDays = (avgMs / (1000 * 60 * 60 * 24)).toFixed(1)

    const deptClearances = await db.clearanceRequest.findMany({
      where: { universityId },
      select: { status: true, student: { select: { department: { select: { id: true, name: true } } } } }
    })

    const deptStats: Record<string, { name: string, total: number, completed: number }> = {}
    deptClearances.forEach(req => {
      const d = req.student?.department
      if (!d) return
      if (!deptStats[d.id]) deptStats[d.id] = { name: d.name, total: 0, completed: 0 }
      deptStats[d.id].total++
      if (req.status === 'COMPLETED') deptStats[d.id].completed++
    })

    const departmentRates = Object.values(deptStats)
      .map(d => ({
        name: d.name,
        total: d.total,
        completed: d.completed,
        rate: d.total > 0 ? parseFloat(((d.completed / d.total) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.rate - a.rate)

    return {
      totalStudents,
      totalClearances,
      completed,
      inProgress,
      completionRate: totalClearances > 0 ? ((completed / totalClearances) * 100).toFixed(1) : '0',
      avgProcessingDays: parseFloat(avgDays),
      departmentRates
    }
  }

  static async byStage(universityId: string) {
    const stages = await db.clearanceStage.findMany({
      where: { universityId },
      orderBy: { orderIndex: 'asc' },
    })

    // Single query per metric instead of 3 per stage (eliminates N+1)
    const [pendingCounts, approvedCounts, rejectedCounts] = await Promise.all([
      db.clearanceRequest.groupBy({
        by: ['currentStageId'],
        where: { universityId, currentStageId: { not: null } },
        _count: true,
      }),
      db.stageApproval.groupBy({
        by: ['stageId'],
        where: { universityId, status: 'APPROVED' },
        _count: true,
      }),
      db.stageApproval.groupBy({
        by: ['stageId'],
        where: { universityId, status: 'REJECTED' },
        _count: true,
      }),
    ])

    const pendingMap  = Object.fromEntries(pendingCounts.map(r  => [r.currentStageId, r._count]))
    const approvedMap = Object.fromEntries(approvedCounts.map(r => [r.stageId, r._count]))
    const rejectedMap = Object.fromEntries(rejectedCounts.map(r => [r.stageId, r._count]))

    return stages.map(stage => ({
      stage: { id: stage.id, name: stage.name, orderIndex: stage.orderIndex },
      pending:  pendingMap[stage.id]  ?? 0,
      approved: approvedMap[stage.id] ?? 0,
      rejected: rejectedMap[stage.id] ?? 0,
    }))
  }

  static async export(universityId: string, sessionId?: string) {
    const where: { universityId: string; sessionId?: string } = { universityId }
    if (sessionId) where.sessionId = sessionId

    return db.clearanceRequest.findMany({
      where,
      include: {
        student: { include: { faculty: true, department: true } },
        session: true,
        stageApprovals: { include: { stage: true }, orderBy: { decidedAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
