'use client'

import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api/students.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { FileText, Eye, ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminStudentProfile({ params }: { params: { id: string } }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['student', params.id],
    queryFn: () => studentsApi.getById(params.id).then(r => r.data.data),
  })

  const { data: clearance, isLoading: loadingClearance } = useQuery({
    queryKey: ['student-clearance', params.id],
    queryFn: () => studentsApi.getClearanceProgress(params.id).then(r => r.data.data),
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-4">Profile Details</h3>
          <div className="space-y-4 text-sm">
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
                          <Button variant="outline" size="sm" asChild>
                            <a href={approval.attachmentUrl} target="_blank" download>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
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
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b shrink-0 bg-gray-50">
            <DialogTitle>Signed Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-gray-200">
            {previewUrl && (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0" 
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
