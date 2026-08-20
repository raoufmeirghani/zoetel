import * as React from 'react'
import { motion } from 'framer-motion'
import { Building2, Check, CircleCheck, Lock, Send, User } from 'lucide-react'
import { FlowDialog, FlowStep } from '@/components/ui/flow-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/feedback'
import { DocUploadCard, DOC_META } from './doc-upload'
import { useApp } from '@/store/app'
import { cn, sleep } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { useI18n } from '@/lib/i18n'

const STEPS = [
  { id: 'entity', label: 'Who you are' },
  { id: 'documents', label: 'Documents' },
  { id: 'submit', label: 'Review' },
]

const ENTITY_OPTIONS = [
  {
    value: 'individual' as const,
    icon: User,
    label: 'An individual',
    blurb: 'Numbers in your own name.',
    perks: ['Local and mobile ranges', 'ID check only', 'Usually under an hour'],
  },
  {
    value: 'business' as const,
    icon: Building2,
    label: 'A business',
    blurb: 'A registered company or organisation.',
    perks: ['Every range including toll-free', 'Higher channel limits', 'Volume pricing available'],
  },
]

/**
 * Verification as a stepped flow in a near-fullscreen sheet: decide the entity
 * type, upload what that type needs, then confirm. Splitting it out keeps the
 * page itself a status board rather than a wall of forms.
 */
export function VerificationFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const verification = useApp((s) => s.verification)
  const profile = useApp((s) => s.profile)
  const workspace = useApp((s) => s.workspace)
  const uploadDoc = useApp((s) => s.uploadDoc)
  const removeDoc = useApp((s) => s.removeDoc)
  const submitVerification = useApp((s) => s.submitVerification)
  const setAccountType = useApp((s) => s.setAccountType)

  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const [submitting, setSubmitting] = React.useState(false)

  const docs = verification.docs
  const uploaded = docs.filter((d) => d.status !== 'missing' && d.status !== 'rejected').length
  const allUploaded = uploaded === docs.length && docs.length > 0
  // Locked only while a submission is actually being reviewed. Once approved the
  // documents are editable again — registrations expire, details change — and
  // saving puts the account back into review.
  const readOnly = verification.stage === 'in_review'
  const approved = verification.stage === 'approved'

  // Reopening should land on the first thing still outstanding, not step one.
  const go = (next: number, dir: 1 | -1) => {
    setDirection(dir)
    setStep(next)
  }

  const submit = async () => {
    setSubmitting(true)
    await sleep(900)
    submitVerification()
    setSubmitting(false)
    onClose()
    toast.success(approved ? 'Documents resubmitted' : 'Documents submitted', {
      description: approved
        ? 'Your current approval stays active until the new review completes.'
        : 'Most reviews finish within 24 hours. We’ll email you.',
    })
  }

  return (
    <FlowDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={approved ? t('Update verification') : t('Account verification')}
      steps={STEPS}
      step={step}
      direction={direction}
      onStepClick={(i) => go(i, i < step ? -1 : 1)}
      footer={
        step === 0 ? (
          <>
            <span className="hidden text-sm text-ink-faint sm:block">
              This decides which documents the regulator needs.
            </span>
            <Button variant="primary" onClick={() => go(1, 1)}>
              {t('Continue')}
            </Button>
          </>
        ) : step === 1 ? (
          <>
            <Button variant="ghost" onClick={() => go(0, -1)}>
              {t('Back')}
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums text-ink-faint">
                {uploaded} of {docs.length} uploaded
              </span>
              <Button variant="primary" disabled={!allUploaded} onClick={() => go(2, 1)}>
                {t('Continue')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => go(1, -1)}>
              {t('Back')}
            </Button>
            <Button variant="primary" icon={<Send />} loading={submitting} onClick={submit}>
              {approved ? t('Resubmit for review') : t('Submit for review')}
            </Button>
          </>
        )
      }
    >
      {step === 0 && (
        <FlowStep
          title="What are we verifying?"
          lede="Regulators treat individuals and companies differently, so this decides which documents we need."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {ENTITY_OPTIONS.map((opt) => {
              const active = verification.accountType === opt.value
              return (
                <button
                  key={opt.value}
                  disabled={readOnly}
                  onClick={() => setAccountType(opt.value)}
                  className={cn(
                    'flex flex-col items-start gap-2.5 rounded-3xl p-5 text-start transition-colors',
                    active ? 'bg-brand-softer ring-1 ring-brand/40' : 'bg-veil hover:bg-veil-strong',
                    readOnly && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-10 place-items-center rounded-2xl',
                      active ? 'bg-brand text-brand-fg' : 'bg-surface text-ink-muted',
                    )}
                  >
                    <opt.icon className="size-[18px]" />
                  </span>
                  <span className="flex items-center gap-2 text-md font-medium text-ink">
                    {t(opt.label)}
                    {active && <Check className="size-4 text-brand" />}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-subtle">{opt.blurb}</span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {opt.perks.map((p) => (
                      <Badge key={p} tone={active ? 'brand' : 'neutral'} size="sm">
                        {p}
                      </Badge>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          {readOnly && (
            <p className="mt-4 text-xs text-ink-faint">
              Locked while your submission is being reviewed. Contact support if this is wrong.
            </p>
          )}
        </FlowStep>
      )}

      {step === 1 && (
        <FlowStep
          title="Upload your documents"
          lede="Encrypted in transit and at rest, visible only to the reviewer handling your case, and deleted when the review closes."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((doc, i) => (
              <DocUploadCard
                key={doc.kind}
                doc={doc}
                index={i}
                readOnly={readOnly}
                onUpload={(file) => uploadDoc(doc.kind, file)}
                onRemove={() => removeDoc(doc.kind)}
              />
            ))}
          </div>
        </FlowStep>
      )}

      {step === 2 && (
        <FlowStep
          title={approved ? t('Ready to resubmit') : t('Ready to submit')}
          lede={
            approved
              ? `Your current approval stays active until this review completes, so nothing stops working. Median turnaround is 6 hours; the ceiling is ${verification.estimatedHours}.`
              : `Reviews run in the order received. Median turnaround is 6 hours; the ceiling is ${verification.estimatedHours}.`
          }
        >
          <dl className="divide-y divide-line-soft">
            {[
              {
                label: t('Entity'),
                value: verification.accountType === 'business' ? workspace.businessName : profile.name,
              },
              {
                label: t('Type'),
                value: verification.accountType === 'business' ? 'Business' : 'Individual',
              },
              { label: t('Country'), value: workspace.country === 'EG' ? 'Egypt' : workspace.country },
              { label: t('Regulator'), value: workspace.country === 'EG' ? 'NTRA' : 'Local authority' },
              { label: t('Documents'), value: docs.map((d) => DOC_META[d.kind].label).join(' · ') },
            ].map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-6 py-3">
                <dt className="shrink-0 text-sm text-ink-subtle">{t(f.label)}</dt>
                <dd className="text-end text-base text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-7"
          >
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <Lock className="size-3" />
              {t('Your data')}
            </p>
            <ul className="space-y-2">
              {[
                'Encrypted in transit and at rest (AES-256)',
                'Visible only to the assigned reviewer',
                'Deleted when the review closes',
                'Never used for training or shared onward',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
                  <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          {!allUploaded && (
            <Alert tone="warning" compact className="mt-6">
              Some documents are still missing. Go back a step and finish those first.
            </Alert>
          )}
        </FlowStep>
      )}
    </FlowDialog>
  )
}
