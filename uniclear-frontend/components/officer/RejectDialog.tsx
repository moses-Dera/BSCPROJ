'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface RejectDialogProps {
  onConfirm: (remarks: string) => void
  onCancel:  () => void
  isPending?: boolean
  isRevoke?: boolean
  stageName?: string
}

export function RejectDialog({
  onConfirm,
  onCancel,
  isPending,
  isRevoke = false,
  stageName,
}: RejectDialogProps) {
  const [remarks, setRemarks] = useState('')
  const [revokeConfirmed, setRevokeConfirmed] = useState(false)
  const tooShort = remarks.trim().length < 10

  const canSubmit = !tooShort && (!isRevoke || revokeConfirmed)

  const chips = isRevoke
    ? [
        'Fraudulent or invalid document discovered upon secondary inspection.',
        'Uploaded credential belongs to an incorrect student or academic session.',
        'Endorsement revoked: Required departmental requirements or fees not satisfied.',
        'Discovered illegible or unreadable document after initial endorsement.',
      ]
    : [
        'Incomplete requirements. Please upload missing documents.',
        'Uploaded documents are illegible or blurry. Please re-upload clear copies.',
        'Departmental receipts or dues not confirmed by bursary.',
        'Uploaded files belong to an incorrect academic session.',
      ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] p-6 w-full max-w-md mx-4">
        <h3 className="text-base font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
          {isRevoke ? (
            <>
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
              <span>Revoke Endorsement {stageName ? `(${stageName})` : ''}</span>
            </>
          ) : (
            <span>Reject Stage</span>
          )}
        </h3>

        {isRevoke ? (
          <div className="p-3 my-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex gap-2.5 items-start">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Official Seal Revocation Warning</p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                This stage has already been officially stamped and endorsed. Revoking it will void your digital signature/seal, record an administrative revocation event in the immutable audit log, and return the clearance to pending status.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)] mb-4">
            Provide a clear reason so the student knows what to fix.
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {chips.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => setRemarks(chip)}
              className="text-[11px] text-left px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/60 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          placeholder={
            isRevoke
              ? 'Specify the exact reason for revoking this official endorsement...'
              : 'Explain the rejection reason in detail...'
          }
          rows={3}
          className={cn(
            'w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text)] placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-rejected)]',
            remarks.length > 0 && tooShort && 'border-[var(--color-rejected)]'
          )}
          aria-label="Rejection reason"
        />
        {remarks.length > 0 && tooShort && (
          <p className="text-xs text-[var(--color-rejected)] mt-1">Please provide at least 10 characters</p>
        )}

        {isRevoke && (
          <label className="flex items-start gap-2 pt-3 cursor-pointer text-xs text-[var(--color-text)] font-medium select-none">
            <input
              type="checkbox"
              checked={revokeConfirmed}
              onChange={e => setRevokeConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <span className="leading-tight text-slate-700">
              I confirm that I want to revoke this endorsement and require the student to rectify this stage.
            </span>
          </label>
        )}

        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="secondary" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!canSubmit}
            loading={isPending}
            onClick={() => onConfirm(remarks.trim())}
            className="text-xs font-bold"
          >
            {isRevoke ? 'Confirm Revoke & Reject' : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </div>
  )
}
