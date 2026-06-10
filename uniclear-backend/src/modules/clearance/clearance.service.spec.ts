import { ClearanceService } from './clearance.service'
import { ClearanceRepository } from './clearance.repository'
import { DocumentTypesRepository } from '@/modules/document-types/document-types.repository'
import { DocumentsRepository } from '@/modules/documents/document.repository'
import { db } from '@/lib/db'
import { ValidationError } from '@/core/errors/AppError'

jest.mock('./clearance.repository')
jest.mock('@/modules/document-types/document-types.repository')
jest.mock('@/modules/documents/document.repository')
jest.mock('@/lib/db', () => ({
  db: {
    student: {
      findUnique: jest.fn(),
    },
  },
}))

describe('ClearanceService', () => {
  describe('submit', () => {
    const mockUniversityId = 'univ-1'
    const mockUserId = 'user-1'
    const mockRequestId = 'req-1'
    const mockStudentId = 'student-1'
    const mockStageId = 'stage-1'

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw ValidationError if required documents are missing', async () => {
      ;(ClearanceRepository.findById as jest.Mock).mockResolvedValue({
        id: mockRequestId,
        studentId: mockStudentId,
        sessionId: 'session-1',
        currentStageId: mockStageId,
        student: { userId: mockUserId },
      })
      ;(db.student.findUnique as jest.Mock).mockResolvedValue({ id: mockStudentId })
      ;(DocumentTypesRepository.findByStage as jest.Mock).mockResolvedValue([
        { documentTypeId: 'doc-type-1', isRequired: true, documentType: { name: 'O-Level Result' } },
      ])
      ;(DocumentsRepository.findByStage as jest.Mock).mockResolvedValue([])

      await expect(ClearanceService.submit(mockRequestId, mockUserId, mockUniversityId))
        .rejects
        .toThrow(ValidationError)

      await expect(ClearanceService.submit(mockRequestId, mockUserId, mockUniversityId))
        .rejects
        .toThrow('Missing required documents: O-Level Result')
    })

    it('should update the clearance stageStatus to SUBMITTED if all documents are present', async () => {
      ;(ClearanceRepository.findById as jest.Mock).mockResolvedValue({
        id: mockRequestId,
        studentId: mockStudentId,
        sessionId: 'session-1',
        currentStageId: mockStageId,
        student: { userId: mockUserId },
      })
      ;(db.student.findUnique as jest.Mock).mockResolvedValue({ id: mockStudentId })
      ;(DocumentTypesRepository.findByStage as jest.Mock).mockResolvedValue([
        { documentTypeId: 'doc-type-1', isRequired: true, documentType: { name: 'O-Level Result' } },
      ])
      ;(DocumentsRepository.findByStage as jest.Mock).mockResolvedValue([
        { documentTypeId: 'doc-type-1' },
      ])

      // We expect this new method to be called
      ;(ClearanceRepository.updateStageStatus as jest.Mock).mockResolvedValue(true)

      const result = await ClearanceService.submit(mockRequestId, mockUserId, mockUniversityId)

      expect(ClearanceRepository.updateStageStatus).toHaveBeenCalledWith(mockRequestId, 'SUBMITTED')
    })
  })
})
