'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { officersApi } from '@/lib/api/officers.api'
import { stagesApi } from '@/lib/api/stages.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { InviteResultDialog } from '@/components/shared/InviteResultDialog'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { UserCircle, AlertTriangle, Pencil, Trash2 } from 'lucide-react'

const inviteSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Invalid email'),
})
type InviteForm = z.infer<typeof inviteSchema>

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
})
type EditForm = z.infer<typeof editSchema>

interface InviteResult { email: string; tempPassword: string; inviteLink: string }

export default function AdminOfficersPage() {
  const qc = useQueryClient()
  const [inviteOpen, setInviteOpen]   = useState(false)
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)
  const [editTarget, setEditTarget]   = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['officers'],
    queryFn:  () => officersApi.list().then(r => r.data.data),
  })

  const { data: stages } = useQuery({
    queryKey: ['stages'],
    queryFn:  () => stagesApi.list().then(r => r.data.data),
  })

  const inviteForm = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) })
  const editForm   = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d: InviteForm) => officersApi.create(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['officers'] })
      setInviteOpen(false)
      inviteForm.reset()
      const d = res.data.data as any
      setInviteResult({ email: d.user?.email ?? '', tempPassword: d.tempPassword, inviteLink: d.inviteLink })
    },
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: (d: EditForm) => officersApi.update(editTarget.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officers'] })
      setEditTarget(null)
    },
  })

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => officersApi.delete(deleteTarget.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officers'] })
      setDeleteTarget(null)
    },
  })

  const openEdit = (o: any) => {
    setEditTarget(o)
    editForm.reset({ firstName: o.firstName, lastName: o.lastName })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Officers"
        subtitle="Manage department officers and their stage assignments"
        actions={<Button onClick={() => setInviteOpen(true)}>+ Invite Officer</Button>}
      />

      {isLoading && <LoadingSkeleton rows={5} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Card padding="sm">
          {!data?.items?.length ? (
            <EmptyState icon={<UserCircle className="h-10 w-10" />} title="No officers yet" description="Invite an officer to get started." action={{ label: '+ Invite Officer', onClick: () => setInviteOpen(true) }} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Email</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Assignments</th>
                  <th className="pb-3 px-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.items.map((o: any) => (
                  <tr key={o.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="py-3 px-3 font-medium">{o.firstName} {o.lastName}</td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">{o.user?.email}</td>
                    <td className="py-3 px-3">
                      {o.stageAssignments?.length > 0
                        ? <span className="text-[var(--color-text)] flex flex-col gap-0.5">
                            {o.stageAssignments.map((a: any) => (
                              <span key={a.id} className="text-xs">
                                • {a.stage.name}{a.faculty ? ` - ${a.faculty.name}` : ''}
                              </span>
                            ))}
                          </span>
                        : <span className="text-[var(--color-pending)] text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Unassigned</span>
                      }
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-muted)] hover:text-[var(--color-rejected)] transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Officer">
        <form onSubmit={inviteForm.handleSubmit(d => create(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={inviteForm.formState.errors.firstName?.message} {...inviteForm.register('firstName')} />
            <Input label="Last Name"  error={inviteForm.formState.errors.lastName?.message}  {...inviteForm.register('lastName')} />
          </div>
          <Input label="Email" type="email" error={inviteForm.formState.errors.email?.message} {...inviteForm.register('email')} />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={creating}>Send Invite</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Officer">
        <form onSubmit={editForm.handleSubmit(d => update(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={editForm.formState.errors.firstName?.message} {...editForm.register('firstName')} />
            <Input label="Last Name"  error={editForm.formState.errors.lastName?.message}  {...editForm.register('lastName')} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={updating}>Save Changes</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Officer">
        <p className="text-sm text-[var(--color-muted)] mb-5">
          Remove <span className="font-medium text-[var(--color-text)]">{deleteTarget?.firstName} {deleteTarget?.lastName}</span>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={deleting} onClick={() => remove()}>Remove</Button>
        </div>
      </Dialog>

      <InviteResultDialog result={inviteResult} onClose={() => setInviteResult(null)} />
    </div>
  )
}
