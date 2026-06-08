import { DocumentTypesService } from './document-types.service'
import { DocumentTypesRepository } from './document-types.repository'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

jest.mock('./document-types.repository')
jest.mock('@/lib/db', () => ({ db: { contractPlan: { findUnique: jest.fn() } } }))

const mockDocType = {
  id: 'doctype-id', universityId: 'uni-id', name: 'JAMB Letter',
  isRequired: true, allowedFormats: ['pdf'], maxFileSizeMB: 5,
  order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
}

describe('DocumentTypesService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getById', () => {
    it('should return document type when found', async () => {
      jest.spyOn(DocumentTypesRepository, 'findById').mockResolvedValue(mockDocType as any)
      const result = await DocumentTypesService.getById('doctype-id', 'uni-id')
      expect(result.name).toBe('JAMB Letter')
    })

    it('should throw NotFoundError when not found', async () => {
      jest.spyOn(DocumentTypesRepository, 'findById').mockResolvedValue(null)
      await expect(DocumentTypesService.getById('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should throw TierLimitError when doc type limit reached on TRIAL', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'TRIAL' })
      jest.spyOn(DocumentTypesRepository, 'count').mockResolvedValue(5)

      await expect(DocumentTypesService.create('uni-id', { name: 'New Doc', isRequired: true, allowedFormats: ['pdf'], maxFileSizeMB: 5, order: 1 }))
        .rejects.toThrow(TierLimitError)
    })

    it('should create on STANDARD plan', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'STANDARD' })
      jest.spyOn(DocumentTypesRepository, 'count').mockResolvedValue(10)
      jest.spyOn(DocumentTypesRepository, 'create').mockResolvedValue(mockDocType as any)

      const result = await DocumentTypesService.create('uni-id', { name: 'JAMB Letter', isRequired: true, allowedFormats: ['pdf'], maxFileSizeMB: 5, order: 1 })
      expect(result.name).toBe('JAMB Letter')
    })
  })

  describe('toggle', () => {
    it('should toggle isActive', async () => {
      jest.spyOn(DocumentTypesRepository, 'findById').mockResolvedValue(mockDocType as any)
      const spy = jest.spyOn(DocumentTypesRepository, 'toggle').mockResolvedValue({ ...mockDocType, isActive: false } as any)

      await DocumentTypesService.toggle('doctype-id', 'uni-id')
      expect(spy).toHaveBeenCalledWith('doctype-id', false)
    })
  })
})
