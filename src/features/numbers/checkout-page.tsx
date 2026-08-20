import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Lock,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { Hero } from '@/components/canvas/hero'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { DestinationPicker } from '@/components/shared/destination-picker'
import { openZoie, useZoieContext } from '@/lib/zoie'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, EmptyState } from '@/components/ui/feedback'
import { Separator } from '@/components/ui/misc'
import { CapabilityPills } from '@/components/shared/capability-pills'
import { Checkbox } from '@/components/ui/toggle'
import { NUMBER_TYPE_META, countryByCode } from '@/lib/data/countries'
import { formatE164, money } from '@/lib/format'
import { useApp } from '@/store/app'
import { cn, sleep } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { Progress } from '@/components/ui/progress'
import { TopUpDialog } from '@/features/billing/top-up-dialog'
import type { OwnedNumber } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

type Phase = 'review' | 'provisioning' | 'done'

const PROVISION_STEPS = [
  'Reserving numbers with the carrier',
  'Registering routes on the voice edge',
  'Applying caller ID and compliance records',
  'Activating on your workspace',
]

export default function CheckoutPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const zoie = useZoieContext()
  const cart = useApp((s) => s.cart)
  const removeFromCart = useApp((s) => s.removeFromCart)
  const purchaseNumbers = useApp((s) => s.purchaseNumbers)
  const balance = useApp((s) => s.balance)
  const currency = useApp((s) => s.workspace.currency)
  const kycStage = useApp((s) => s.verification.stage)

  const [phase, setPhase] = React.useState<Phase>('review')
  const [stepIndex, setStepIndex] = React.useState(0)
  const [purchased, setPurchased] = React.useState<OwnedNumber[]>([])
  const [charged, setCharged] = React.useState(0)
  const [agree, setAgree] = React.useState(true)
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  const monthly = cart.reduce((s, n) => s + n.monthly, 0)
  const setup = cart.reduce((s, n) => s + n.setup, 0)
  const subtotal = monthly + setup
  const vat = subtotal * 0.14
  const total = subtotal + vat
  const insufficient = total > balance
  const needsDocs = cart.some((n) => n.requiresRegulatoryDocs) && kycStage !== 'approved'

  const confirm = async () => {
    setPhase('provisioning')
    for (let i = 0; i < PROVISION_STEPS.length; i++) {
      setStepIndex(i)
      await sleep(560)
    }
    setCharged(total)
    const owned = purchaseNumbers(cart)
    setPurchased(owned)
    setPhase('done')
    toast.success(owned.length === 1 ? 'Number activated' : `${owned.length} numbers activated`, {
      description: t('Assign a SIP connection to start taking calls.'),
    })
  }

  if (cart.length === 0 && phase === 'review') {
    return (
      <>
        <Hero
          size="sm"
          breadcrumbs={[
            { label: t('Phone numbers'), href: '/numbers' },
            { label: t('Buy'), href: '/numbers/buy' },
            { label: t('Checkout') },
          ]}
          title={t('Nothing selected yet')}
        />
        <Section className="pt-2">
          <EmptyState
            icon={<Phone />}
            title={t('Nothing selected yet')}
            description={t(
              "Pick one or more numbers from the marketplace and they'll show up here with a full cost breakdown before anything is charged.",
            )}
            action={
              <Button variant="primary" asChild icon={<Plus />}>
                <Link to="/numbers/buy">
                  <Plus className="size-4" />
                  {t('Browse numbers')}
                </Link>
              </Button>
            }
          />
        </Section>
      </>
    )
  }

  if (phase === 'provisioning') {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-md flex-col items-center justify-center text-center">
        <div className="relative mb-8 grid size-20 place-items-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/25" />
          <span className="absolute inset-2 animate-pulse-ring rounded-full bg-brand/20 [animation-delay:0.6s]" />
          <span className="relative grid size-14 place-items-center rounded-2xl bg-brand text-brand-fg shadow-brand">
            <Phone className="size-6" />
          </span>
        </div>
        <h1 className="headline text-3xl text-ink">Provisioning your numbers</h1>
        <p className="mt-2 text-base text-ink-subtle">This usually takes about five seconds.</p>
        <Progress value={((stepIndex + 1) / PROVISION_STEPS.length) * 100} className="mt-8 w-full" />
        <ul className="mt-6 w-full space-y-2 text-start">
          {PROVISION_STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-base transition-colors duration-300',
                i < stepIndex && 'text-ink-subtle',
                i === stepIndex && 'bg-surface text-ink shadow-xs',
                i > stepIndex && 'text-ink-faint',
              )}
            >
              {i < stepIndex ? (
                <CircleCheck className="size-4 shrink-0 text-success" />
              ) : i === stepIndex ? (
                <span className="grid size-4 shrink-0 place-items-center">
                  <span className="size-2 animate-ping rounded-full bg-brand" />
                </span>
              ) : (
                <span className="size-4 shrink-0 rounded-full border border-line" />
              )}
              {s}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="mx-auto max-w-lg py-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 17 }}
          className="mx-auto grid size-16 place-items-center rounded-3xl bg-success-soft text-success"
        >
          <CircleCheck className="size-8" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <h1 className="display text-3xl font-semibold text-ink">
            {purchased.length === 1 ? 'Your number is live' : `${purchased.length} numbers are live`}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-md leading-relaxed text-ink-subtle">
            {purchased.some((n) => n.status === 'pending_verification')
              ? 'Some ranges are held until verification clears. Everything else is ready for traffic now.'
              : 'They are routable right now. Point them at a SIP connection or webhook to start taking calls.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <div className="mt-8 divide-y divide-line-soft rounded-3xl bg-veil">
            {purchased.map((n) => (
              <Link
                key={n.id}
                to={`/numbers/${n.id}`}
                className="flex items-center gap-3 p-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-2"
              >
                <CarrierAvatar carrier={n.carrier} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="tnum truncate font-mono text-sm font-medium text-ink">{formatE164(n.e164)}</p>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    {NUMBER_TYPE_META[n.type].label} · {n.city} · {countryByCode(n.country).name}
                  </p>
                </div>
                {n.status === 'pending_verification' ? (
                  <Badge tone="warning">Pending docs</Badge>
                ) : (
                  <Badge tone="success">Active</Badge>
                )}
                <ArrowRight className="size-4 shrink-0 text-ink-faint" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* A live number that does nothing is the real end of the purchase, so
            the success screen asks the next question instead of congratulating. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-10"
        >
          <DestinationPicker
            question={purchased.length === 1 ? t('What should answer it?') : t('What should answer them?')}
            lede="You can change this at any time, and nothing rings until you pick."
            onSelect={(id) => {
              const first = purchased[0]
              if (id === 'zoie') {
                openZoie('voice-agent', zoie, { number: first?.e164 })
                return
              }
              if (id === 'later') {
                navigate('/numbers')
                return
              }
              navigate(`/numbers/${first?.id ?? ''}/setup`)
            }}
          />
        </motion.div>

        <p className="mt-8 text-center text-xs text-ink-faint">
          {t('A receipt for {amount} was added to your billing history.', { amount: money(charged, currency) })}
        </p>
      </div>
    )
  }

  return (
    <>
      <Hero
        size="sm"
        breadcrumbs={[
          { label: t('Phone numbers'), href: '/numbers' },
          { label: t('Buy'), href: '/numbers/buy' },
          { label: t('Checkout') },
        ]}
        title={
          cart.length === 1
            ? t('One number, then you’re live')
            : t('{n} numbers, then you’re live', { n: cart.length })
        }
        lede={t('Nothing is charged until you confirm. Numbers activate immediately after.')}
        actions={
          <Button variant="ghost" asChild icon={<ArrowLeft />}>
            <Link to="/numbers/buy">
              <ArrowLeft className="size-4" />
              {t('Keep browsing')}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Section
            eyebrow={t('In your order')}
            title={cart.length === 1 ? t('One number') : t('{n} numbers', { n: cart.length })}
          >
            <ul className="divide-y divide-line-soft">
              {cart.map((n) => (
                <motion.li
                  key={n.id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-3 px-5 py-4"
                >
                  <CarrierAvatar carrier={n.carrier} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="tnum font-mono text-sm font-medium text-ink">{formatE164(n.e164)}</p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {NUMBER_TYPE_META[n.type].label} · {n.city} · {countryByCode(n.country).name}
                    </p>
                  </div>
                  <CapabilityPills capabilities={n.capabilities} size="sm" className="hidden sm:flex" />
                  <div className="text-end">
                    <p className="text-base font-medium tabular-nums text-ink">
                      {money(n.monthly, currency)}/mo
                    </p>
                    {n.setup > 0 && (
                      <p className="text-xs tabular-nums text-ink-faint">+{money(n.setup, currency)} setup</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-ink-faint hover:text-danger"
                    onClick={() => removeFromCart(n.id)}
                    aria-label={t('Remove {name}', { name: n.e164 })}
                  >
                    <Trash2 />
                  </Button>
                </motion.li>
              ))}
            </ul>
          </Section>

          {needsDocs && (
            <Alert
              tone="warning"
              title="Some numbers will be held for verification"
              action={
                <Button size="sm" variant="secondary" asChild>
                  <Link to="/verification">
                    <ShieldCheck className="size-3.5" />
                    {t('Upload documents')}
                  </Link>
                </Button>
              }
            >
              Regulated ranges (national, toll-free and some mobile) can be reserved now, but only start routing
              calls once your business verification is approved. You are not billed for held numbers until they
              activate.
            </Alert>
          )}

          <Section eyebrow={t('After you confirm')} title={t('What happens next')} divided>
            <ol className="space-y-4">
              {[
                {
                  t: 'Numbers are reserved instantly',
                  d: 'The carrier hold is exclusive to your workspace.',
                },
                {
                  t: 'Routing defaults are applied',
                  d: 'Inbound calls land on your default SIP connection until you change it.',
                },
                {
                  t: 'Billing starts today',
                  d: 'Monthly fees renew on the 1st, pro-rated for the first period.',
                },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-semibold text-ink-muted">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-medium text-ink">{t(s.t)}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-subtle">{t(s.d)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        {/* ── Summary ─────────────────────────────────── */}
        <div className="lg:sticky lg:top-[calc(var(--topbar-h)+1.5rem)] lg:self-start">
          <div className="rounded-3xl bg-surface p-6 shadow-ring">
            <p className="eyebrow">{t('Order summary')}</p>
            <dl className="mt-5 space-y-2.5 text-base">
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('Monthly recurring')}</dt>
                <dd className="tabular-nums text-ink">{money(monthly, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('One-time setup')}</dt>
                <dd className="tabular-nums text-ink">{setup > 0 ? money(setup, currency) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('VAT (14%)')}</dt>
                <dd className="tabular-nums text-ink">{money(vat, currency)}</dd>
              </div>
              <Separator className="!my-3" />
              <div className="flex items-baseline justify-between">
                <dt className="text-base font-semibold text-ink">{t('Due today')}</dt>
                <dd className="display text-xl font-semibold tabular-nums text-ink">
                  {money(total, currency)}
                </dd>
              </div>
              <p className="text-xs text-ink-faint">
                {t('Then {amount} per month, cancel any time.', {
                  amount: money(monthly + monthly * 0.14, currency),
                })}
              </p>
            </dl>

            <div className="mt-4 rounded-2xl bg-veil-strong p-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <Wallet className="size-3.5" />
                  {t('Wallet balance')}
                </span>
                <span className={cn('font-medium tabular-nums', insufficient ? 'text-danger-ink' : 'text-ink')}>
                  {money(balance, currency)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-ink-muted">{t('After purchase')}</span>
                <span className="font-medium tabular-nums text-ink">{money(balance - total, currency)}</span>
              </div>
            </div>

            {insufficient && (
              <Alert tone="danger" compact className="mt-3" icon={<TriangleAlert />}>
                <div className="space-y-2">
                  <p>Your wallet is {money(total - balance, currency)} short of this order.</p>
                  <Button size="xs" variant="destructive" onClick={() => setTopUpOpen(true)}>
                    {t('Add funds')}
                  </Button>
                </div>
              </Alert>
            )}

            <label className="mt-4 flex cursor-pointer items-start gap-2.5">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              <span className="text-xs leading-relaxed text-ink-subtle">
                {t('I confirm the numbers will be used lawfully and accept the')}{' '}
                <a href="#terms" className="text-brand-ink underline underline-offset-2">
                  {t('acceptable use policy')}
                </a>{' '}
                {t('and local telecom regulations.')}
              </span>
            </label>

            <Button
              variant="primary"
              size="lg"
              block
              className="mt-4"
              disabled={!agree || insufficient}
              onClick={confirm}
              icon={<Lock />}
            >
              {t('Confirm purchase')}
            </Button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-2xs text-ink-faint">
              <Lock className="size-3" />
              {t('Charged against your wallet · no card entry needed')}
            </p>
          </div>
        </div>
      </div>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </>
  )
}
