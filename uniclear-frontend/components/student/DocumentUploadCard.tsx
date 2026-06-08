'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { formatFileSize } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { Document, DocumentType } from '@/types'

interface DocumentUploadCardProps {
  documentType: DocumentType
  uploaded?: Document
  onUpload:  (file: File) => void
  onRemove?: () => void
  uploading?: boolean
}

export function DocumentUploadCard({ documentType, uploaded, onUpload, onRemove, uploading }: DocumentUploadCardProps) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{documentType.name}</p>
            {documentType.description && (
              <p className="text-xs text-[var(--color-muted)] mt-0.5">{documentType.description}</p>
            )}
          </div>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          documentType.isRequired ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
        )}>
          {documentType.isRequired ? 'Required' : 'Optional'}
        </span>
      </div>

      {uploaded ? (
        <div className="flex items-center justify-between bg-[var(--color-bg)] rounded-[var(--radius-sm)] px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">📎</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text)] truncate">{uploaded.documentType.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{formatFileSize(uploaded.fileSizeMB * 1024 * 1024)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={uploaded.status} />
            {onRemove && (
              <button onClick={onRemove} className="text-[var(--color-muted)] hover:text-[var(--color-rejected)] transition-colors text-sm" aria-label="Remove document">✕</button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 border-dashed py-8 cursor-pointer transition-colors',
            dragging
              ? 'border-[var(--color-primary)] bg-blue-50'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)]'
          )}
        >
          {uploading ? (
            <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <>
              <span className="text-2xl">⬆</span>
              <p className="text-xs text-[var(--color-muted)] text-center">
                Drag & drop or click to upload<br />
                {documentType.allowedFormats?.join(', ').toUpperCase()} • Max {documentType.maxFileSizeMB}MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={documentType.allowedFormats?.map(f => `.${f}`).join(',')}
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }}
          />
        </div>
      )}

      <p className={cn('text-xs mt-2', uploaded ? 'text-[var(--color-approved)]' : 'text-[var(--color-muted)]')}>
        {uploaded ? '✓ Uploaded — Pending review' : '✗ Not uploaded'}
      </p>
    </div>
  )
}
