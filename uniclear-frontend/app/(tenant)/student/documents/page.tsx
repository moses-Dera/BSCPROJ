'use client'

import { useClearanceStatus, useSubmitStage } from '@/features/clearance/hooks/useClearance'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/features/documents/hooks/useDocuments'
import { ClearanceSubmissionPanel } from '@/components/student/ClearanceSubmissionPanel'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState, EmptyState } from '@/components/shared/EmptyState'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function StudentDocumentsPage() {
  const router = useRouter()
  const { data: clearance, isLoading: loadingClearance, isError } = useClearanceStatus()
  const requestId = clearance?.id ?? ''
  
  const { data: documents, isLoading: loadingDocs } = useDocuments(requestId)
  const { mutateAsync: upload } = useUploadDocument(requestId)
  const { mutateAsync: remove } = useDeleteDocument(requestId)
  const { mutateAsync: submit } = useSubmitStage()

  if (isError) return <ErrorState />
  if (loadingClearance || loadingDocs) return <LoadingSkeleton rows={3} />
  if (!clearance) return <EmptyState title="No active clearance" description="Start your clearance first from the dashboard." />

  const handleUpload = async (file: File, documentTypeId: string) => {
    await upload({ documentTypeId, file })
  }

  const handleDelete = async (documentId: string) => {
    await remove(documentId)
  }

  const handleSubmit = async () => {
    await submit(requestId)
    router.push(ROUTES.student.dashboard)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Required Documents"
        subtitle="Upload all required documents for your current stage"
      />
      
      <ClearanceSubmissionPanel
        request={clearance as any}
        documents={documents || []}
        onUploadDocument={handleUpload}
        onDeleteDocument={handleDelete}
        onSubmitStage={handleSubmit}
      />
    </div>
  )
}
