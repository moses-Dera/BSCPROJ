'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { brandingApi } from '@/lib/api/misc.api'
import { useTenantStore } from '@/store/useTenantStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const brandingSchema = z.object({
  bannerMessage: z.string().optional(),
  footerText:    z.string().optional(),
})
type BrandingForm = z.infer<typeof brandingSchema>

export default function AdminBrandingPage() {
  const qc = useQueryClient()
  const { primaryColor, accentColor } = useTenantStore()

  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn:  () => brandingApi.get().then((r: any) => r.data.data),
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (d: BrandingForm) => brandingApi.update(d),
    onSuccess:  () => { toast.success('Branding saved'); qc.invalidateQueries({ queryKey: ['branding'] }) },
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const { mutate: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: (file: File) => brandingApi.uploadLogo(file),
    onSuccess:  () => { toast.success('Logo updated'); qc.invalidateQueries({ queryKey: ['branding'] }) },
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const { mutate: uploadBg, isPending: uploadingBg } = useMutation({
    mutationFn: (file: File) => brandingApi.uploadLoginBg(file),
    onSuccess:  () => { toast.success('Login background updated') },
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const { register, handleSubmit } = useForm<BrandingForm>({
    resolver: zodResolver(brandingSchema),
    values: { bannerMessage: branding?.bannerMessage ?? '', footerText: branding?.footerText ?? '' },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Branding" subtitle="Customise your university portal appearance" />

      <Card className="space-y-5">
        {/* Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">University Logo</p>
            <p className="text-xs text-[var(--color-muted)]">Displayed in the sidebar and login page</p>
          </div>
          <label className="cursor-pointer">
            <Button size="sm" variant="secondary" loading={uploadingLogo} onClick={() => {}}>
              Upload Logo
            </Button>
            <input
              type="file" className="hidden" accept=".png,.jpg,.jpeg,.svg"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }}
            />
          </label>
        </div>

        {/* Colours (display-only — editable in future) */}
        <div className="flex gap-6 pb-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-1">Primary Colour</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded border border-[var(--color-border)]" style={{ backgroundColor: primaryColor }} />
              <span className="text-sm font-mono text-[var(--color-text)]">{primaryColor}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-1">Accent Colour</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded border border-[var(--color-border)]" style={{ backgroundColor: accentColor }} />
              <span className="text-sm font-mono text-[var(--color-text)]">{accentColor}</span>
            </div>
          </div>
        </div>

        {/* Login background */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">Login Background</p>
            <p className="text-xs text-[var(--color-muted)]">Full-bleed image behind the login form</p>
          </div>
          <label className="cursor-pointer">
            <Button size="sm" variant="secondary" loading={uploadingBg} onClick={() => {}}>Upload Image</Button>
            <input
              type="file" className="hidden" accept=".png,.jpg,.jpeg"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadBg(f) }}
            />
          </label>
        </div>

        {/* Text fields */}
        <form onSubmit={handleSubmit(d => save(d))} className="space-y-4">
          <Input
            label="Banner Message"
            placeholder="Welcome to UNN Clearance Portal!"
            {...register('bannerMessage')}
          />
          <Input
            label="Footer Text"
            placeholder="© 2025 University of Nigeria, Nsukka"
            {...register('footerText')}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
