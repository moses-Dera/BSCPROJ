import { StudentsService } from './students.service'
import { StudentsRepository } from './students.repository'
import { ConflictError, NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { db } from '@/lib/db'

jest.mock('./students.repository')
jest.mock('@/lib/db', () => ({ db: { user: { findUnique: jest.fn(), create: jest.fn() }, contractPlan: { findUnique: jest.fn() } } }))

const mockStudent = {
  id: 'student-id', universityId: 'uni-id', userId: 'user-id',
  jambRegNo: '2019/001', firstName: 'Moses', lastName: 'Okonkwo',
  createdAt: new Date(), updatedAt: new Date(),
}

describe('StudentsService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getById', () => {
    it('should return student when found', async () => {
      jest.spyOn(StudentsRepository, 'findById').mockResolvedValue(mockStudent as any)
      const result = await StudentsService.getById('student-id', 'uni-id')
      expect(result.jambRegNo).toBe('2019/001')
    })

    it('should throw NotFoundError when student not found', async () => {
      jest.spyOn(StudentsRepository, 'findById').mockResolvedValue(null)
      await expect(StudentsService.getById('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should throw TierLimitError when student limit reached', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'TRIAL' })
      jest.spyOn(StudentsRepository, 'count').mockResolvedValue(100)

      await expect(StudentsService.create('uni-id', { email: 'a@b.com', jambRegNo: '001', firstName: 'A', lastName: 'B' }))
        .rejects.toThrow(TierLimitError)
    })

    it('should throw ConflictError when jamb registration number exists', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'STANDARD' })
      jest.spyOn(StudentsRepository, 'count').mockResolvedValue(0)
      jest.spyOn(StudentsRepository, 'findByJambRegNo').mockResolvedValue(mockStudent as any)

      await expect(StudentsService.create('uni-id', { email: 'a@b.com', jambRegNo: '2019/001', firstName: 'A', lastName: 'B' }))
        .rejects.toThrow(ConflictError)
    })

    it('should throw ConflictError when email exists', async () => {
      ;(db.contractPlan.findUnique as jest.Mock).mockResolvedValue({ tier: 'STANDARD' })
      jest.spyOn(StudentsRepository, 'count').mockResolvedValue(0)
      jest.spyOn(StudentsRepository, 'findByJambRegNo').mockResolvedValue(null)
      ;(db.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' })

      await expect(StudentsService.create('uni-id', { email: 'existing@unn.edu.ng', jambRegNo: '2019/002', firstName: 'A', lastName: 'B' }))
        .rejects.toThrow(ConflictError)
    })
  })

  describe('delete', () => {
    it('should throw NotFoundError when student not found', async () => {
      jest.spyOn(StudentsRepository, 'findById').mockResolvedValue(null)
      await expect(StudentsService.delete('bad-id', 'uni-id')).rejects.toThrow(NotFoundError)
    })

    it('should delete when student exists', async () => {
      jest.spyOn(StudentsRepository, 'findById').mockResolvedValue(mockStudent as any)
      const spy = jest.spyOn(StudentsRepository, 'delete').mockResolvedValue(mockStudent as any)
      await StudentsService.delete('student-id', 'uni-id')
      expect(spy).toHaveBeenCalledWith('student-id', 'uni-id')
    })
  })
})
