import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--color-muted)] max-w-xs mb-6">{description}</p>}
      {action && <Button variant="secondary" onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = "We couldn't load your data.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">⚠</span>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">Something went wrong</h3>
      <p className="text-sm text-[var(--color-muted)] max-w-xs mb-6">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Try Again</Button>}
    </div>
  )
}
