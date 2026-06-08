'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useClearanceStatus, useSubmitStage } from '@/features/clearance/hooks/useClearance'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/features/documents/hooks/useDocuments'
import { DocumentUploadCard } from '@/components/student/DocumentUploadCard'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState, EmptyState } from '@/components/shared/EmptyState'

export default function StudentDocumentsPage() {
  const user = useAuthStore(s => s.user)
  const { data: clearance, isLoading: loadingClearance, isError } = useClearanceStatus(user?.id ?? '')
  const requestId = clearance?.id ?? ''
  const { data: documents, isLoading: loadingDocs } = useDocuments(requestId)
  const { mutate: upload, isPending: uploading, variables } = useUploadDocument(requestId)
  const { mutate: remove } = useDeleteDocument(requestId)
  const { mutate: submit, isPending: submitting } = useSubmitStage()

  if (isError) return <ErrorState />
  if (loadingClearance || loadingDocs) return <LoadingSkeleton rows={3} />
  if (!clearance) return <EmptyState title="No active clearance" description="Start your clearance first from the dashboard." />



  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <PageHeader
        title="Required Documents"
        subtitle="Upload all required documents for your current stage"
      />

      {documents?.map(doc => (
        <DocumentUploadCard
          key={doc.id}
          documentType={doc.documentType}
          uploaded={doc}
          onUpload={(file) => upload({ documentTypeId: doc.documentTypeId, file })}
          onRemove={() => remove(doc.id)}
          uploading={uploading && variables?.documentTypeId === doc.documentTypeId}
        />
      ))}

      {documents?.length === 0 && (
        <EmptyState title="No documents required" description="There are no document requirements for this stage." />
      )}

      <div className="sticky bottom-4 pt-2">
        <Button
          size="lg"
          className="w-full"
          loading={submitting}
          onClick={() => submit(requestId)}
        >
          Submit for Review
        </Button>
      </div>
    </div>
  )
}
