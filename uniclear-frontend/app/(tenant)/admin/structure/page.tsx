'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { structureApi } from '@/lib/api/structure.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function AcademicStructurePage() {
  const qc = useQueryClient()
  const [facultyName, setFacultyName] = useState('')
  const [deptName, setDeptName] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null)
  
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false)
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false)

  const { data: faculties, isLoading: loadingF } = useQuery({
    queryKey: ['faculties'],
    queryFn: () => structureApi.getFaculties().then(r => r.data.data),
  })

  const { data: departments, isLoading: loadingD } = useQuery({
    queryKey: ['departments'],
    queryFn: () => structureApi.getDepartments().then(r => r.data.data),
  })

  const { mutate: createFaculty, isPending: addingF } = useMutation({
    mutationFn: () => structureApi.createFaculty(facultyName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculties'] })
      setIsAddFacultyOpen(false)
      setFacultyName('')
      toast.success('Faculty added successfully')
    }
  })

  const { mutate: createDept, isPending: addingD } = useMutation({
    mutationFn: () => structureApi.createDepartment(selectedFacultyId!, deptName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setIsAddDeptOpen(false)
      setDeptName('')
      toast.success('Department added successfully')
    }
  })

  const { mutate: deleteFaculty } = useMutation({
    mutationFn: (id: string) => structureApi.deleteFaculty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculties'] })
      qc.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Faculty deleted')
    }
  })

  const { mutate: deleteDept } = useMutation({
    mutationFn: (id: string) => structureApi.deleteDepartment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Department deleted')
    }
  })

  if (loadingF || loadingD) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="Academic Structure" subtitle="Manage university faculties and departments" />
        <Button onClick={() => setIsAddFacultyOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Faculty
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {faculties?.map((faculty: any) => {
          const facultyDepts = departments?.filter((d: any) => d.facultyId === faculty.id) || []
          
          return (
            <Card key={faculty.id} padding="lg" className="border-l-4 border-l-[var(--color-primary)]">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">{faculty.name}</h3>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelectedFacultyId(faculty.id); setIsAddDeptOpen(true) }}>
                    <Plus className="w-4 h-4 mr-1" /> Add Dept
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => {
                    if (confirm('Delete this entire faculty and all its departments?')) deleteFaculty(faculty.id)
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {facultyDepts.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)] italic">No departments configured yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {facultyDepts.map((dept: any) => (
                    <div key={dept.id} className="bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-center group">
                      <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                      <button onClick={() => deleteDept(dept.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}

        {faculties?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-[var(--color-muted)] mb-4">No faculties configured for this university yet.</p>
            <Button onClick={() => setIsAddFacultyOpen(true)}>Create First Faculty</Button>
          </div>
        )}
      </div>

      {/* Add Faculty Modal */}
      <Dialog open={isAddFacultyOpen} onClose={() => setIsAddFacultyOpen(false)} title="Add New Faculty">
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Faculty Name</label>
            <Input value={facultyName} onChange={(e) => setFacultyName(e.target.value)} placeholder="e.g. Faculty of Engineering" className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAddFacultyOpen(false)}>Cancel</Button>
            <Button onClick={() => createFaculty()} disabled={addingF || !facultyName}>Save Faculty</Button>
          </div>
        </div>
      </Dialog>

      {/* Add Dept Modal */}
      <Dialog open={isAddDeptOpen} onClose={() => setIsAddDeptOpen(false)} title="Add New Department">
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Department Name</label>
            <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. Computer Science" className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAddDeptOpen(false)}>Cancel</Button>
            <Button onClick={() => createDept()} disabled={addingD || !deptName}>Save Department</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
