'use client'

import { useEffect, useRef } from 'react'
import { useForm, useController } from 'react-hook-form'
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
  primaryColor:  z.string().optional(),
  accentColor:   z.string().optional(),
  bannerMessage: z.string().optional(),
  footerText:    z.string().optional(),
})
type BrandingForm = z.infer<typeof brandingSchema>

function ColorField({ label, name, control }: { label: string; name: 'primaryColor' | 'accentColor'; control: any }) {
  const { field } = useController({ name, control })
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-[var(--color-muted)] mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-8 w-8 shrink-0 rounded border border-[var(--color-border)] cursor-pointer"
          style={{ backgroundColor: field.value ?? '#000000' }}
        />
        <input ref={inputRef} type="color" value={field.value ?? '#000000'}
          onChange={e => field.onChange(e.target.value)} className="sr-only" />
        <input
          type="text"
          value={field.value ?? ''}
          onChange={e => field.onChange(e.target.value)}
          placeholder="#000000"
          className="w-28 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs font-mono text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>
    </div>
  )
}

function SectionRow({ label, description, action }: { label: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-muted)]">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

export default function AdminBrandingPage() {
  const qc = useQueryClient()
  const setTenant = useTenantStore(s => s.setTenant)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef   = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn:  () => brandingApi.get().then((r: any) => r.data.data),
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (d: BrandingForm) => brandingApi.update(d),
    onSuccess:  (_, vars) => {
      toast.success('Branding saved')
      qc.invalidateQueries({ queryKey: ['branding'] })
      if (vars.primaryColor) setTenant({ primaryColor: vars.primaryColor })
      if (vars.accentColor)  setTenant({ accentColor:  vars.accentColor  })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const { mutate: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: (file: File) => brandingApi.uploadLogo(file),
    onSuccess:  (res: any) => {
      toast.success('Logo updated')
      qc.invalidateQueries({ queryKey: ['branding'] })
      if (res.data?.data?.logoUrl) setTenant({ logoUrl: res.data.data.logoUrl })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const { mutate: uploadBg, isPending: uploadingBg } = useMutation({
    mutationFn: (file: File) => brandingApi.uploadLoginBg(file),
    onSuccess:  () => toast.success('Login background updated'),
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const { mutate: uploadCert, isPending: uploadingCert } = useMutation({
    mutationFn: (file: File) => brandingApi.uploadCertificateTemplate(file),
    onSuccess:  (res: any) => {
      toast.success('Certificate template updated')
      qc.invalidateQueries({ queryKey: ['branding'] })
      if (res.data?.data?.certificateTemplateUrl) setTenant({ certificateTemplateUrl: res.data.data.certificateTemplateUrl })
    },
    onError:    (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const { register, handleSubmit, reset, control } = useForm<BrandingForm>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { primaryColor: '#1B4F72', accentColor: '#2980B9', bannerMessage: '', footerText: '' },
  })

  useEffect(() => {
    if (branding) reset({
      primaryColor:  branding.primaryColor  ?? '#1B4F72',
      accentColor:   branding.accentColor   ?? '#2980B9',
      bannerMessage: branding.bannerMessage ?? '',
      footerText:    branding.footerText    ?? '',
    })
  }, [branding])

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Branding" subtitle="Customise your university portal appearance" />

      <Card className="space-y-4">
        <SectionRow
          label="University Logo"
          description="Displayed in the sidebar and login page"
          action={
            <>
              <Button type="button" size="sm" variant="secondary" loading={uploadingLogo} onClick={() => logoInputRef.current?.click()}>
                Upload Logo
              </Button>
              <input ref={logoInputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.svg"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
            </>
          }
        />

        <form onSubmit={handleSubmit(d => save(d))} className="space-y-4">
          <div className="flex gap-4 pb-4 border-b border-[var(--color-border)]">
            <ColorField label="Primary Colour" name="primaryColor" control={control} />
            <ColorField label="Accent Colour"  name="accentColor"  control={control} />
          </div>

          <SectionRow
            label="Login Background"
            description="Full-bleed image behind the login form"
            action={
              <>
                <Button type="button" size="sm" variant="secondary" loading={uploadingBg} onClick={() => bgInputRef.current?.click()}>
                  Upload Image
                </Button>
                <input ref={bgInputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadBg(f) }} />
              </>
            }
          />

          <SectionRow
            label="Certificate Template"
            description="Upload a custom PDF or Image to be used for Student Certificates"
            action={
              <>
                <Button type="button" size="sm" variant="secondary" loading={uploadingCert} onClick={() => certInputRef.current?.click()}>
                  Upload Template
                </Button>
                <input ref={certInputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadCert(f) }} />
              </>
            }
          />

          <Input label="Banner Message" placeholder="Welcome to UNN Clearance Portal!" {...register('bannerMessage')} />
          <Input label="Footer Text" placeholder="© 2025 University of Nigeria, Nsukka" {...register('footerText')} />

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={isPending}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Coordinate Mapper Section */}
      <Card className="space-y-4">
        <div className="pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Certificate Data Coordinates</h2>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            If you uploaded a custom template, specify where the dynamic text should be placed.
            X and Y are percentages (0-100). X=0 is left, Y=0 is bottom.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const coords = {
              name: { x: Number(formData.get('nameX')), y: Number(formData.get('nameY')), size: Number(formData.get('nameSize')) },
              jamb: { x: Number(formData.get('jambX')), y: Number(formData.get('jambY')), size: Number(formData.get('jambSize')) },
              date: { x: Number(formData.get('dateX')), y: Number(formData.get('dateY')), size: Number(formData.get('dateSize')) },
            }
            save({ certificateCoordinates: coords })
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--color-text)]">Student Name</p>
              <Input label="X (%)" name="nameX" type="number" defaultValue={branding?.certificateCoordinates?.name?.x ?? 50} />
              <Input label="Y (%)" name="nameY" type="number" defaultValue={branding?.certificateCoordinates?.name?.y ?? 47.5} />
              <Input label="Size"  name="nameSize" type="number" defaultValue={branding?.certificateCoordinates?.name?.size ?? 28} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--color-text)]">JAMB Reg No</p>
              <Input label="X (%)" name="jambX" type="number" defaultValue={branding?.certificateCoordinates?.jamb?.x ?? 50} />
              <Input label="Y (%)" name="jambY" type="number" defaultValue={branding?.certificateCoordinates?.jamb?.y ?? 27.5} />
              <Input label="Size"  name="jambSize" type="number" defaultValue={branding?.certificateCoordinates?.jamb?.size ?? 14} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--color-text)]">Date of Issue</p>
              <Input label="X (%)" name="dateX" type="number" defaultValue={branding?.certificateCoordinates?.date?.x ?? 50} />
              <Input label="Y (%)" name="dateY" type="number" defaultValue={branding?.certificateCoordinates?.date?.y ?? 15} />
              <Input label="Size"  name="dateSize" type="number" defaultValue={branding?.certificateCoordinates?.date?.size ?? 12} />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const form = document.querySelector('form:last-of-type') as HTMLFormElement
                const formData = new FormData(form)
                import('@/lib/utils/pdf').then(({ generateCertificatePDF }) => {
                  generateCertificatePDF({
                    studentName: 'JOHN DOE SMITH',
                    jambRegNo: '12345678AB',
                    universityName: 'Test University',
                    completedAt: '12/12/2026',
                    templateUrl: branding?.certificateTemplateUrl,
                    coordinates: {
                      name: { x: Number(formData.get('nameX')), y: Number(formData.get('nameY')), size: Number(formData.get('nameSize')) },
                      jamb: { x: Number(formData.get('jambX')), y: Number(formData.get('jambY')), size: Number(formData.get('jambSize')) },
                      date: { x: Number(formData.get('dateX')), y: Number(formData.get('dateY')), size: Number(formData.get('dateSize')) },
                    }
                  })
                })
              }}
            >
              Download Preview
            </Button>
            <Button type="submit" loading={isPending}>Save Coordinates</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
