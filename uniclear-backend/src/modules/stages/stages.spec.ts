import { StagesService } from './stages.service'
import { StagesRepository } from './stages.repository'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

jest.mock('./stages.repository')
jest.mock('@/lib/db', () => ({ db: { contractPlan: { findUnique: jest.fn() } } }))

const mockStage = {
  id: 'stage-id', universityId: 'uni-id', name: 'Library Clearance',
  orderIndex: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
}

describe('StagesService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getById', () => {
    it('should return stage when found', async () => {
      jest.spyOn(StagesRepository, 'findById').mockResolvedValue(mockStage as any)
      const result = await StagesService.getById('stage-id', 'uni-id')
      expect(result.name).toBe('Library Clearance')
    })

    it('should throw NotFoundError when not found', async () => {
      jest.spyOn(StagesRepository, 'findById').mockResolvedValue(null)
      await expect(StagesService.getById('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should throw TierLimitError when stage limit reached', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'TRIAL' })
      jest.spyOn(StagesRepository, 'count').mockResolvedValue(3)

      await expect(StagesService.create('uni-id', { name: 'New Stage', orderIndex: 4 }))
        .rejects.toThrow(TierLimitError)
    })

    it('should create stage within limit', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'STANDARD' })
      jest.spyOn(StagesRepository, 'count').mockResolvedValue(2)
      jest.spyOn(StagesRepository, 'create').mockResolvedValue(mockStage as any)

      const result = await StagesService.create('uni-id', { name: 'Library Clearance', orderIndex: 1 })
      expect(result.name).toBe('Library Clearance')
    })
  })

  describe('toggle', () => {
    it('should toggle isActive to false when currently true', async () => {
      jest.spyOn(StagesRepository, 'findById').mockResolvedValue(mockStage as any)
      const spy = jest.spyOn(StagesRepository, 'toggle').mockResolvedValue({ ...mockStage, isActive: false } as any)

      await StagesService.toggle('stage-id', 'uni-id')
      expect(spy).toHaveBeenCalledWith('stage-id', false)
    })
  })

  describe('delete', () => {
    it('should throw NotFoundError when stage not found', async () => {
      jest.spyOn(StagesRepository, 'findById').mockResolvedValue(null)
      await expect(StagesService.delete('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })
})
