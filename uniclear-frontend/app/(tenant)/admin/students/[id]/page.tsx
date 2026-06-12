'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api/students.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { FileText, Eye, ArrowLeft, Download, Pencil } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { useState, useEffect, use } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  jambRegNo: z.string().min(1, 'Required'),
  matricNo:  z.string().optional(),
})
type EditForm = z.infer<typeof editSchema>

export default function AdminStudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  
  const form = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getById(id).then(r => r.data.data),
  })

  const { data: clearance, isLoading: loadingClearance } = useQuery({
    queryKey: ['student-clearance', id],
    queryFn: () => studentsApi.getClearanceProgress(id).then(r => r.data.data),
  })

  useEffect(() => {
    if (student && editOpen) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        jambRegNo: student.jambRegNo,
        matricNo: student.matricNo || '',
      })
    }
  }, [student, editOpen, form])

  const { mutate: updateStudent, isPending: updating } = useMutation({
    mutationFn: (data: EditForm) => studentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] })
      toast.success('Student profile updated securely')
      setEditOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update student')
    }
  })

  if (loadingStudent || loadingClearance) return <LoadingSkeleton />
  if (!student) return <div className="p-10 text-center">Student not found</div>

  const approvals = clearance?.stageApprovals || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href={ROUTES.admin.students} className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
      </Link>
      
      <PageHeader title={`${student.firstName} ${student.lastName}`} subtitle={`JAMB Reg No: ${student.jambRegNo}`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1" padding="lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Profile Details</h3>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[var(--color-muted)] mb-1">Matric Number</p>
              <p className="font-medium text-[var(--color-primary)]">{student.matricNo || <span className="text-gray-400 italic">Pending Clearance</span>}</p>
            </div>
            <div>
              <p className="text-[var(--color-muted)] mb-1">Email</p>
              <p className="font-medium">{student.user?.email}</p>
            </div>
            <div>
              <p className="text-[var(--color-muted)] mb-1">Faculty</p>
              <p className="font-medium">{student.faculty?.name || '--'}</p>
            </div>
            <div>
              <p className="text-[var(--color-muted)] mb-1">Department</p>
              <p className="font-medium">{student.department?.name || '--'}</p>
            </div>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2" padding="lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Clearance Progress</h3>
            {clearance && <StatusBadge status={clearance.status} />}
          </div>

          {!clearance ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-[var(--color-muted)]">This student has not started their clearance process yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)] italic">No stages approved yet.</p>
              ) : (
                <div className="border border-[var(--color-border)] rounded-lg overflow-hidden divide-y divide-[var(--color-border)]">
                  {approvals.map((approval: any) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-semibold text-sm mb-1">{approval.stage?.name}</p>
                        <p className="text-xs text-[var(--color-muted)] flex items-center gap-2">
                          <StatusBadge status={approval.status} />
                          <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                      
                      {approval.status === 'APPROVED' && approval.attachmentUrl && (
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setPreviewUrl(approval.attachmentUrl)}>
                            <Eye className="w-4 h-4 mr-1" /> View Signed Doc
                          </Button>
                          <a href={approval.attachmentUrl} target="_blank" download>
                            <Button variant="secondary" size="sm" type="button">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Document Preview Modal */}
      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Signed Document Preview">
        <div className="w-full h-[80vh] bg-gray-200 mt-4 rounded-md overflow-hidden">
          {previewUrl && (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-0" 
              title="Document Preview"
            />
          )}
        </div>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Student Profile">
        <form onSubmit={form.handleSubmit(d => updateStudent(d))} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={form.formState.errors.firstName?.message} {...form.register('firstName')} />
            <Input label="Last Name"  error={form.formState.errors.lastName?.message}  {...form.register('lastName')} />
          </div>
          <Input label="JAMB Reg Number" error={form.formState.errors.jambRegNo?.message} {...form.register('jambRegNo')} />
          <Input label="Matriculation Number" placeholder="Leave empty if pending" error={form.formState.errors.matricNo?.message} {...form.register('matricNo')} />
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
            Note: Changes to primary identifiers are securely logged to the Global Audit Trail.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" loading={updating}>Save Changes</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
