import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, UploadCloud, X, Loader2 } from 'lucide-react'
import type { ClearanceRequest, Document } from '@/types'

interface ClearanceSubmissionPanelProps {
  request: ClearanceRequest
  documents: Document[]
  onUploadDocument: (file: File, documentTypeId: string) => Promise<void>
  onDeleteDocument: (documentId: string) => Promise<void>
  onSubmitStage: () => Promise<void>
}

export function ClearanceSubmissionPanel({
  request,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onSubmitStage,
}: ClearanceSubmissionPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  if (!request.currentStage) {
    return null
  }

  const requirements = request.currentStage.documentRequirements || []
  const requiredCount = requirements.filter(r => r.isRequired).length
  const uploadedRequiredCount = requirements.filter(r => 
    r.isRequired && documents.some(d => d.documentTypeId === r.documentTypeId)
  ).length

  const canSubmit = requiredCount === uploadedRequiredCount && requirements.length > 0

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, typeId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingId(typeId)
      await onUploadDocument(file, typeId)
    } finally {
      setUploadingId(null)
      e.target.value = '' // reset input
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmitStage()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stage: {request.currentStage.name}</CardTitle>
        <CardDescription>
          Upload all required documents to proceed.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {requirements.map((req) => {
          const doc = documents.find(d => d.documentTypeId === req.documentTypeId)
          
          return (
            <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="flex flex-col">
                <span className="font-medium flex items-center gap-2">
                  {req.documentType.name}
                  {req.isRequired && <span className="text-red-500 text-xs font-bold">*</span>}
                </span>
                {doc && (
                  <span className="text-sm text-[var(--color-muted)] truncate max-w-[200px]" title={doc.fileName}>
                    {doc.fileName}
                  </span>
                )}
              </div>
              
              <div>
                {doc ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" data-testid="check-icon" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      aria-label="Delete document"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild disabled={uploadingId === req.documentTypeId}>
                      <span>
                        {uploadingId === req.documentTypeId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </span>
                    </Button>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, req.documentTypeId)}
                      disabled={uploadingId === req.documentTypeId}
                      data-testid={`file-input-${req.documentTypeId}`}
                    />
                  </label>
                )}
              </div>
            </div>
          )
        })}
        {requirements.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No documents required for this stage.</p>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          size="lg" 
          disabled={!canSubmit || isSubmitting} 
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Submit for Review
        </Button>
      </CardFooter>
    </Card>
  )
}
