import { cn } from '@/lib/utils/cn'
import { STATUS_COLORS } from '@/lib/constants'

type Status = keyof typeof STATUS_COLORS

interface StatusBadgeProps {
  status: Status
  className?: string
}

const labels: Record<Status, string> = {
  APPROVED:    'Approved',
  PENDING:     'Pending',
  REJECTED:    'Rejected',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  SUBMITTED:   'Submitted',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        colors.bg, colors.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {labels[status]}
    </span>
  )
}
