import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  MapPin,
  Network,
  PartyPopper,
  Phone,
  Siren,
  UserRound,
  Webhook,
  PhoneForwarded,
} from 'lucide-react'
import { Hero } from '@/components/canvas/hero'
import { DestinationPicker, type DestinationId } from '@/components/shared/destination-picker'
import { ZoieHandoff } from '@/components/shared/zoie-handoff'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/inputs-special'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/feedback'
import { Section } from '@/components/canvas/section'
import { formatE164 } from '@/lib/format'
import { useApp } from '@/store/app'
import { toast } from '@/components/ui/toast'
import { cn, sleep } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { useDirSign, useI18n } from '@/lib/i18n'

const EASE = [0.16, 1, 0.3, 1] as const

interface Step {
  id: string
  label: string
  question: string
  why: string
  icon: LucideIcon
  optional?: boolean
}

const STEPS: Step[] = [
  {
    id: 'routing',
    label: 'Routing',
    question: 'Where should calls to this number go?',
    why: 'Until this is set, anyone calling the number hears a rejection. Everything else can wait.',
    icon: Network,
  },
  {
    id: 'callerId',
    label: 'Caller ID',
    question: 'What name should people see?',
    why: 'Outbound calls from an unnamed number get answered far less often.',
    icon: UserRound,
    optional: true,
  },
  {
    id: 'emergency',
    label: 'Address',
    question: 'Where is this number physically used?',
    why: 'Emergency services need somewhere to dispatch to. Without it, 122 and 123 are blocked.',
    icon: MapPin,
  },
]

/**
 * The post-purchase flow. One question per screen, in the order that actually
 * matters, rather than dropping the customer into a settings page.
 */
