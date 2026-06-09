'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api/students.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { InviteResultDialog } from '@/components/shared/InviteResultDialog'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { Users, Search, Trash2 } from 'lucide-react'

const addSchema = z.object({
  firstName:  z.string().min(1, 'Required'),
  lastName:   z.string().min(1, 'Required'),
  email:      z.string().email('Invalid email'),
  matricNo:   z.string().min(1, 'Required'),
})
type AddForm = z.infer<typeof addSchema>

interface InviteResult { email: string; tempPassword: string; inviteLink: string }

export default function AdminStudentsPage() {
  const qc = useQueryClient()
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [addOpen, setAddOpen]     = useState(false)
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['students', page, search],
    queryFn:  () => studentsApi.list(page, 20, search || undefined).then(r => r.data.data),
  })

  const form = useForm<AddForm>({ resolver: zodResolver(addSchema) })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d: AddForm) => studentsApi.create(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setAddOpen(false)
      form.reset()
      const d = res.data.data as any
      setInviteResult({ email: d.user?.email ?? '', tempPassword: d.tempPassword, inviteLink: d.inviteLink })
    },
  })

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => studentsApi.delete(deleteTarget.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setDeleteTarget(null)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="All enrolled students"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Student</Button>}
      />

      <Input
        placeholder="Search by name or matric number..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        icon={<Search className="h-4 w-4" />}
        className="max-w-sm"
      />

      {isLoading && <LoadingSkeleton rows={8} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Card padding="sm">
          {!data?.items?.length ? (
            <EmptyState icon={<Users className="h-10 w-10" />} title="No students found" action={{ label: '+ Add Student', onClick: () => setAddOpen(true) }} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left">
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Matric No.</th>
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Department</th>
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Faculty</th>
                      <th className="pb-3 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {data.items.map((s: any) => (
                      <tr key={s.id} className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="py-3 px-3 font-mono text-xs">{s.matricNo}</td>
                        <td className="py-3 px-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="py-3 px-3 text-[var(--color-muted)]">{s.department?.name ?? '—'}</td>
                        <td className="py-3 px-3 text-[var(--color-muted)]">{s.faculty?.name ?? '—'}</td>
                        <td className="py-3 px-3">
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-muted)] hover:text-[var(--color-rejected)] transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted)]">{data.total} total students</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button size="sm" variant="secondary" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Add student dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Student">
        <form onSubmit={form.handleSubmit(d => create(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={form.formState.errors.firstName?.message} {...form.register('firstName')} />
            <Input label="Last Name"  error={form.formState.errors.lastName?.message}  {...form.register('lastName')} />
          </div>
          <Input label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input label="Matric Number" placeholder="e.g. UNN/2021/001" error={form.formState.errors.matricNo?.message} {...form.register('matricNo')} />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={creating}>Add & Invite</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Student">
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
