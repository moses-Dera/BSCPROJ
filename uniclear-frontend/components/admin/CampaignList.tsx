'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Settings, Trash2, Power } from 'lucide-react'
import { toast } from 'sonner'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export function CampaignList() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list().then(r => r.data.data),
  })

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => campaignsApi.create({ name, description }),
    onSuccess: () => {
      toast.success('Campaign created')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      setOpen(false)
      setName('')
      setDescription('')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create campaign'),
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (id: string) => campaignsApi.toggle(id),
    onSuccess: () => {
      toast.success('Campaign status updated')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to update campaign'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      toast.success('Campaign deleted')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to delete campaign'),
  })

  if (isLoading) return <LoadingSkeleton rows={3} />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Campaign</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns?.map(campaign => (
          <Card key={campaign.id} className={`p-5 flex flex-col justify-between ${!campaign.isActive ? 'opacity-70' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-[var(--color-text)]">{campaign.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${campaign.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mb-4">{campaign.description || 'No description provided.'}</p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <Link href={`${ROUTES.admin.stages}?campaignId=${campaign.id}`} className="flex-1">
                <Button variant="secondary" className="w-full"><Settings className="h-4 w-4 mr-2" /> Stages</Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => toggle(campaign.id)} title={campaign.isActive ? 'Deactivate' : 'Activate'}>
                <Power className={`h-4 w-4 ${campaign.isActive ? 'text-amber-500' : 'text-emerald-500'}`} />
              </Button>
              <Button variant="danger" size="sm" onClick={() => {
                if (window.confirm('Are you sure you want to delete this campaign?')) remove(campaign.id)
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {campaigns?.length === 0 && (
          <div className="col-span-full p-10 text-center border-2 border-dashed border-[var(--color-border)] rounded-lg">
            <p className="text-[var(--color-muted)]">No campaigns found. Create one to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Clearance Campaign">
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Campaign Name</label>
              <Input placeholder="e.g. 2026 Graduating Students Clearance" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input placeholder="Optional details..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end pt-4">
              <Button loading={isPending} onClick={() => create()} disabled={!name}>Create Campaign</Button>
            </div>
          </div>
      </Dialog>
    </div>
  )
}
