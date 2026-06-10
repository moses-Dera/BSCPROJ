import { OfficersService } from './officers.service'
import { OfficersRepository } from './officers.repository'
import { ConflictError, NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

jest.mock('./officers.repository')
jest.mock('@/lib/db', () => ({ db: { user: { findUnique: jest.fn(), create: jest.fn() }, contractPlan: { findUnique: jest.fn() } } }))

const mockOfficer = {
  id: 'officer-id', universityId: 'uni-id', userId: 'user-id',
  firstName: 'Ada', lastName: 'Obi',
  createdAt: new Date(), updatedAt: new Date(),
}

describe('OfficersService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getById', () => {
    it('should return officer when found', async () => {
      jest.spyOn(OfficersRepository, 'findById').mockResolvedValue(mockOfficer as any)
      const result = await OfficersService.getById('officer-id', 'uni-id')
      expect(result.firstName).toBe('Ada')
    })

    it('should throw NotFoundError when not found', async () => {
      jest.spyOn(OfficersRepository, 'findById').mockResolvedValue(null)
      await expect(OfficersService.getById('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should throw TierLimitError when officer limit reached', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'TRIAL' })
      jest.spyOn(OfficersRepository, 'count').mockResolvedValue(3)

      await expect(OfficersService.create('uni-id', { email: 'a@b.com', firstName: 'A', lastName: 'B' }))
        .rejects.toThrow(TierLimitError)
    })

    it('should throw ConflictError when email already in use', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'STANDARD' })
      jest.spyOn(OfficersRepository, 'count').mockResolvedValue(0)
      ;(db.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' })

      await expect(OfficersService.create('uni-id', { email: 'exists@uni.ng', firstName: 'A', lastName: 'B' }))
        .rejects.toThrow(ConflictError)
    })
  })

  describe('update', () => {
    it('should throw NotFoundError when officer not found', async () => {
      jest.spyOn(OfficersRepository, 'findById').mockResolvedValue(null)
      await expect(OfficersService.update('bad-id', 'uni-id', { firstName: 'New' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete when officer exists', async () => {
      jest.spyOn(OfficersRepository, 'findById').mockResolvedValue(mockOfficer as any)
      const spy = jest.spyOn(OfficersRepository, 'delete').mockResolvedValue(mockOfficer as any)
      await OfficersService.delete('officer-id', 'uni-id')
      expect(spy).toHaveBeenCalledWith('officer-id')
    })
  })
})
