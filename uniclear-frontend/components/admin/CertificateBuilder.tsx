'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Move, Save, Eye } from 'lucide-react'

interface DraggableField {
  id: string
  label: string
  x: number
  y: number
  size: number
}

export function CertificateBuilder({ campaign }: { campaign: any }) {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [fields, setFields] = useState<DraggableField[]>([
    { id: 'name', label: 'Student Name', x: 50, y: 50, size: 28 },
    { id: 'jamb', label: 'JAMB Reg No', x: 50, y: 30, size: 14 },
    { id: 'date', label: 'Date of Issue', x: 50, y: 15, size: 12 },
  ])

  useEffect(() => {
    if (campaign?.customCertificateCoords) {
      const coords = campaign.customCertificateCoords
      setFields(prev => prev.map(f => ({
        ...f,
        x: coords[f.id]?.x ?? f.x,
        y: coords[f.id]?.y ?? f.y,
        size: coords[f.id]?.size ?? f.size,
      })))
    }
  }, [campaign])

  const { mutate: uploadCert, isPending: uploadingCert } = useMutation({
    mutationFn: (file: File) => campaignsApi.uploadCertificateTemplate(campaign.id, file),
    onSuccess: () => {
      toast.success('Certificate template uploaded')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      // A page reload or fetching specific campaign helps update the image. We'll just invalidate.
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const { mutate: saveCoords, isPending: savingCoords } = useMutation({
    mutationFn: () => {
      const coords = {
        name: { x: fields.find(f => f.id === 'name')?.x, y: fields.find(f => f.id === 'name')?.y, size: fields.find(f => f.id === 'name')?.size },
        jamb: { x: fields.find(f => f.id === 'jamb')?.x, y: fields.find(f => f.id === 'jamb')?.y, size: fields.find(f => f.id === 'jamb')?.size },
        date: { x: fields.find(f => f.id === 'date')?.x, y: fields.find(f => f.id === 'date')?.y, size: fields.find(f => f.id === 'date')?.size },
      }
      return campaignsApi.update(campaign.id, { customCertificateCoords: coords })
    },
    onSuccess: () => {
      toast.success('Coordinates saved successfully')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to save coordinates'),
  })

  // Visual drag logic
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    setActiveFieldId(id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    if (activeFieldId !== id || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Calculate percentages
    let newX = ((e.clientX - rect.left) / rect.width) * 100
    // Y is usually bottom-up in our coords for PDF, so 0 is bottom, 100 is top.
    let newY = (1 - (e.clientY - rect.top) / rect.height) * 100

    newX = Math.max(0, Math.min(100, newX))
    newY = Math.max(0, Math.min(100, newY))

    setFields(prev => prev.map(f => f.id === id ? { ...f, x: newX, y: newY } : f))
  }

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    setActiveFieldId(null)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const handleSizeChange = (id: string, val: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, size: Number(val) } : f))
  }

  const handlePreview = () => {
    import('@/lib/utils/pdf').then(({ generateCertificatePDF }) => {
      const coords = {
        name: { x: fields.find(f => f.id === 'name')?.x, y: fields.find(f => f.id === 'name')?.y, size: fields.find(f => f.id === 'name')?.size },
        jamb: { x: fields.find(f => f.id === 'jamb')?.x, y: fields.find(f => f.id === 'jamb')?.y, size: fields.find(f => f.id === 'jamb')?.size },
        date: { x: fields.find(f => f.id === 'date')?.x, y: fields.find(f => f.id === 'date')?.y, size: fields.find(f => f.id === 'date')?.size },
      }
      generateCertificatePDF({
        studentName: 'JOHN DOE SMITH',
        jambRegNo: '12345678AB',
        universityName: 'Test University',
        completedAt: '12/12/2026',
        templateUrl: campaign.customCertificateUrl,
        coordinates: coords as any
      })
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Visual Designer</h2>
          <Button variant="secondary" size="sm" loading={uploadingCert} onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Upload Template
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCert(f) }} />
        </div>
        
        <div 
          ref={containerRef}
          className="relative w-full aspect-[1.414] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center select-none"
          style={{
            backgroundImage: campaign.customCertificateUrl ? `url(${campaign.customCertificateUrl})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {!campaign.customCertificateUrl && <p className="text-gray-400 font-medium">No template uploaded. Please upload a template to begin.</p>}
          
          {campaign.customCertificateUrl && fields.map(field => (
            <div
              key={field.id}
              className="absolute transform -translate-x-1/2 translate-y-1/2 cursor-move group"
              style={{
                left: `${field.x}%`,
                bottom: `${field.y}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, field.id)}
              onPointerMove={(e) => handlePointerMove(e, field.id)}
              onPointerUp={(e) => handlePointerUp(e, field.id)}
            >
              <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded shadow-md whitespace-nowrap flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                <Move className="h-3 w-3" />
                {field.label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">Drag the blue labels to position the dynamic text on your certificate.</p>
      </Card>

      <Card className="p-4 space-y-6">
        <div>
          <h2 className="font-semibold text-lg border-b pb-2 mb-4">Coordinate Settings</h2>
          <div className="space-y-6">
            {fields.map(field => (
              <div key={field.id} className="space-y-3 bg-gray-50 p-3 rounded border">
                <div className="font-medium text-sm text-gray-800">{field.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="X (%)" value={field.x.toFixed(2)} readOnly className="bg-gray-100 cursor-not-allowed text-xs" />
                  <Input label="Y (%)" value={field.y.toFixed(2)} readOnly className="bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <Input label="Font Size" type="number" value={field.size} onChange={(e) => handleSizeChange(field.id, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t flex flex-col gap-3">
          <Button variant="secondary" onClick={handlePreview} className="w-full"><Eye className="h-4 w-4 mr-2" /> Download Preview</Button>
          <Button loading={savingCoords} onClick={() => saveCoords()} className="w-full"><Save className="h-4 w-4 mr-2" /> Save Coordinates</Button>
        </div>
      </Card>
    </div>
  )
}
