import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  FileText,
  Lock,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { Hero, HERO_ART_OVERVIEW } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { StepList } from '@/components/ui/stepper'
import { Accordion, AccordionItem } from '@/components/ui/misc'
import { VerificationFlow } from './verification-flow'
import { useApp } from '@/store/app'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type Tone = 'brand' | 'warning' | 'success' | 'danger'

export default function VerificationPage() {
  const { t } = useI18n()
  const verification = useApp((s) => s.verification)
  const workspace = useApp((s) => s.workspace)
  const approveVerification = useApp((s) => s.approveVerification)
  const numbers = useApp((s) => s.numbers)

  const [flowOpen, setFlowOpen] = React.useState(false)

  const docs = verification.docs
  const uploaded = docs.filter((d) => d.status !== 'missing' && d.status !== 'rejected').length
  const heldNumbers = numbers.filter((n) => n.status === 'pending_verification')
  const stage = verification.stage

  /**
   * One status object drives the whole page — icon, headline, subtitle, action.
   * Everything else on the page is secondary to answering "where do I stand".
   */
  const status: {
    icon: LucideIcon
    tone: Tone
    title: string
    subtitle: string
    action: React.ReactNode
    note?: string
  } =
    stage === 'approved'
      ? {
          icon: ShieldCheck,
          tone: 'success',
          title: t('You’re verified'),
          subtitle: t(
            '{business} is cleared for every number range. We’ll only ask again if a registration document expires.',
            { business: workspace.businessName },
          ),
          action: (
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button variant="primary" size="lg" asChild>
                <Link to="/numbers/buy">
                  {t('Buy a regulated number')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {/* Approval isn't the end of the story: registrations expire and
                  details change, so the documents stay reachable and replaceable. */}
              <Button variant="secondary" size="lg" icon={<FileText />} onClick={() => setFlowOpen(true)}>
                {t('View or update documents')}
              </Button>
            </div>
          ),
          note: verification.reviewedAt
            ? t('Approved {when}', { when: relativeTime(verification.reviewedAt) })
            : undefined,
        }
      : stage === 'in_review'
        ? {
            icon: Clock,
            tone: 'warning',
            title: t('We’re reviewing your documents'),
            subtitle: t(
              'Nothing more is needed from you. Most reviews finish well inside {hours} hours, and your local numbers keep working while you wait.',
              { hours: verification.estimatedHours },
            ),
            action: (
              <Button
                variant="secondary"
                size="lg"
                icon={<Sparkles />}
                onClick={() => {
                  approveVerification()
                  toast.success('Verification approved', {
                    description: t('All number ranges are now available.'),
                  })
                }}
              >
                {t('Simulate approval')}
              </Button>
            ),
            note: verification.submittedAt
              ? t('Submitted {when}', { when: relativeTime(verification.submittedAt) })
              : undefined,
          }
        : stage === 'rejected'
          ? {
              icon: TriangleAlert,
              tone: 'danger',
              title: t('One document needs replacing'),
              subtitle: t(
                'A file couldn’t be read — usually an expired registration, a cropped edge, or glare on an ID photo. Replace it and you keep your place in the queue.',
              ),
              action: (
                <Button variant="primary" size="lg" icon={<RotateCcw />} onClick={() => setFlowOpen(true)}>
                  {t('Fix and resubmit')}
                </Button>
              ),
            }
          : {
              icon: ShieldCheck,
              tone: 'brand',
              title: uploaded > 0 ? t('Pick up where you left off') : t('Verify your account'),
              subtitle: t(
                'Telecom regulators hold the licensed carrier responsible for who uses a number. One check here unlocks every range, permanently — it takes about three minutes.',
              ),
              action: (
                <Button variant="primary" size="lg" onClick={() => setFlowOpen(true)}>
                  {uploaded > 0 ? t('Continue verification') : t('Start verification')}
                  <ArrowRight className="size-4" />
                </Button>
              ),
              note:
                uploaded > 0
                  ? t('{n} of {total} documents uploaded', { n: uploaded, total: docs.length })
                  : undefined,
            }

  const TONES: Record<Tone, { ring: string; chip: string; glow: string }> = {
    brand: { ring: 'bg-brand/10', chip: 'bg-brand text-brand-fg', glow: 'hsl(var(--brand))' },
    warning: { ring: 'bg-warning/10', chip: 'bg-warning text-white', glow: 'hsl(var(--warning))' },
    success: { ring: 'bg-success/10', chip: 'bg-success text-white', glow: 'hsl(var(--success))' },
    danger: { ring: 'bg-danger/10', chip: 'bg-danger text-white', glow: 'hsl(var(--danger))' },
  }
  const tone = TONES[status.tone]

  return (
    <>
      <Hero backdropImage={HERO_ART_OVERVIEW} mood="trust" size="sm" title={t('Verification')} />

      {/* ── The status board — icon, headline, subtitle, one action ── */}
      <Section className="pt-0">
        <div className="mx-auto max-w-xl py-6 text-center sm:py-12">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="relative mx-auto grid size-24 place-items-center"
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full opacity-40 blur-2xl"
              style={{ background: `radial-gradient(circle, ${tone.glow} 0%, transparent 68%)` }}
              aria-hidden
            />
            <span className={cn('absolute inset-0 rounded-[34px]', tone.ring)} />
            <span className={cn('absolute inset-3 rounded-[26px]', tone.ring)} />
            <span className={cn('relative grid size-14 place-items-center rounded-2xl shadow-sm', tone.chip)}>
              <status.icon className="size-7" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="headline mt-8 text-balance text-3xl text-ink sm:text-4xl"
          >
            {status.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-4 max-w-lg text-md leading-relaxed text-ink-muted"
          >
            {status.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            {status.action}
            {status.note && <p className="text-sm tabular-nums text-ink-faint">{status.note}</p>}
          </motion.div>

          {heldNumbers.length > 0 && stage !== 'approved' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              className="mt-10 rounded-3xl bg-warning-soft p-5 text-start"
            >
              <p className="flex items-center gap-2 text-base font-medium text-warning-ink">
                <TriangleAlert className="size-4 shrink-0" />
                {heldNumbers.length} {heldNumbers.length === 1 ? 'number is' : 'numbers are'} waiting on this
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-warning-ink/85">
                {heldNumbers.map((n) => n.e164).join(', ')} {heldNumbers.length === 1 ? 'is' : 'are'} reserved
                for you but can’t route calls yet. You aren’t billed while they’re held.
              </p>
            </motion.div>
          )}
        </div>
      </Section>

      <div className="space-y-5">
        {/* ── Where it stands, as a quiet four-beat summary ── */}
        {stage !== 'approved' && (
          <Section eyebrow={t('The process')} title={t('What happens after you submit')} divided index={0}>
            <div className="max-w-xl">
              <StepList
                steps={[
                  {
                    label: t('Upload your documents'),
                    description: t('{n} of {total} complete', { n: uploaded, total: docs.length }),
                    state: uploaded === docs.length && docs.length > 0 ? 'done' : 'active',
                  },
                  {
                    label: t('Automated checks'),
                    description: t('OCR and sanctions screening'),
                    state: stage === 'in_review' ? 'done' : 'pending',
                  },
                  {
                    label: t('Compliance review'),
                    description: t('Typically within 6 hours'),
                    state: stage === 'in_review' ? 'active' : 'pending',
                  },
                  { label: t('All ranges unlocked'), state: 'pending' },
                ]}
              />
            </div>
          </Section>
        )}

        {/* ── Questions ────────────────────────────────── */}
        <Section eyebrow={t('Before you ask')} title={t('Common questions')} divided index={1}>
          <Accordion type="single" collapsible>
            <AccordionItem value="why" title="Why does telecom need this at all?" icon={<ShieldCheck />}>
              Phone numbers are a regulated national resource. In Egypt the NTRA — like Ofcom in the UK or the
              FCC in the US — holds the licensed carrier responsible for who uses each number, which is why
              identity or business verification is required before certain ranges can be provisioned. Verifying
              once means we can turn numbers on in seconds instead of routing every order through a manual
              carrier request.
            </AccordionItem>
            <AccordionItem value="ranges" title="Which numbers can I buy before verifying?" icon={<ScanLine />}>
              Local geographic numbers in most countries are available immediately. National short codes,
              toll-free ranges and A2P-enabled mobile numbers all require a verified entity. Every range is
              labelled in the marketplace, so there are no surprises at checkout.
            </AccordionItem>
            <AccordionItem value="data" title="What happens to my documents?" icon={<Lock />}>
              They're encrypted in transit and at rest, visible only to the compliance reviewer handling your
              case, and deleted from our systems once the review closes. We keep the outcome and the extracted
              registration number — never the file.
            </AccordionItem>
            <AccordionItem value="reject" title="What if something is rejected?" icon={<TriangleAlert />}>
              We tell you exactly which document and why, and you keep your position in the queue. The usual
              causes are an expired registration, a cropped edge, or glare on an ID photo.
            </AccordionItem>
            <AccordionItem value="expiry" title="Will I have to do this again?" icon={<Clock />}>
              Only if a document expires. We notify you 30 days before your commercial registration or licence
              lapses so nothing gets suspended.
            </AccordionItem>
          </Accordion>
        </Section>
      </div>

      <VerificationFlow open={flowOpen} onClose={() => setFlowOpen(false)} />
    </>
  )
}
