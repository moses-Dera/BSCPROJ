'use client'

import { useState } from 'react'
import { GripVertical, AlertTriangle, X, ChevronRight } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery } from '@tanstack/react-query'
import { useStages, useReorderStages, useUpdateStage } from '@/features/stages/hooks/useStages'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import type { ClearanceStage } from '@/types'

function useOfficers() {
  return useQuery({
    queryKey: ['officers'],
    queryFn:  () => apiClient.get<{ success: true; data: any[] }>('/officers').then(r => r.data.data),
  })
}

function StagePanel({ stage, onClose }: { stage: ClearanceStage; onClose: () => void }) {
  const { mutate: update, isPending } = useUpdateStage()
  const { data: officers = [] } = useOfficers()

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-lg)] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{stage.name}</p>
            <p className="text-xs text-[var(--color-muted)]">Stage {stage.orderIndex}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status toggle */}
          <div>
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-2">Status</p>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {stage.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {stage.isActive ? 'Students can submit to this stage' : 'Stage is disabled'}
                </p>
              </div>
              <Button
                size="sm"
                variant={stage.isActive ? 'danger' : 'primary'}
                loading={isPending}
                onClick={() => update({ id: stage.id, data: { isActive: !stage.isActive } })}
              >
                {stage.isActive ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          {/* Officer assignment */}
          <div>
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-2">Assigned Officer</p>
            {officers.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">No officers available. Create officers first.</p>
            ) : (
              <div className="space-y-2">
                {/* Unassign option */}
                <label className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg)]">
                  <input
                    type="radio"
                    name="officer"
                    checked={!stage.officerId}
                    onChange={() => update({ id: stage.id, data: { officerId: null } })}
                    className="accent-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-muted)]">None</span>
                </label>
                {officers.map((o: any) => (
                  <label key={o.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg)]">
                    <input
                      type="radio"
                      name="officer"
                      checked={stage.officerId === o.userId}
                      onChange={() => update({ id: stage.id, data: { officerId: o.userId } })}
                      className="accent-[var(--color-primary)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{o.firstName} {o.lastName}</p>
                      <p className="text-xs text-[var(--color-muted)]">{o.user?.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableStage({ stage, onSelect }: { stage: ClearanceStage; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] cursor-pointer hover:border-[var(--color-primary)] transition-colors',
        isDragging && 'opacity-50 shadow-[var(--shadow-lg)]',
        !stage.isActive && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <button
        {...attributes} {...listeners}
        className="text-[var(--color-muted)] cursor-grab active:cursor-grabbing touch-none p-1"
        aria-label="Drag to reorder"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="h-6 w-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">
        {stage.orderIndex}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)]">{stage.name}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {stage.officer ? `Officer: ${stage.officer.firstName} ${stage.officer.lastName}` : (
            <span className="text-[var(--color-pending)] flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> No officer assigned
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          stage.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
        )}>
          {stage.isActive ? 'Active' : 'Inactive'}
        </span>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted)]" />
      </div>
    </div>
  )
}

export function StageBuilder() {
  const { data: stages, isLoading, isError, refetch } = useStages()
  const { mutate: reorder } = useReorderStages()
  const [items, setItems] = useState<ClearanceStage[]>([])
  const [selected, setSelected] = useState<ClearanceStage | null>(null)

  const synced = items.length ? items : (stages ?? [])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = synced.findIndex(s => s.id === active.id)
    const newIndex = synced.findIndex(s => s.id === over.id)
    const reordered = arrayMove(synced, oldIndex, newIndex).map((s, i) => ({ ...s, orderIndex: i + 1 }))
    setItems(reordered)
    reorder(reordered.map(s => s.id))
  }

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (isError)   return <ErrorState onRetry={() => refetch()} />

  // Keep selected stage in sync with latest data
  const selectedStage = selected ? (synced.find(s => s.id === selected.id) ?? selected) : null

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={synced.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {synced.map(stage => (
              <SortableStage key={stage.id} stage={stage} onSelect={() => setSelected(stage)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedStage && (
        <StagePanel
          stage={selectedStage}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
