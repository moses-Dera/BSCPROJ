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

  static async findByStage(stageId: string, universityId: string) {
    return db.stageDocumentRequirement.findMany({
      where: { stageId, universityId },
      include: { documentType: true },
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
    return db.stageDocumentRequirement.upsert({
      where: { stageId_documentTypeId: { stageId, documentTypeId } },
      create: { universityId, stageId, documentTypeId, isRequired },
      update: { isRequired },
    })
  }

  static async removeFromStage(documentTypeId: string, stageId: string) {
    return db.stageDocumentRequirement.delete({ where: { stageId_documentTypeId: { stageId, documentTypeId } } })
  }

  static async count(universityId: string) {
    return db.documentType.count({ where: { universityId } })
  }
}
