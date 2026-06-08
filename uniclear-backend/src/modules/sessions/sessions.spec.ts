import { SessionsService } from './sessions.service'
import { SessionsRepository } from './sessions.repository'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

jest.mock('./sessions.repository')
jest.mock('@/lib/db', () => ({ db: { contractPlan: { findUnique: jest.fn() } } }))

const mockSession = {
  id: 'session-id', universityId: 'uni-id', name: '2024/2025',
  startDate: new Date('2024-09-01'), endDate: new Date('2025-08-31'),
  isActive: true, createdAt: new Date(), updatedAt: new Date(),
}

describe('SessionsService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getById', () => {
    it('should return session when found', async () => {
      jest.spyOn(SessionsRepository, 'findById').mockResolvedValue(mockSession as any)
      const result = await SessionsService.getById('session-id', 'uni-id')
      expect(result.name).toBe('2024/2025')
    })

    it('should throw NotFoundError when not found', async () => {
      jest.spyOn(SessionsRepository, 'findById').mockResolvedValue(null)
      await expect(SessionsService.getById('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should throw TierLimitError when TRIAL plan already has a session', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'TRIAL' })
      jest.spyOn(SessionsRepository, 'findAll').mockResolvedValue([mockSession as any])

      await expect(SessionsService.create('uni-id', { name: '2025/2026', startDate: new Date(), endDate: new Date() }))
        .rejects.toThrow(TierLimitError)
    })

    it('should create session on STANDARD plan', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'STANDARD' })
      jest.spyOn(SessionsRepository, 'create').mockResolvedValue(mockSession as any)

      const result = await SessionsService.create('uni-id', { name: '2024/2025', startDate: new Date(), endDate: new Date() })
      expect(result.name).toBe('2024/2025')
    })
  })

  describe('activate', () => {
    it('should throw NotFoundError when session not found', async () => {
      jest.spyOn(SessionsRepository, 'findById').mockResolvedValue(null)
      await expect(SessionsService.activate('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })
})
