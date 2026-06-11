'use client'

import { useState } from 'react'
import { GripVertical, AlertTriangle, X, ChevronRight, ChevronDown, FileText, Plus, Trash2, Search } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

function OfficerSearchableSelect({ officers, value, onChange }: { officers: any[], value: string, onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = officers.find(o => o.id === value)
  
  const filtered = officers.filter(o => 
    `${o.firstName} ${o.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <button 
        type="button"
        className="w-full text-left text-xs p-1.5 rounded border border-gray-200 bg-white hover:border-blue-500 focus:border-blue-500 outline-none flex justify-between items-center transition-colors"
        onClick={() => { setOpen(!open); setSearch('') }}
      >
        <span className="truncate pr-2 font-medium">{selected ? `${selected.firstName} ${selected.lastName}` : <span className="text-gray-400">Search officer...</span>}</span>
        <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-56 flex flex-col overflow-hidden">
            <div className="flex items-center px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
              <Search className="h-3 w-3 text-gray-400 mr-2 shrink-0" />
              <input 
                type="text" 
                autoFocus
                className="text-xs bg-transparent outline-none w-full placeholder:text-gray-400"
                placeholder="Type name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto flex-1 p-1">
              <button 
                className={cn("w-full text-left px-2 py-1.5 text-xs rounded transition-colors", !value ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")}
                onClick={() => { onChange(''); setOpen(false) }}
              >
                Unassigned
              </button>
              {filtered.length === 0 ? (
                <p className="text-[11px] text-gray-400 p-2 text-center">No officers found</p>
              ) : (
                filtered.map(o => (
                  <button 
                    key={o.id}
                    className={cn("w-full text-left px-2 py-1.5 text-xs rounded truncate transition-colors", value === o.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")}
                    onClick={() => { onChange(o.id); setOpen(false) }}
                  >
                    {o.firstName} {o.lastName}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StagePanel({ stage, campaignId, onClose }: { stage: ClearanceStage; campaignId: string; onClose: () => void }) {
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
  
  // Fetch campaigns to get current campaign context
  const { data: campaigns = [] } = useQuery({ 
    queryKey: ['campaigns'], 
    queryFn: () => apiClient.get<{ success: true; data: any[] }>('/campaigns').then(r => r.data.data) 
  })
  const campaign = campaigns.find((c: any) => c.id === campaignId)

  const { data: allFaculties = [] } = useQuery({ queryKey: ['faculties'], queryFn: () => structureApi.faculties().then(r => r.data.data) })
  const { data: allDepartments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => structureApi.departments().then(r => r.data.data) })
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => sessionsApi.list().then(r => r.data.data) })
  const qc = useQueryClient()

  // Filter faculties and departments if the campaign has eligibility rules
  const hasRules = campaign?.eligibilityRules && campaign.eligibilityRules.length > 0
  
  const allowedFacultyIds = hasRules 
    ? campaign.eligibilityRules.map((r: any) => r.facultyId).filter(Boolean) 
    : []
  const allowedDepartmentIds = hasRules
    ? campaign.eligibilityRules.map((r: any) => r.departmentId).filter(Boolean)
    : []

  const faculties = hasRules && allowedFacultyIds.length > 0
    ? allFaculties.filter((f: any) => allowedFacultyIds.includes(f.id)) 
    : allFaculties

  const departments = hasRules && allowedDepartmentIds.length > 0
    ? allDepartments.filter((d: any) => allowedDepartmentIds.includes(d.id))
    : allDepartments

  const [assignForm, setAssignForm] = useState({ 
    officerId: '', 
    facultyId: faculties.length === 1 ? faculties[0].id : '', 
    departmentId: departments.length === 1 ? departments[0].id : '', 
    sessionId: '' 
  })

  const [newDocName, setNewDocName] = useState('')
  const [isCreatingDoc, setIsCreatingDoc] = useState(false)
  const [docSearch, setDocSearch] = useState('')

  const { mutate: createDoc } = useMutation({
    mutationFn: (name: string) => apiClient.post('/document-types', {
      name,
      isRequired: true,
      allowedFormats: ['pdf', 'jpg', 'png'],
      maxFileSizeMB: 5,
      stageId: stage.id
    }),
    onSuccess: () => {
      setNewDocName('')
      setIsCreatingDoc(false)
      qc.invalidateQueries({ queryKey: ['document-types'] })
      qc.invalidateQueries({ queryKey: ['stages'] })
      toast.success('Document created and assigned!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create document')
  })

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
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Officer Assignments</p>
                {(() => {
                  const hasUniversal = stage.officerAssignments?.some((a: any) => !a.faculty)
                  const coveredFaculties = new Set(stage.officerAssignments?.filter((a: any) => a.faculty).map((a: any) => a.faculty.id)).size
                  const totalFaculties = faculties.length
                  const isFullyCovered = hasUniversal || (totalFaculties > 0 && coveredFaculties >= totalFaculties)
                  
                  return (
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", isFullyCovered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {isFullyCovered ? "100% Coverage" : `Coverage: ${coveredFaculties}/${totalFaculties} Faculties`}
                    </span>
                  )
                })()}
              </div>

              {(!stage.officerAssignments || stage.officerAssignments.length === 0) ? (
                <p className="text-xs text-[var(--color-muted)] mb-3">No officers assigned. Students will be stuck at this stage.</p>
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

            {/* Toggle Views */}
            <div className="flex gap-2 border-b border-[var(--color-border)] mb-4">
              <button 
                className={cn("text-xs font-medium pb-2 border-b-2 px-1 transition-colors", assignForm.sessionId !== 'matrix' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800")}
                onClick={() => setAssignForm(s => ({...s, sessionId: ''}))}
              >
                Rule Builder
              </button>
              <button 
                className={cn("text-xs font-medium pb-2 border-b-2 px-1 transition-colors", assignForm.sessionId === 'matrix' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800")}
                onClick={() => setAssignForm(s => ({...s, sessionId: 'matrix'}))}
              >
                Matrix View (Bulk)
              </button>
            </div>

            {assignForm.sessionId === 'matrix' ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-2 font-semibold text-gray-700">Faculty</th>
                      <th className="p-2 font-semibold text-gray-700">Assigned Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {faculties.map((f: any) => {
                      const assignment = stage.officerAssignments?.find((a: any) => a.faculty?.id === f.id && !a.department)
                      return (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="p-2 font-medium text-gray-600">{f.name}</td>
                          <td className="p-1.5">
                            <OfficerSearchableSelect
                              officers={officers}
                              value={assignment?.officerId || ''}
                              onChange={async (newOfficerId) => {
                                if (assignment) {
                                  await apiClient.delete(`/officers/assignment/${assignment.id}`)
                                }
                                if (newOfficerId) {
                                  await apiClient.post(`/officers/stage/${stage.id}/assign`, {
                                    officerId: newOfficerId,
                                    facultyId: f.id
                                  })
                                }
                                qc.invalidateQueries({ queryKey: ['stages'] })
                              }}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Natural Language Assignment Form */
              <div className="border border-blue-100 p-3.5 rounded-lg bg-blue-50/30">
                <p className="text-xs font-semibold text-blue-800 mb-3">Assign an Officer</p>
                
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-700 leading-loose">
                  <span>Assign</span>
                  <select value={assignForm.officerId} onChange={e => setAssignForm(s => ({ ...s, officerId: e.target.value }))} className="px-2 py-1 rounded border border-gray-200 bg-white font-medium text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-w-[160px]">
                    <option value="">Select Officer...</option>
                    {officers.map((o: any) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>)}
                  </select>
                  
                  <span>to handle clearance for</span>
                  <select value={assignForm.facultyId} onChange={e => setAssignForm(s => ({ ...s, facultyId: e.target.value, departmentId: '' }))} className="px-2 py-1 rounded border border-gray-200 bg-white font-medium text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                    <option value="">Everyone (All Faculties)</option>
                    {faculties.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>

                  {assignForm.facultyId && (
                    <>
                      <span className="text-gray-500">specifically in</span>
                      <select value={assignForm.departmentId} onChange={e => setAssignForm(s => ({ ...s, departmentId: e.target.value }))} className="px-2 py-1 rounded border border-gray-200 bg-white font-medium text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                        <option value="">All Departments</option>
                        {departments
                          .filter((d: any) => d.facultyId === assignForm.facultyId)
                          .map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </>
                  )}
                </div>

                <Button onClick={handleAssignOfficer} disabled={!assignForm.officerId} loading={assigningOfficer} size="sm" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  Confirm Assignment
                </Button>
              </div>
            )}
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[var(--color-muted)]">Add existing document:</p>
                </div>
                {unassigned.length > 3 && (
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-gray-50/50"
                  />
                )}
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {unassigned
                    .filter((d: any) => d.name.toLowerCase().includes(docSearch.toLowerCase()))
                    .map((d: any) => (
                    <button
                      key={d.id}
                      disabled={assigningDoc}
                      onClick={() => assignDoc({ documentTypeId: d.id, stageId: stage.id })}
                      className="w-full flex items-center gap-2 p-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)] text-left transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                      <span className="text-xs text-[var(--color-text)] truncate">{d.name}</span>
                    </button>
                  ))}
                  {docSearch && unassigned.filter((d: any) => d.name.toLowerCase().includes(docSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-center text-gray-400 py-2">No matches found</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              {isCreatingDoc ? (
                <div className="space-y-2 p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
                  <p className="text-[11px] font-medium text-[var(--color-muted)]">New Document Name</p>
                  <input 
                    type="text" 
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    placeholder="e.g. O'Level Result" 
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsCreatingDoc(false)} className="text-xs px-2 py-1 text-gray-500 hover:text-gray-800">Cancel</button>
                    <button onClick={() => { if(newDocName.trim()) createDoc(newDocName.trim()) }} disabled={!newDocName.trim()} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Create</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingDoc(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-[var(--radius-md)] border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium">Create New Document</span>
                </button>
              )}
            </div>
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

  const synced = items.length 
    ? items.map(item => {
        const latest = stages?.find(s => s.id === item.id)
        return latest ? { ...latest, orderIndex: item.orderIndex } : item
      }) 
    : (stages ?? [])
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
          campaignId={campaignId}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
