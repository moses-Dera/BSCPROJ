import { AuditService } from './audit.service'
import { AuditRepository } from './audit.repository'

jest.mock('./audit.repository')

const mockLog = {
  id: 'log-id', universityId: 'uni-id', actorId: 'user-id',
  action: 'STAGE_APPROVED', targetId: 'req-id', targetType: 'ClearanceRequest',
  createdAt: new Date(),
}

describe('AuditService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const spy = jest.spyOn(AuditRepository, 'log').mockResolvedValue(mockLog as any)
      await AuditService.log({ universityId: 'uni-id', actorId: 'user-id', action: 'STAGE_APPROVED', targetId: 'req-id', targetType: 'ClearanceRequest' })
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ action: 'STAGE_APPROVED' }))
    })
  })

  describe('list', () => {
    it('should return paginated audit logs', async () => {
      jest.spyOn(AuditRepository, 'findAll').mockResolvedValue({ data: [mockLog as any], total: 1 })
      const result = await AuditService.list('uni-id', { page: 1, limit: 20 })
      expect(result.total).toBe(1)
      expect(result.data[0].action).toBe('STAGE_APPROVED')
    })
  })
})
