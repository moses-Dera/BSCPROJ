'use client'

import Image from 'next/image'
import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useApproveStage, useRejectStage } from '@/features/clearance/hooks/useClearance'
import { RejectDialog } from '@/components/officer/RejectDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
const PdfStampViewer = dynamic(() => import('@/components/officer/PdfStampViewer').then(mod => mod.PdfStampViewer), { ssr: false, loading: () => <LoadingSkeleton rows={10} /> })
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { clearanceApi } from '@/lib/api/clearance.api'
import { useStages } from '@/features/stages/hooks/useStages'
import { documentsApi } from '@/lib/api/documents.api'
import { formatDate } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

export default function ReviewPage({ params }: { params: Promise<{ studentId: string }> }) {
  const router = useRouter()
  const qc = useQueryClient()
  const { studentId } = use(params)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [docRejectOpen, setDocRejectOpen] = useState(false)
  const [docRejectReason, setDocRejectReason] = useState('')
  const [selectedDocIdx, setSelectedDocIdx] = useState(0)
  const [stampedFile, setStampedFile] = useState<File | undefined>()
  const [docActionPending, setDocActionPending] = useState(false)

  const { data: clearance, isLoading, isError } = useQuery({
    queryKey: ['clearance', 'review', studentId],
    queryFn:  () => clearanceApi.getById(studentId).then((r: any) => r.data.data),
  })

  const { data: documents, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', clearance?.id],
    queryFn:  () => documentsApi.getByRequest(clearance!.id).then(r => r.data.data),
    enabled:  !!clearance?.id,
  })

  const { mutate: approve, isPending: approving } = useApproveStage()
  const { mutate: reject,  isPending: rejecting  } = useRejectStage()

  const { data: allStages } = useStages()

  const [issueDataOpen, setIssueDataOpen] = useState(false)
  const [issuedData, setIssuedData] = useState<Record<string, string>>({})

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (isError || !clearance) return <ErrorState />

  const campaignStages = allStages?.filter(s => s.campaignId === clearance.campaignId) || []
  const sortedStages = [...campaignStages].sort((a, b) => a.orderIndex - b.orderIndex)
  const isFinalStage = sortedStages.length > 0 && sortedStages[sortedStages.length - 1].id === clearance.currentStageId
  const issuedDataFields: string[] = clearance.campaign?.issuedDataFields || []
  const needsIssuedData = isFinalStage && issuedDataFields.length > 0

  // Stage approve is only unlocked when every document has been individually approved
  const allDocsApproved = documents && documents.length > 0 && documents.every(d => (d as any).status === 'APPROVED')

  const handleApproveDoc = async (docId: string) => {
    setDocActionPending(true)
    try {
      await documentsApi.approve(docId)
      toast.success('Document approved')
      refetchDocs()
    } catch {
      toast.error('Failed to approve document')
    } finally {
      setDocActionPending(false)
    }
  }

  const handleRejectDoc = async () => {
    if (!docRejectReason.trim()) return toast.error('Please enter a rejection reason')
    const doc = documents?.[selectedDocIdx]
    if (!doc) return
    setDocActionPending(true)
    try {
      await documentsApi.reject(doc.id, docRejectReason)
      toast.success('Document rejected — student will be notified to re-upload')
      setDocRejectOpen(false)
      setDocRejectReason('')
      refetchDocs()
    } catch {
      toast.error('Failed to reject document')
    } finally {
      setDocActionPending(false)
    }
  }

  const handleApproveClick = () => {
    if (needsIssuedData) {
      setIssueDataOpen(true)
    } else {
      approve(
        { requestId: clearance.id, file: stampedFile },
        { onSuccess: () => router.push(ROUTES.officer.queue) }
      )
    }
  }

  const handleIssueDataSubmit = () => {
    approve(
      { requestId: clearance.id, file: stampedFile, issuedData },
      { onSuccess: () => {
          setIssueDataOpen(false)
          router.push(ROUTES.officer.queue)
      }}
    )
  }

  const selectedDoc = documents?.[selectedDocIdx]
  const selectedDocStatus = (selectedDoc as any)?.status ?? 'PENDING'

  const docStatusColors: Record<string, string> = {
    PENDING:  'bg-amber-100 text-amber-700 border border-amber-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  }

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

        {/* Left — Student details + doc list */}
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

          {/* Document list with per-doc status */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-2">Documents</p>
            <div className="space-y-1.5">
              {documents?.map((doc, i) => {
                const docStatus = (doc as any).status ?? 'PENDING'
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocIdx(i)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-sm transition-colors ${
                      i === selectedDocIdx
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'hover:bg-[var(--color-bg)] text-[var(--color-text)]'
                    }`}
                  >
                    <span className="truncate flex-1">{doc.documentType.name}</span>
                    <span className={`ml-2 shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      i === selectedDocIdx ? 'bg-white/20 text-white' : docStatusColors[docStatus]
                    }`}>
                      {docStatus}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Per-document actions */}
          {selectedDoc && (
            <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium">
                Reviewing: <span className="text-[var(--color-text)] normal-case">{selectedDoc.documentType.name}</span>
              </p>
              {selectedDocStatus === 'APPROVED' ? (
                <p className="text-xs text-emerald-600 font-medium">✓ This document has been approved</p>
              ) : selectedDocStatus === 'REJECTED' ? (
                <div className="space-y-1">
                  <p className="text-xs text-red-600 font-medium">✗ Rejected — awaiting student re-upload</p>
                  {(selectedDoc as any).rejectionReason && (
                    <p className="text-xs text-[var(--color-muted)] italic">"{(selectedDoc as any).rejectionReason}"</p>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    loading={docActionPending}
                    onClick={() => handleApproveDoc(selectedDoc.id)}
                  >
                    ✓ Approve Doc
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    onClick={() => setDocRejectOpen(true)}
                  >
                    ✗ Reject Doc
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Stage-level actions — gated until all docs are approved */}
          <div className="border-t border-[var(--color-border)] pt-4 mt-auto space-y-2">
            {!allDocsApproved && documents && documents.length > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                ⚠ Approve all {documents.length} document{documents.length > 1 ? 's' : ''} before approving the stage
              </p>
            )}
            <Button
              className="w-full"
              loading={approving}
              disabled={!allDocsApproved}
              onClick={handleApproveClick}
            >
              ✓ Approve Stage {stampedFile && '(with attachment)'}
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-text)]">{selectedDoc.documentType.name}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${docStatusColors[selectedDocStatus]}`}>
                    {selectedDocStatus}
                  </span>
                </div>
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
              <div className="flex-1 rounded-[var(--radius-sm)] overflow-hidden flex flex-col relative">
                {selectedDoc.mimeType === 'application/pdf' ? (
                  <PdfStampViewer
                    fileUrl={selectedDoc.fileUrl}
                    onSaveStampedFile={(file) => setStampedFile(file)}
                  />
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

      {/* Stage reject dialog */}
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

      {/* Per-doc reject dialog */}
      <Dialog open={docRejectOpen} onClose={() => { setDocRejectOpen(false); setDocRejectReason('') }} title="Reject Document">
        <div className="pt-4 space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            The student will need to re-upload only this document. Please provide a clear reason.
          </p>
          <div>
            <label className="text-sm font-medium mb-1 block">Rejection Reason</label>
            <Input
              value={docRejectReason}
              onChange={e => setDocRejectReason(e.target.value)}
              placeholder="e.g. Document is blurry / wrong file uploaded..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setDocRejectOpen(false); setDocRejectReason('') }}>Cancel</Button>
            <Button variant="danger" loading={docActionPending} onClick={handleRejectDoc}>
              Reject Document
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Final stage issued data dialog */}
      <Dialog open={issueDataOpen} onClose={() => setIssueDataOpen(false)} title="Final Clearance Details">
        <div className="pt-4 space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            This is the final stage. Please provide the required information to issue the clearance certificate or slip.
          </p>
          {issuedDataFields.map(field => (
            <div key={field}>
              <label className="text-sm font-medium mb-1 block">{field}</label>
              <Input
                value={issuedData[field] || ''}
                onChange={e => setIssuedData({ ...issuedData, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
          <div className="flex justify-end pt-2 gap-2">
            <Button variant="secondary" onClick={() => setIssueDataOpen(false)}>Cancel</Button>
            <Button
              loading={approving}
              onClick={handleIssueDataSubmit}
              disabled={issuedDataFields.some(f => !issuedData[f]?.trim())}
            >
              Confirm & Issue
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
