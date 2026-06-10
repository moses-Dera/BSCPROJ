import { db } from '@/lib/db'

export class DocumentTypesRepository {
  static async findAll(universityId: string) {
    return db.documentType.findMany({
      where: { universityId },
      include: { stageRequirements: { include: { stage: true } } },
      orderBy: { order: 'asc' },
    })
  }

  static async findById(id: string, universityId: string) {
    return db.documentType.findFirst({
      where: { id, universityId },
      include: { stageRequirements: { include: { stage: true } } },
    })
  }

  static async findByStage(stageId: string, universityId: string, context?: { facultyId?: string; departmentId?: string; sessionId?: string; level?: string }) {
    const reqs = await db.stageDocumentRequirement.findMany({
      where: { stageId, universityId },
      include: { documentType: true },
    })
    if (!context) return reqs
    // Return requirements that match the student context or are universal (null = applies to all)
    return reqs.filter(r => {
      if (r.facultyId    && r.facultyId    !== context.facultyId)    return false
      if (r.departmentId && r.departmentId !== context.departmentId) return false
      if (r.sessionId    && r.sessionId    !== context.sessionId)    return false
      if (r.level        && r.level        !== context.level)        return false
      return true
    })
  }

  static async create(data: { universityId: string; name: string; description?: string; isRequired: boolean; allowedFormats: string[]; maxFileSizeMB: number; order: number }) {
    return db.documentType.create({ data })
  }

  static async update(id: string, data: { name?: string; description?: string; isRequired?: boolean; allowedFormats?: string[]; maxFileSizeMB?: number; order?: number }) {
    return db.documentType.update({ where: { id }, data })
  }

  static async toggle(id: string, isActive: boolean) {
    return db.documentType.update({ where: { id }, data: { isActive } })
  }

  static async delete(id: string) {
    return db.documentType.delete({ where: { id } })
  }

  static async assignToStage(documentTypeId: string, stageId: string, universityId: string, isRequired: boolean) {
    await db.stageDocumentRequirement.deleteMany({ where: { stageId, documentTypeId } })
    return db.stageDocumentRequirement.create({
      data: { universityId, stageId, documentTypeId, isRequired },
    })
  }

  static async removeFromStage(documentTypeId: string, stageId: string) {
    return db.stageDocumentRequirement.deleteMany({ where: { stageId, documentTypeId } })
  }

  static async count(universityId: string) {
    return db.documentType.count({ where: { universityId } })
  }
}
