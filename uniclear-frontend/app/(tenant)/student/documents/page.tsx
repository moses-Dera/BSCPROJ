'use client'

import { useClearanceStatus, useSubmitStage } from '@/features/clearance/hooks/useClearance'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/features/documents/hooks/useDocuments'
import { useStages } from '@/features/stages/hooks/useStages'
import { DocumentUploadCard } from '@/components/student/DocumentUploadCard'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState, EmptyState } from '@/components/shared/EmptyState'

export default function StudentDocumentsPage() {
  const { data: clearance, isLoading: loadingClearance, isError } = useClearanceStatus()
  const { data: stages,   isLoading: loadingStages }              = useStages()
  const requestId = clearance?.id ?? ''
  const { data: documents, isLoading: loadingDocs } = useDocuments(requestId)
  const { mutate: upload, isPending: uploading, variables } = useUploadDocument(requestId)
  const { mutate: remove } = useDeleteDocument(requestId)
  const { mutate: submit, isPending: submitting } = useSubmitStage()

  if (isError) return <ErrorState />
  if (loadingClearance || loadingDocs || loadingStages) return <LoadingSkeleton rows={3} />
  if (!clearance) return <EmptyState title="No active clearance" description="Start your clearance first from the dashboard." />

  const currentStage    = stages?.find(s => s.id === clearance.currentStageId)
  const requirements    = (currentStage as any)?.documentRequirements ?? []
  const hasRequirements = requirements.length > 0

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <PageHeader
        title="Required Documents"
        subtitle={currentStage ? `Upload documents for: ${currentStage.name}` : 'Upload all required documents for your current stage'}
      />

      {!hasRequirements ? (
        <EmptyState title="No documents required" description="This stage has no document requirements." />
      ) : (
        requirements.map((req: any) => {
          const uploaded = documents?.find(d => d.documentTypeId === req.documentTypeId)
          return (
            <DocumentUploadCard
              key={req.documentTypeId}
              documentType={req.documentType}
              uploaded={uploaded}
              onUpload={(file) => upload({ documentTypeId: req.documentTypeId, file })}
              onRemove={() => uploaded && remove(uploaded.id)}
              uploading={uploading && variables?.documentTypeId === req.documentTypeId}
            />
          )
        })
      )}

      {hasRequirements && (
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
      )}
    </div>
  )
}
