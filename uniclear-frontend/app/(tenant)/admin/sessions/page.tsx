'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sessionsApi } from '@/lib/api/misc.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const sessionSchema = z.object({
  name:      z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate:   z.string().min(1, 'Required'),
})
type SessionForm = z.infer<typeof sessionSchema>

export default function AdminSessionsPage() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => sessionsApi.list().then(r => r.data.data),
  })

  const { mutate: create, isPending } = useMutation({
    mutationFn: (d: SessionForm) => sessionsApi.create(d),
    onSuccess:  () => { toast.success('Session created'); qc.invalidateQueries({ queryKey: ['sessions'] }); setShowForm(false); reset() },
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const { mutate: activate } = useMutation({
    mutationFn: (id: string) => sessionsApi.activate(id),
    onSuccess:  () => { toast.success('Session activated'); qc.invalidateQueries({ queryKey: ['sessions'] }) },
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SessionForm>({ resolver: zodResolver(sessionSchema) })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Sessions"
        subtitle="Manage clearance sessions"
        actions={<Button onClick={() => setShowForm(s => !s)}>+ New Session</Button>}
      />

      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Create Session</h3>
          <form onSubmit={handleSubmit(d => create(d))} className="grid grid-cols-2 gap-4">
            <Input label="Session Name" placeholder="2024/2025" error={errors.name?.message} {...register('name')} className="col-span-2" />
            <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="End Date"   type="date" error={errors.endDate?.message}   {...register('endDate')} />
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={isPending}>Create</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && <LoadingSkeleton rows={3} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {!data?.length ? (
            <EmptyState icon="📅" title="No sessions yet" />
          ) : data.map((s: any) => (
            <Card key={s.id} className={cn('flex items-center justify-between', s.isActive && 'border-l-4 border-l-[var(--color-primary)]')}>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{s.name}</p>
                <p className="text-xs text-[var(--color-muted)]">{formatDate(s.startDate)} — {formatDate(s.endDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                {s.isActive
                  ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
                  : <Button size="sm" variant="secondary" onClick={() => activate(s.id)}>Set Active</Button>
                }
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
