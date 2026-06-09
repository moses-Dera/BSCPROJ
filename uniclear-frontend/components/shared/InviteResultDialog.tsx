'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface InviteResult {
  email: string
  tempPassword: string
  inviteLink: string
}

interface InviteResultDialogProps {
  result: InviteResult | null
  onClose: () => void
}

export function InviteResultDialog({ result, onClose }: InviteResultDialogProps) {
  const [copiedPw, setCopiedPw]   = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const copy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={!!result} onClose={onClose} title="Invite Created">
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-muted)]">
          An invite email has been sent to <span className="font-medium text-[var(--color-text)]">{result?.email}</span>.
          Share the temporary password below if email is unavailable.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Temporary Password</label>
          <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2">
            <span className="flex-1 font-mono text-base tracking-widest text-[var(--color-text)]">{result?.tempPassword}</span>
            <button
              onClick={() => copy(result!.tempPassword, setCopiedPw)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {copiedPw ? <Check className="h-4 w-4 text-[var(--color-approved)]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Set Password Link</label>
          <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2">
            <span className="flex-1 text-xs text-[var(--color-muted)] truncate">{result?.inviteLink}</span>
            <button
              onClick={() => copy(result!.inviteLink, setCopiedLink)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
            >
              {copiedLink ? <Check className="h-4 w-4 text-[var(--color-approved)]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button className="w-full" onClick={onClose}>Done</Button>
      </div>
    </Dialog>
  )
}
