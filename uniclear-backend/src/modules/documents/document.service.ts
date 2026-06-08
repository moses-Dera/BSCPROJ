import path from 'path'
import { DocumentsRepository } from './document.repository'
import { storage } from './storage'
import { eventBus } from '@/core/events/EventBus'
import { NotFoundError, ValidationError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

export class DocumentsService {
  static async getByRequest(requestId: string, universityId: string) {
    return DocumentsRepository.findByRequest(requestId, universityId)
  }

  static async getByStage(requestId: string, stageId: string, universityId: string) {
    return DocumentsRepository.findByStage(requestId, stageId, universityId)
  }

  static async upload(universityId: string, studentId: string, requestId: string, documentTypeId: string, file: Express.Multer.File) {
    const docType = await db.documentType.findFirst({ where: { id: documentTypeId, universityId } })
    if (!docType) throw new NotFoundError('Document type not found')

    // Sanitize originalname — strip directory components, keep only bare filename
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')
    const ext = path.extname(safeName).replace('.', '').toLowerCase()

    if (!ext || !docType.allowedFormats.includes(ext)) {
      throw new ValidationError(`Invalid format. Allowed: ${docType.allowedFormats.join(', ')}`)
    }

    // Validate MIME type matches extension
    const allowedMimes: Record<string, string[]> = {
      pdf:  ['application/pdf'],
      jpg:  ['image/jpeg'],
      jpeg: ['image/jpeg'],
      png:  ['image/png'],
    }
    if (allowedMimes[ext] && !allowedMimes[ext].includes(file.mimetype)) {
      throw new ValidationError('File MIME type does not match extension')
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > docType.maxFileSizeMB) {
      throw new ValidationError(`File too large. Max: ${docType.maxFileSizeMB}MB`)
    }

    // Remove existing upload for same doc type in same request
    const existing = await DocumentsRepository.findExisting(requestId, documentTypeId)
    if (existing) {
      await storage.delete(existing.fileKey)
      await DocumentsRepository.delete(existing.id)
    }

    // filePath uses UUID-based key — safeName is only stored for display
    const filePath = `${universityId}/${studentId}/${Date.now()}-${safeName}`
    const { url, key } = await storage.upload(file.buffer, filePath, file.mimetype)

    const document = await DocumentsRepository.create({
      universityId, studentId, requestId, documentTypeId,
      fileName: safeName, fileUrl: url, fileKey: key,
      fileSizeMB, mimeType: file.mimetype,
    })

    eventBus.emit('document.uploaded', { documentId: document.id, studentId, universityId })
    return document
  }

  static async delete(id: string, universityId: string) {
    const doc = await DocumentsRepository.findById(id, universityId)
    if (!doc) throw new NotFoundError('Document not found')
    await storage.delete(doc.fileKey)
    return DocumentsRepository.delete(id)
  }

  static async getSignedUrl(id: string, universityId: string) {
    const doc = await DocumentsRepository.findById(id, universityId)
    if (!doc) throw new NotFoundError('Document not found')
    return storage.getSignedUrl(doc.fileKey)
  }
}
