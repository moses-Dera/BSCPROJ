'use client'

import { useState } from 'react'
import { GripVertical, AlertTriangle } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStages, useReorderStages, useUpdateStage } from '@/features/stages/hooks/useStages'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import type { ClearanceStage } from '@/types'

function SortableStage({ stage }: { stage: ClearanceStage }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id })
  const { mutate: update } = useUpdateStage()

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]',
        isDragging && 'opacity-50 shadow-[var(--shadow-lg)]'
      )}
    >
      <button
        {...attributes} {...listeners}
        className="text-[var(--color-muted)] cursor-grab active:cursor-grabbing touch-none p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="h-6 w-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">
        {stage.orderIndex}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)]">{stage.name}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {stage.officer ? `Officer: ${stage.officer.name}` : (
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
        <Button
          size="sm"
          variant="ghost"
          onClick={() => update({ id: stage.id, data: { isActive: !stage.isActive } })}
        >
          {stage.isActive ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </div>
  )
}

export function StageBuilder() {
  const { data: stages, isLoading, isError, refetch } = useStages()
  const { mutate: reorder } = useReorderStages()
  const [items, setItems] = useState<ClearanceStage[]>([])

  const synced = items.length ? items : (stages ?? [])
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = synced.findIndex(s => s.id === active.id)
    const newIndex = synced.findIndex(s => s.id === over.id)
    const reordered = arrayMove(synced, oldIndex, newIndex)
    setItems(reordered)
    reorder(reordered.map(s => s.id))
  }

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (isError)   return <ErrorState onRetry={() => refetch()} />

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={synced.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {synced.map(stage => <SortableStage key={stage.id} stage={stage} />)}
        </div>
      </SortableContext>
    </DndContext>
  )
}
