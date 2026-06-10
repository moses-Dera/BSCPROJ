'use client'

import { useState } from 'react'
import { GripVertical, AlertTriangle, X, ChevronRight, FileText, Plus, Trash2 } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery } from '@tanstack/react-query'
import { useStages, useReorderStages, useCreateStage, useUpdateStage, useAssignDocumentToStage, useRemoveDocumentFromStage, useAssignOfficerToStage, useUnassignOfficerFromStage } from '@/features/stages/hooks/useStages'
import { apiClient } from '@/lib/api/client'
import { structureApi, sessionsApi } from '@/lib/api/misc.api'
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
  const { mutate: assignDoc, isPending: assigningDoc } = useAssignDocumentToStage()
  const { mutate: removeDoc } = useRemoveDocumentFromStage()
  const { mutate: assignOfficer, isPending: assigningOfficer } = useAssignOfficerToStage()
  const { mutate: unassignOfficer } = useUnassignOfficerFromStage()

  const { data: officers = [] } = useOfficers()
  const { data: allDocTypes = [] } = useQuery({
    queryKey: ['document-types'],
    queryFn:  () => apiClient.get<{ success: true; data: any[] }>('/document-types').then(r => r.data.data),
  })
  const { data: faculties = [] } = useQuery({ queryKey: ['faculties'], queryFn: () => structureApi.faculties().then(r => r.data.data) })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => structureApi.departments().then(r => r.data.data) })
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => sessionsApi.list().then(r => r.data.data) })

  const [assignForm, setAssignForm] = useState({ officerId: '', facultyId: '', departmentId: '', sessionId: '' })

  const handleAssignOfficer = () => {
    if (!assignForm.officerId) return
    assignOfficer(
      { stageId: stage.id, data: { officerId: assignForm.officerId, facultyId: assignForm.facultyId || undefined, departmentId: assignForm.departmentId || undefined, sessionId: assignForm.sessionId || undefined } },
      { onSuccess: () => setAssignForm({ officerId: '', facultyId: '', departmentId: '', sessionId: '' }) }
    )
  }

  const assignedIds = new Set(stage.documentRequirements.map(r => r.documentTypeId))
  const unassigned  = allDocTypes.filter((d: any) => !assignedIds.has(d.id))

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

          {/* Officer assignments */}
          <div>
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-2">Officer Assignments</p>
            {(!stage.officerAssignments || stage.officerAssignments.length === 0) ? (
              <p className="text-xs text-[var(--color-muted)] mb-3">No officers assigned.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {stage.officerAssignments.map((a: any) => (
                  <div key={a.id} className="flex flex-col gap-1 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]">
                    <div className="flex justify-between items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{a.officer.firstName} {a.officer.lastName}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {a.faculty ? `Faculty: ${a.faculty.name}` : 'All Faculties'}
                          {a.department ? `, Dept: ${a.department.name}` : ''}
                          {a.session ? `, Session: ${a.session.name}` : ''}
                        </p>
                      </div>
                      <button onClick={() => unassignOfficer(a.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-muted)] hover:text-red-500 transition-colors shrink-0 ml-2">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add assignment form */}
            <div className="border border-[var(--color-border)] p-3 rounded-[var(--radius-md)] space-y-2.5 bg-[var(--color-bg)]/50">
              <p className="text-xs font-medium text-[var(--color-text)]">New Assignment</p>
              <select value={assignForm.officerId} onChange={e => setAssignForm(s => ({ ...s, officerId: e.target.value }))} className="w-full text-xs p-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                <option value="">Select Officer...</option>
                {officers.map((o: any) => <option key={o.id} value={o.userId}>{o.firstName} {o.lastName}</option>)}
              </select>
              <select value={assignForm.facultyId} onChange={e => setAssignForm(s => ({ ...s, facultyId: e.target.value }))} className="w-full text-xs p-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                <option value="">All Faculties</option>
                {faculties.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select value={assignForm.departmentId} onChange={e => setAssignForm(s => ({ ...s, departmentId: e.target.value }))} className="w-full text-xs p-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                <option value="">All Departments</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Button onClick={handleAssignOfficer} disabled={!assignForm.officerId} loading={assigningOfficer} size="sm" className="w-full mt-1">Assign</Button>
            </div>
          </div>

          {/* Document requirements */}
          <div>
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-2">Required Documents</p>

            {stage.documentRequirements.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] mb-3">No documents required for this stage.</p>
            ) : (
              <div className="space-y-1 mb-3">
                {stage.documentRequirements.map(req => (
                  <div key={req.documentTypeId} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-[var(--color-muted)] shrink-0" />
                      <span className="text-xs font-medium text-[var(--color-text)] truncate">{req.documentType.name}</span>
                    </div>
                    <button
                      onClick={() => removeDoc({ documentTypeId: req.documentTypeId, stageId: stage.id })}
                      className="p-1 rounded hover:bg-red-50 text-[var(--color-muted)] hover:text-red-500 transition-colors shrink-0 ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {unassigned.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] text-[var(--color-muted)] mb-1">Add document type:</p>
                {unassigned.map((d: any) => (
                  <button
                    key={d.id}
                    disabled={assigningDoc}
                    onClick={() => assignDoc({ documentTypeId: d.id, stageId: stage.id })}
                    className="w-full flex items-center gap-2 p-2.5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)] text-left transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                    <span className="text-xs text-[var(--color-text)] truncate">{d.name}</span>
                  </button>
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
          {stage.officerAssignments && stage.officerAssignments.length > 0 ? `${stage.officerAssignments.length} officer(s) assigned` : (
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

export function StageBuilder({ campaignId }: { campaignId: string }) {
  const { data: stages, isLoading, isError, refetch } = useStages(campaignId)
  const { mutate: reorder } = useReorderStages(campaignId)
  const { mutate: createStage, isPending: creating } = useCreateStage(campaignId)
  const [items, setItems] = useState<ClearanceStage[]>([])
  const [selected, setSelected] = useState<ClearanceStage | null>(null)
  const [newStageName, setNewStageName] = useState('')

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

  const handleCreate = () => {
    if (!newStageName.trim()) return
    createStage({ name: newStageName }, {
      onSuccess: () => {
        setNewStageName('')
        setItems([]) // Force resync with server data
      }
    })
  }

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (isError)   return <ErrorState onRetry={() => refetch()} />

  // Keep selected stage in sync with latest data
  const selectedStage = selected ? (synced.find(s => s.id === selected.id) ?? selected) : null

  return (
    <>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="New stage name (e.g. Department Review)" 
          className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)]"
          value={newStageName}
          onChange={e => setNewStageName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={!newStageName.trim()} loading={creating}>
          <Plus className="h-4 w-4 mr-2" /> Add Stage
        </Button>
      </div>

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
