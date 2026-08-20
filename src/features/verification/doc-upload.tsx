import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CircleCheck,
  CloudUpload,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  ScanLine,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { bytes, relativeTime } from '@/lib/format'
import { cn, sleep } from '@/lib/utils'
import type { DocKind, VerificationDoc } from '@/lib/types'
import { toast } from '@/components/ui/toast'
import { useI18n } from '@/lib/i18n'

export const DOC_META: Record<DocKind, { label: string; hint: string; accept: string; example: string }> = {
  passport: {
    label: 'Passport',
    hint: 'Photo page showing the machine-readable zone.',
    accept: 'image/*,.pdf',
    example: 'JPG, PNG or PDF · max 10 MB',
  },
  national_id: {
    label: 'National ID',
    hint: 'Both sides, in one file or two uploads.',
    accept: 'image/*,.pdf',
    example: 'JPG, PNG or PDF · max 10 MB',
  },
  commercial_registration: {
    label: 'Commercial registration',
    hint: 'Issued within the last 12 months.',
    accept: '.pdf,image/*',
    example: 'PDF preferred · max 10 MB',
  },
  tax_certificate: {
    label: 'Tax certificate',
    hint: 'Tax card showing your registered tax ID.',
    accept: '.pdf,image/*',
    example: 'PDF preferred · max 10 MB',
  },
  business_license: {
    label: 'Business licence',
    hint: 'Trade or operating licence for your activity.',
    accept: '.pdf,image/*',
    example: 'PDF preferred · max 10 MB',
  },
  representative_id: {
    label: 'Authorised representative ID',
    hint: "Passport or national ID of the person signing on the company's behalf.",
    accept: 'image/*,.pdf',
    example: 'JPG, PNG or PDF · max 10 MB',
  },
  proof_of_address: {
    label: 'Proof of address',
    hint: 'Utility bill or bank statement from the last 3 months.',
    accept: '.pdf,image/*',
    example: 'PDF preferred · max 10 MB',
  },
}