export default function NumberSetupPage() {
  const { t } = useI18n()
  const dirSign = useDirSign()
  const { id } = useParams<{ id: string }>()
  const number = useApp((s) => s.numbers.find((n) => n.id === id))
  const connections = useApp((s) => s.connections)
  const updateNumber = useApp((s) => s.updateNumber)

  const [step, setStep] = React.useState(0)
  const [dir, setDir] = React.useState(1)
  const [saving, setSaving] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const [dest, setDest] = React.useState<DestinationId | undefined>(
    number?.connectionId ? 'sip' : number?.webhookUrl ? 'webhook' : number?.forwardTo ? 'forward' : undefined,
  )
  const [connectionId, setConnectionId] = React.useState(number?.connectionId ?? 'none')
  const [webhookUrl, setWebhookUrl] = React.useState(number?.webhookUrl ?? '')
  const [forwardTo, setForwardTo] = React.useState(number?.forwardTo ?? '')
  const [forwardTimeout, setForwardTimeout] = React.useState(number?.forwardTimeout ?? 25)
  const [forwardFallback, setForwardFallback] = React.useState<'voicemail' | 'busy' | 'hangup'>(
    number?.forwardFallback ?? 'voicemail',
  )
  const [callerIdName, setCallerIdName] = React.useState(number?.callerIdName ?? '')
  const [address, setAddress] = React.useState(number?.emergencyAddress ?? '')

  if (!number) {
    return (
      <>
        <Hero mood="quiet" size="sm" title={t('Number not found')} />
        <Section className="pt-4">
          <EmptyState
            icon={<Phone />}
            title={t("That number isn't in this workspace")}
            action={
              <Button variant="primary" asChild>
                <Link to="/numbers">Back to phone numbers</Link>
              </Button>
            }
          />
        </Section>
      </>
    )
  }

  const current = STEPS[step]

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const commitStep = () => {
    if (current.id === 'routing') {
      // Commit the chosen destination and clear the others.
      updateNumber(number.id, {
        connectionId: dest === 'sip' && connectionId !== 'none' ? connectionId : undefined,
        webhookUrl: dest === 'webhook' ? webhookUrl || undefined : undefined,
        forwardTo: dest === 'forward' ? forwardTo || undefined : undefined,
        // Picking forwarding as the destination means forward everything; the
        // number's Forwarding tab is where the conditional modes live.
        forwardWhen: dest === 'forward' ? 'always' : undefined,
        forwardTimeout: dest === 'forward' ? forwardTimeout : undefined,
        forwardFallback: dest === 'forward' ? forwardFallback : undefined,
      })
    }
    if (current.id === 'callerId') {
      updateNumber(number.id, { callerIdName: callerIdName || undefined, cnamEnabled: !!callerIdName })
    }
    if (current.id === 'emergency') {
      updateNumber(number.id, { emergencyAddress: address || undefined })
    }
  }

  const next = async () => {
    commitStep()
    if (step < STEPS.length - 1) {
      go(step + 1)
      return
    }
    setSaving(true)
    await sleep(700)
    setSaving(false)
    setDone(true)
    toast.success('This number is ready', { description: formatE164(number.e164) })
  }

  const canAdvance =
    current.id === 'routing'
      ? dest === 'sip'
        ? connectionId !== 'none'
        : dest === 'webhook'
          ? webhookUrl.length > 8
          : dest === 'forward'
            ? forwardTo.replace(/\D/g, '').length > 8
            : // An agent is configured over in Zoie, so this step is satisfied
              // once that's the chosen destination.
              dest === 'zoie'
      : current.id === 'emergency'
        ? address.trim().length > 6
        : true

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 17 }}
          className="relative mx-auto grid size-20 place-items-center"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success/25" />
          <span className="relative grid size-16 place-items-center rounded-[26px] bg-success-soft text-success">
            <PartyPopper className="size-8" />
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.45, ease: EASE }}
        >
          <h1 className="headline mt-8 text-3xl text-ink">This number is live</h1>
          <p className="mx-auto mt-4 max-w-sm text-md leading-relaxed text-ink-muted">
            {formatE164(number.e164)} is routing calls. Place a test call to hear it for yourself.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45, ease: EASE }}
          className="mt-9 flex flex-col gap-2.5"
        >
          <Button variant="primary" size="xl" asChild>
            <Link to={`/numbers/${number.id}`}>
              {t('Open the number')}
              <ArrowRight className="size-[18px]" />
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link to="/numbers">All phone numbers</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Hero
        size="sm"
        breadcrumbs={[
          { label: t('Phone numbers'), href: '/numbers' },
          { label: formatE164(number.e164), href: `/numbers/${number.id}` },
          { label: t('Setup') },
        ]}
        eyebrow={
          <>
            <span className="eyebrow">
              Step {step + 1} of {STEPS.length}
            </span>
            {current.optional && (
              <>
                <span className="text-ink-faint" aria-hidden>
                  ·
                </span>
                <span className="eyebrow">{t('Optional')}</span>
              </>
            )}
          </>
        }
        title={t("Let's get this number working")}
        lede={t('Three short questions for {number}. You can change any of it later.', {
          number: formatE164(number.e164),
        })}
      >
        {/* Trail */}
        <ol className="flex items-center gap-2 pb-2">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => i <= step && go(i)}
                disabled={i > step}
                className={cn(
                  'flex items-center gap-2 rounded-full py-1 pe-3 ps-1 text-xs font-medium transition-colors',
                  i === step
                    ? 'bg-veil-strong text-ink'
                    : i < step
                      ? 'text-ink-muted hover:text-ink'
                      : 'text-ink-faint',
                )}
              >
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full',
                    i < step
                      ? 'bg-brand/85 text-brand-fg'
                      : i === step
                        ? 'bg-brand text-brand-fg'
                        : 'bg-veil-strong',
                  )}
                >
                  {i < step ? (
                    <Check className="size-3" strokeWidth={3.2} />
                  ) : (
                    <span className="text-[10px]">{i + 1}</span>
                  )}
                </span>
                {t(s.label)}
              </button>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line-soft" />}
            </li>
          ))}
        </ol>
      </Hero>

      <div className="mx-auto max-w-xl pb-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 * dirSign }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 * dirSign }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span className="bg-brand/12 grid size-11 place-items-center rounded-2xl text-brand">
              <current.icon className="size-5" />
            </span>
            <h2 className="headline mt-5 text-2xl text-ink">{current.question}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">{current.why}</p>

            <div className="mt-8 space-y-6">
              {current.id === 'routing' && (
                <>
                  <DestinationPicker exclude={['later']} value={dest} onSelect={setDest} />

                  {dest === 'zoie' && <ZoieHandoff number={number.e164} />}

                  {dest === 'sip' && (
                    <>
                      <Field label={t('SIP connection')} description={t('The trunk that receives the call.')}>
                        <Select value={connectionId} onValueChange={setConnectionId}>
                          <SelectTrigger size="lg">
                            <SelectValue placeholder={t('Choose a connection')} />
                          </SelectTrigger>
                          <SelectContent>
                            {connections.map((c) => (
                              <SelectItem key={c.id} value={c.id} hint={c.region}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      {connections.length === 0 && (
                        <p className="text-sm text-ink-subtle">
                          No connections yet —{' '}
                          <Link
                            to="/sip?new=1"
                            className="font-medium text-brand-ink underline underline-offset-4"
                          >
                            create one
                          </Link>{' '}
                          or pick another destination above.
                        </p>
                      )}
                    </>
                  )}

                  {dest === 'webhook' && (
                    <Field
                      label={t('Voice webhook')}
                      description={t('We POST call events here so your code can decide what happens.')}
                    >
                      <Input
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://api.yourapp.com/voice"
                        leading={<Webhook />}
                        inputSize="lg"
                      />
                    </Field>
                  )}

                  {dest === 'forward' && (
                    <>
                      <Field
                        label={t('Forward to')}
                        description={t(
                          'Calls are bridged to this number. Your Zoetel number stays the caller ID.',
                        )}
                      >
                        <Input
                          value={forwardTo}
                          onChange={(e) => setForwardTo(e.target.value)}
                          placeholder="+20 100 000 0000"
                          leading={<PhoneForwarded />}
                          inputSize="lg"
                          className="font-mono"
                        />
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label={t('Ring for')} description={t('How long to try before falling back.')}>
                          <NumberInput
                            value={forwardTimeout}
                            onChange={setForwardTimeout}
                            min={5}
                            max={120}
                            step={5}
                            suffix="sec"
                          />
                        </Field>
                        <Field label={t('If nobody answers')} description={t('What the caller hears instead.')}>
                          <Select
                            value={forwardFallback}
                            onValueChange={(v) => setForwardFallback(v as typeof forwardFallback)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="voicemail" hint={t('Recorded and emailed')}>
                                {t('Send to voicemail')}
                              </SelectItem>
                              <SelectItem value="busy" hint={t('Caller hears engaged tone')}>
                                {t('Return busy')}
                              </SelectItem>
                              <SelectItem value="hangup" hint={t('Call simply ends')}>
                                {t('Hang up')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </>
                  )}
                </>
              )}

              {current.id === 'callerId' && (
                <>
                  <Field label={t('Caller ID name')} hint={`${callerIdName.length}/15`}>
                    <Input
                      value={callerIdName}
                      onChange={(e) => setCallerIdName(e.target.value.slice(0, 15))}
                      placeholder={'Acme Retail'}
                      inputSize="lg"
                      autoFocus
                    />
                  </Field>
                  <div className="rounded-3xl bg-veil p-5">
                    <p className="eyebrow mb-3">What they'll see</p>
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-full bg-ink/5 text-lg">📱</span>
                      <div className="min-w-0">
                        <p className="truncate text-md font-medium text-ink">
                          {callerIdName || 'Unknown caller'}
                        </p>
                        <p className="truncate text-sm tabular-nums text-ink-subtle">{number.e164}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {current.id === 'emergency' && (
                <>
                  <Field label={t('Registered service address')}>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={'12 Road 90, New Cairo, Cairo'}
                      leading={<MapPin />}
                      inputSize="lg"
                      autoFocus
                    />
                  </Field>
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-subtle">
                    <Siren className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    We only share this with emergency dispatch, and only when an emergency call is placed.
                  </p>
                </>
              )}
            </div>

            <div className="mt-10 flex items-center gap-2">
              {step > 0 ? (
                <Button variant="ghost" size="lg" icon={<ArrowLeft />} onClick={() => go(step - 1)}>
                  {t('Back')}
                </Button>
              ) : (
                <Button variant="ghost" size="lg" asChild className="text-ink-subtle">
                  <Link to={`/numbers/${number.id}`}>Skip setup</Link>
                </Button>
              )}
              <div className="ms-auto flex items-center gap-2">
                {current.optional && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => (step < STEPS.length - 1 ? go(step + 1) : next())}
                  >
                    {t('Not now')}
                  </Button>
                )}
                <Button variant="primary" size="lg" onClick={next} disabled={!canAdvance} loading={saving}>
                  {step === STEPS.length - 1 ? t('Finish') : t('Continue')}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

            {!canAdvance && current.id === 'routing' && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
                <CircleCheck className="size-3" />
                {dest === 'sip'
                  ? 'Choose a SIP connection to continue.'
                  : dest === 'webhook'
                    ? 'Enter a webhook URL to continue.'
                    : dest === 'forward'
                      ? 'Enter the number to forward to.'
                      : 'Choose where calls should go to continue.'}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
