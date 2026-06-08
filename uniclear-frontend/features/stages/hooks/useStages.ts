'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stagesApi } from '@/lib/api/stages.api'

export const stageKeys = {
  all: () => ['stages'] as const,
}

export function useStages() {
  return useQuery({
    queryKey: stageKeys.all(),
    queryFn:  () => stagesApi.list().then(r => r.data.data),
  })
}

export function useReorderStages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => stagesApi.reorder(ids),
    onSuccess:  () => qc.invalidateQueries({ queryKey: stageKeys.all() }),
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Reorder failed'),
  })
}

export function useUpdateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => stagesApi.update(id, data),
    onSuccess:  () => {
      toast.success('Stage updated')
      qc.invalidateQueries({ queryKey: stageKeys.all() })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Update failed'),
  })
}