export function DocUploadCard({
  doc,
  onUpload,
  onRemove,
  index = 0,
  readOnly,
}: {
  doc: VerificationDoc
  onUpload: (file: { name: string; size: number }) => void
  onRemove: () => void
  index?: number
  readOnly?: boolean
}) {
  const { t, tNode } = useI18n()
  const meta = DOC_META[doc.kind]
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [progress, setProgress] = React.useState<number | null>(null)
  const [scanning, setScanning] = React.useState(false)

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('File is too large'), { description: t('Documents must be under 10 MB.') })
      return
    }
    setProgress(0)
    for (let p = 0; p <= 100; p += 20) {
      setProgress(p)
      await sleep(110)
    }
    setProgress(null)
    setScanning(true)
    await sleep(900)
    setScanning(false)
    onUpload({ name: file.name, size: file.size })
    toast.success(t('{doc} uploaded', { doc: t(meta.label) }), {
      description: t('We extracted the key fields for you to confirm.'),
    })
  }

  const uploaded = doc.status !== 'missing'
  const isImage = doc.fileName ? /\.(jpe?g|png|webp|heic)$/i.test(doc.fileName) : false

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-3xl transition-colors duration-200',
        doc.status === 'rejected'
          ? 'bg-danger-soft/60 ring-1 ring-danger/25'
          : dragging
            ? 'bg-brand-softer ring-1 ring-brand/50'
            : 'veil',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={meta.accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-xl transition-colors',
              doc.status === 'approved'
                ? 'bg-success-soft text-success'
                : doc.status === 'rejected'
                  ? 'bg-danger-soft text-danger'
                  : uploaded
                    ? 'bg-info-soft text-info'
                    : 'bg-surface/80 text-ink-faint',
            )}
          >
            {doc.status === 'approved' ? (
              <CircleCheck className="size-[18px]" />
            ) : doc.status === 'rejected' ? (
              <TriangleAlert className="size-[18px]" />
            ) : isImage ? (
              <ImageIcon className="size-[18px]" />
            ) : (
              <FileText className="size-[18px]" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold text-ink">{t(meta.label)}</h4>
              {doc.status === 'approved' && (
                <Badge tone="success" size="sm">
                  {t('Approved')}
                </Badge>
              )}
              {doc.status === 'submitted' && (
                <Badge tone="info" size="sm">
                  {t('In review')}
                </Badge>
              )}
              {doc.status === 'rejected' && (
                <Badge tone="danger" size="sm">
                  {t('Resubmit')}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-subtle">{t(meta.hint)}</p>
          </div>

          {uploaded && !readOnly && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-ink-faint hover:text-danger"
              onClick={onRemove}
              aria-label={t('Remove {name}', { name: t(meta.label) })}
            >
              <Trash2 />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {progress != null ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <Progress value={progress} size="sm" />
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-subtle">
                <LoaderCircle className="size-3 animate-spin" />
                Uploading… {progress}%
              </p>
            </motion.div>
          ) : scanning ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative mt-4 overflow-hidden rounded-2xl bg-surface/70 p-4"
            >
              <motion.span
                className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-brand/20 to-transparent"
                initial={{ y: -64 }}
                animate={{ y: 120 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="relative flex items-center gap-2 text-sm font-medium text-ink">
                <ScanLine className="size-4 text-brand" />
                Reading the document…
              </p>
            </motion.div>
          ) : uploaded ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2.5 rounded-2xl bg-surface/70 p-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted shadow-xs">
                  {isImage ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{doc.fileName}</p>
                  <p className="text-xs tabular-nums text-ink-faint">
                    {doc.sizeBytes ? bytes(doc.sizeBytes) : ''}
                    {doc.uploadedAt ? ` · ${relativeTime(doc.uploadedAt)}` : ''}
                  </p>
                </div>
                {!readOnly && (
                  <Button variant="ghost" size="xs" onClick={() => inputRef.current?.click()}>
                    {t('Replace')}
                  </Button>
                )}
              </div>

              {doc.ocr && doc.ocr.length > 0 && (
                <div className="mt-2.5 rounded-2xl bg-surface/70 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-faint">
                    <ScanLine className="size-3" />
                    Extracted automatically
                  </p>
                  <dl className="space-y-1">
                    {doc.ocr.map((f) => (
                      <div key={f.field} className="flex items-center justify-between gap-3 text-sm">
                        <dt className="text-ink-subtle">{f.field}</dt>
                        <dd className="flex items-center gap-1.5">
                          <span className="font-medium text-ink">{f.value}</span>
                          <span
                            className={cn(
                              'text-2xs tabular-nums',
                              f.confidence > 0.95 ? 'text-success' : 'text-warning',
                            )}
                          >
                            {Math.round(f.confidence * 100)}%
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {doc.rejectionReason && (
                <p className="mt-2.5 flex items-start gap-2 rounded-2xl bg-danger-soft p-3 text-sm text-danger-ink">
                  <TriangleAlert className="mt-px size-4 shrink-0" />
                  {doc.rejectionReason}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.button
              key="drop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const f = e.dataTransfer.files?.[0]
                if (f) handleFile(f)
              }}
              disabled={readOnly}
              className={cn(
                'mt-4 flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed px-4 py-7 transition-colors',
                dragging
                  ? 'border-brand bg-brand/5'
                  : 'border-line-strong hover:border-brand/50 hover:bg-surface/60',
                readOnly && 'pointer-events-none opacity-50',
              )}
            >
              <CloudUpload className={cn('size-5', dragging ? 'text-brand' : 'text-ink-faint')} />
              <span className="text-sm font-medium text-ink">
                {tNode('Drop a file or {browse}', {
                  browse: (
                    <span key="browse" className="text-brand-ink">
                      {t('browse')}
                    </span>
                  ),
                })}
              </span>
              <span className="text-xs text-ink-faint">{t(meta.example)}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
