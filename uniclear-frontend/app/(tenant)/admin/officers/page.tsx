'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { officersApi } from '@/lib/api/officers.api'
import { stagesApi } from '@/lib/api/stages.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { UserCircle, AlertTriangle } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'

const inviteSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Invalid email'),
  stageId:   z.string().optional(),
})
type InviteForm = z.infer<typeof inviteSchema>

export default function AdminOfficersPage() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['officers'],
    queryFn:  () => officersApi.list().then(r => r.data.data),
  })

  const { data: stages } = useQuery({
    queryKey: ['stages'],
    queryFn:  () => stagesApi.list().then(r => r.data.data),
  })

  const { mutate: create, isPending } = useMutation({
    mutationFn: (d: InviteForm) => officersApi.create(d),
    onSuccess: () => {
      toast.success('Officer invited — they will receive a setup email')
      qc.invalidateQueries({ queryKey: ['officers'] })
      setShowForm(false)
      reset()
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to invite officer'),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Officers"
        subtitle="Manage department officers and their stage assignments"
        actions={<Button onClick={() => setShowForm(s => !s)}>+ Invite Officer</Button>}
      />

      {/* Invite form */}
      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Invite New Officer</h3>
          <form onSubmit={handleSubmit(d => create(d))} className="grid grid-cols-2 gap-4">
            <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name"  error={errors.lastName?.message}  {...register('lastName')}  />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} className="col-span-2" />
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-medium text-[var(--color-text)]">Assign to Stage (optional)</label>
              <select
                {...register('stageId')}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">— No stage —</option>
                {stages?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={isPending}>Send Invite</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && <LoadingSkeleton rows={5} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Card padding="sm">
          {!data?.items?.length ? (
            <EmptyState icon={<UserCircle className="h-10 w-10" />} title="No officers yet" description="Invite an officer to get started." action={{ label: '+ Invite Officer', onClick: () => setShowForm(true) }} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Email</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Assigned Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.items.map((o: any) => (
                  <tr key={o.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="py-3 px-3 font-medium">{o.firstName} {o.lastName}</td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">{o.user?.email}</td>
                    <td className="py-3 px-3">
                      {o.stage
                        ? <span className="text-[var(--color-text)]">{o.stage.name}</span>
                        : <span className="text-[var(--color-pending)] text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Unassigned</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}
