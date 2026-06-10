'use client'

import Image from 'next/image'
import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApproveStage, useRejectStage } from '@/features/clearance/hooks/useClearance'
import { RejectDialog } from '@/components/officer/RejectDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { clearanceApi } from '@/lib/api/clearance.api'
import { documentsApi } from '@/lib/api/documents.api'
import { formatDate } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function ReviewPage({ params }: { params: Promise<{ studentId: string }> }) {
  const router = useRouter()
  const { studentId } = use(params)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedDocIdx, setSelectedDocIdx] = useState(0)

  const { data: clearance, isLoading, isError } = useQuery({
    queryKey: ['clearance', 'review', studentId],
    queryFn:  () => clearanceApi.getByStudent(studentId).then((r: any) => r.data.data),
  })

  const { data: documents } = useQuery({
    queryKey: ['documents', clearance?.id],
    queryFn:  () => documentsApi.getByRequest(clearance!.id).then(r => r.data.data),
    enabled:  !!clearance?.id,
  })

  const { mutate: approve, isPending: approving } = useApproveStage()
  const { mutate: reject,  isPending: rejecting  } = useRejectStage()

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (isError || !clearance) return <ErrorState />

  const selectedDoc = documents?.[selectedDocIdx]

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Back */}
      <div className="py-3 flex items-center gap-2">
        <button onClick={() => router.push(ROUTES.officer.queue)} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
          ← Back to Queue
        </button>
      </div>

      {/* Split panel */}
      <div className="flex-1 flex gap-4 overflow-hidden">

        {/* Left — Student details 40% */}
        <Card className="w-2/5 overflow-y-auto flex flex-col gap-4">
          <div>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Student</p>
            <p className="text-base font-semibold text-[var(--color-text)]">
              {clearance.student?.firstName} {clearance.student?.lastName}
            </p>
            <p className="text-xs font-mono text-[var(--color-muted)] mt-0.5">JAMB Reg No: {clearance.student?.jambRegNo}</p>
            <p className="text-xs text-[var(--color-muted)]">{clearance.student?.department?.name}</p>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-2">Current Stage</p>
            <p className="text-sm font-medium text-[var(--color-text)]">{clearance.currentStage?.name}</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Submitted {formatDate(clearance.updatedAt)}
            </p>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-2">Documents</p>
            <div className="space-y-1">
              {documents?.map((doc, i) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocIdx(i)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-sm transition-colors ${i === selectedDocIdx ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-bg)] text-[var(--color-text)]'}`}
                >
                  <span className="truncate">{doc.documentType.name}</span>
                  <StatusBadge status={doc.status} className={i === selectedDocIdx ? 'opacity-0' : ''} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-[var(--color-border)] pt-4 mt-auto space-y-2">
            <Button
              className="w-full"
              loading={approving}
              onClick={() => approve(
                { requestId: clearance.id },
                { onSuccess: () => router.push(ROUTES.officer.queue) }
              )}
            >
              ✓ Approve Stage
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setRejectOpen(true)}
            >
              ✗ Reject Stage
            </Button>
          </div>
        </Card>

        {/* Right — Document viewer 60% */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between mb-3 shrink-0">
                <p className="text-sm font-medium text-[var(--color-text)]">{selectedDoc.documentType.name}</p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={selectedDocIdx === 0}
                    onClick={() => setSelectedDocIdx(i => i - 1)}
                    className="text-xs px-2 py-1 rounded border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-bg)] transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-[var(--color-muted)]">{selectedDocIdx + 1} / {documents?.length}</span>
                  <button
                    disabled={selectedDocIdx === (documents?.length ?? 1) - 1}
                    onClick={() => setSelectedDocIdx(i => i + 1)}
                    className="text-xs px-2 py-1 rounded border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Viewer */}
              <div className="flex-1 bg-[var(--color-bg)] rounded-[var(--radius-sm)] overflow-hidden">
                {selectedDoc.mimeType === 'application/pdf' ? (
                  <iframe src={selectedDoc.fileUrl} className="w-full h-full" title={selectedDoc.documentType.name} />
                ) : (
                  <Image
                    src={selectedDoc.fileUrl}
                    alt={selectedDoc.documentType.name}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--color-muted)] text-sm">
              Select a document to preview
            </div>
          )}
        </Card>
      </div>

      {rejectOpen && (
        <RejectDialog
          isPending={rejecting}
          onConfirm={(remarks) =>
            reject(
              { requestId: clearance.id, remarks },
              { onSuccess: () => { setRejectOpen(false); router.push(ROUTES.officer.queue) } }
            )
          }
          onCancel={() => setRejectOpen(false)}
        />
      )}
    </div>
  )
}
