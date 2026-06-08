import { cn } from '@/lib/utils/cn'

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-4 w-1/4 rounded bg-[var(--color-border)] animate-pulse" />
      <div className="h-4 w-1/3 rounded bg-[var(--color-border)] animate-pulse" />
      <div className="h-4 w-1/5 rounded bg-[var(--color-border)] animate-pulse" />
      <div className="h-4 w-1/6 rounded bg-[var(--color-border)] animate-pulse" />
    </div>
  )
}

export function LoadingSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('divide-y divide-[var(--color-border)]', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6', className)}>
      <div className="h-4 w-1/3 rounded bg-[var(--color-border)] animate-pulse mb-3" />
      <div className="h-8 w-1/2 rounded bg-[var(--color-border)] animate-pulse mb-2" />
      <div className="h-3 w-1/4 rounded bg-[var(--color-border)] animate-pulse" />
    </div>
  )
}
