import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  Headphones,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { Hero, HERO_ART_USAGE } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/toggle'
import { SearchInput } from '@/components/ui/inputs-special'
import { DataTable, type Column } from '@/components/ui/table'
import { Alert, EmptyState } from '@/components/ui/feedback'
import { AccordionItem, Accordion, Separator } from '@/components/ui/misc'
import { Progress } from '@/components/ui/progress'
import { CountryFlag } from '@/components/shared/capability-pills'
import { useApp } from '@/store/app'
import { money, num } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { PlanKind } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

interface Rate {
  id: string
  country: string
  destination: string
  outbound: number
  inbound: number
  sms: number | null
}

const RATES: Rate[] = [
  {
    id: 'eg-mobile',
    country: 'EG',
    destination: 'Egypt — mobile',
    outbound: 0.0142,
    inbound: 0.0038,
    sms: 0.0151,
  },
  {
    id: 'eg-fixed',
    country: 'EG',
    destination: 'Egypt — landline',
    outbound: 0.0062,
    inbound: 0.0031,
    sms: null,
  },
  {
    id: 'eg-tollfree',
    country: 'EG',
    destination: 'Egypt — toll-free inbound',
    outbound: 0,
    inbound: 0.0184,
    sms: null,
  },
  {
    id: 'ae-mobile',
    country: 'AE',
    destination: 'UAE — mobile',
    outbound: 0.0396,
    inbound: 0.0092,
    sms: 0.0288,
  },
  {
    id: 'ae-fixed',
    country: 'AE',
    destination: 'UAE — landline',
    outbound: 0.0221,
    inbound: 0.0071,
    sms: null,
  },
  {
    id: 'sa-mobile',
    country: 'SA',
    destination: 'Saudi Arabia — mobile',
    outbound: 0.0324,
    inbound: 0.0086,
    sms: 0.0264,
  },
  {
    id: 'gb-fixed',
    country: 'GB',
    destination: 'United Kingdom — landline',
    outbound: 0.0071,
    inbound: 0.0026,
    sms: null,
  },
  {
    id: 'gb-mobile',
    country: 'GB',
    destination: 'United Kingdom — mobile',
    outbound: 0.0142,
    inbound: 0.0034,
    sms: 0.0402,
  },
  {
    id: 'us-any',
    country: 'US',
    destination: 'United States — any',
    outbound: 0.0042,
    inbound: 0.0021,
    sms: 0.0079,
  },
  {
    id: 'de-fixed',
    country: 'DE',
    destination: 'Germany — landline',
    outbound: 0.0066,
    inbound: 0.0029,
    sms: null,
  },
]

const TIERS = [
  { label: 'Tier 1', from: 0, to: 10_000, discount: 0 },
  { label: 'Tier 2', from: 10_000, to: 50_000, discount: 8 },
  { label: 'Tier 3', from: 50_000, to: 250_000, discount: 16 },
  { label: 'Tier 4', from: 250_000, to: Infinity, discount: 24 },
]

export default function PricingPage() {
  const { t } = useI18n()
  const currency = useApp((s) => s.workspace.currency)
  const plan = useApp((s) => s.workspace.plan)
  const setPlan = useApp((s) => s.setPlan)
  const [selected, setSelected] = React.useState<PlanKind>(plan)
  const [q, setQ] = React.useState('')
  const [volume, setVolume] = React.useState(40_000)

  const discount = TIERS.find((t) => volume >= t.from && volume < t.to)?.discount ?? 24
  const multiplier = selected === 'volume' ? 1 - discount / 100 : 1

  const filtered = RATES.filter(
    (r) =>
      !q ||
      r.destination.toLowerCase().includes(q.toLowerCase()) ||
      r.country.toLowerCase() === q.toLowerCase(),
  )

  const columns: Column<Rate>[] = [
    {
      id: 'destination',
      header: t('Destination'),
      headerClassName: 'w-full sm:w-[38%]',
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <CountryFlag code={r.country} />
          <span className="truncate font-medium text-ink">{r.destination}</span>
        </div>
      ),
    },
    {
      id: 'outbound',
      header: (
        <>
          <span className="sm:hidden">Out / min</span>
          <span className="hidden sm:inline">Outbound / min</span>
        </>
      ),
      align: 'right',
      sortable: true,
      sortValue: (r) => r.outbound,
      cell: (r) =>
        r.outbound > 0 ? (
          <span className="tabular-nums text-ink">
            {money(r.outbound * multiplier, currency, { precise: true })}
            {multiplier < 1 && (
              <span className="ms-1.5 text-xs tabular-nums text-ink-faint line-through">
                {money(r.outbound, currency, { precise: true })}
              </span>
            )}
          </span>
        ) : (
          <span className="text-ink-faint">n/a</span>
        ),
    },
    {
      id: 'inbound',
      header: t('Inbound / min'),
      align: 'right',
      hideBelow: 'md',
      sortable: true,
      sortValue: (r) => r.inbound,
      cell: (r) => (
        <span className="tabular-nums text-ink">
          {money(r.inbound * multiplier, currency, { precise: true })}
        </span>
      ),
    },
    {
      id: 'sms',
      header: t('SMS'),
      align: 'right',
      hideBelow: 'md',
      cell: (r) =>
        r.sms ? (
          <span className="tabular-nums text-ink">
            {money(r.sms * multiplier, currency, { precise: true })}
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
  ]

  const estMonthly = volume * 0.0142 * multiplier
  const savings = volume * 0.0142 * (discount / 100)

  return (
    <>
      <Hero
        backdropImage={HERO_ART_USAGE}
        mood="ledger"
        size="md"
        title={t('Pricing')}
        lede={t(
          'Per-second billing, no minimums on pay as you go, and discounts that apply automatically as you grow. There is nothing to negotiate.',
        )}
        actions={
          <Segmented
            value={selected}
            onChange={setSelected}
            options={[
              { value: 'payg', label: t('Pay as you go') },
              { value: 'volume', label: t('Volume pricing') },
            ]}
          />
        }
      />

      {/* ── Plans ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            kind: 'payg' as const,
            icon: Rocket,
            name: 'Pay as you go',
            tagline: 'Perfect for startups and first integrations',
            price: 'No commitment',
            priceSub: 'Top up your wallet, pay only for what you use',
            features: [
              'Numbers from ' + money(1.1, currency) + '/month',
              'Per-second voice billing',
              'All API and SIP features included',
              'Unlimited API keys and webhooks',
              'Community and email support',
              'Cancel or pause any time',
            ],
            cta: t('Stay on pay as you go'),
          },
          {
            kind: 'volume' as const,
            icon: TrendingDown,
            name: 'Volume pricing',
            tagline: 'For teams with predictable monthly traffic',
            price: 'Up to 24% lower',
            priceSub: 'Committed monthly minutes at discounted rates',
            features: [
              'Automatic tier discounts up to 24%',
              'Dedicated carrier routes and priority capacity',
              'Named technical account manager',
              'Custom SLA with quality guarantees',
              'Monthly invoicing with net-30 terms',
              'SSO, audit exports and role policies',
            ],
            cta: t('Talk to sales'),
          },
        ].map((p, i) => {
          const active = selected === p.kind
          return (
            <motion.div
              key={p.kind}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-3xl p-6 transition-all duration-200',
                  active
                    ? p.kind === 'volume'
                      ? 'bg-onyx text-onyx-fg shadow-xl'
                      : 'bg-surface shadow-[0_0_0_1.5px_hsl(var(--brand)),var(--shadow-md)]'
                    : 'bg-surface shadow-ring',
                )}
                onClick={() => setSelected(p.kind)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(p.kind)}
              >
                {p.kind === 'volume' && (
                  <span
                    className={cn(
                      'absolute end-6 top-6 rounded-lg px-2 py-1 text-2xs font-semibold uppercase tracking-wider',
                      active ? 'bg-white/12 text-white/80' : 'bg-brand-soft text-brand-ink',
                    )}
                  >
                    Most popular above 25k min
                  </span>
                )}
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-xl',
                    active && p.kind === 'volume' ? 'bg-white/12 text-white' : 'bg-brand-soft text-brand',
                  )}
                >
                  <p.icon className="size-5" />
                </span>
                <h3
                  className={cn(
                    'display mt-4 text-xl font-semibold',
                    active && p.kind === 'volume' ? 'text-white' : 'text-ink',
                  )}
                >
                  {p.name}
                </h3>
                <p
                  className={cn(
                    'mt-1 text-base',
                    active && p.kind === 'volume' ? 'text-white/60' : 'text-ink-subtle',
                  )}
                >
                  {p.tagline}
                </p>

                <div className="mt-5">
                  <p
                    className={cn(
                      'display text-3xl font-semibold',
                      active && p.kind === 'volume' ? 'text-white' : 'text-ink',
                    )}
                  >
                    {p.price}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-sm leading-relaxed',
                      active && p.kind === 'volume' ? 'text-white/55' : 'text-ink-subtle',
                    )}
                  >
                    {p.priceSub}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        'flex items-start gap-2.5 text-base',
                        active && p.kind === 'volume' ? 'text-white/80' : 'text-ink-muted',
                      )}
                    >
                      <Check
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          active && p.kind === 'volume' ? 'text-success' : 'text-brand',
                        )}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={active && p.kind === 'volume' ? 'secondary' : active ? 'primary' : 'secondary'}
                  size="lg"
                  block
                  className={cn(
                    'mt-6',
                    active && p.kind === 'volume' && 'bg-white text-onyx shadow-none hover:bg-white/90',
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (p.kind === 'payg') {
                      setPlan('payg')
                      toast.success('Staying on pay as you go')
                    } else {
                      toast.success('A specialist will reach out today', {
                        description: "We'll model your traffic and send a rate card.",
                      })
                    }
                  }}
                >
                  {p.cta}
                  <ArrowRight className="size-4" />
                </Button>
                {plan === p.kind && (
                  <p
                    className={cn(
                      'mt-2.5 text-center text-xs',
                      active && p.kind === 'volume' ? 'text-white/45' : 'text-ink-faint',
                    )}
                  >
                    Your current plan
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Volume calculator ─────────────────────────── */}
      <Section
        className="mt-16"
        eyebrow={t('Work out your rate')}
        title={t('Estimate')}
        lede="Move the slider to your real monthly volume — the tier applies on its own."
        divided
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="volume" className="text-sm font-medium text-ink-muted">
                {t('Monthly outbound minutes')}
              </label>
              <span className="display text-xl font-semibold tabular-nums text-ink">{num(volume)}</span>
            </div>
            <input
              id="volume"
              type="range"
              min={1000}
              max={400_000}
              step={1000}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[hsl(var(--brand))] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIERS.map((tier) => {
                const active = volume >= tier.from && volume < tier.to
                return (
                  <div
                    key={tier.label}
                    className={cn(
                      'rounded-xl p-3 transition-all duration-200',
                      active ? 'bg-brand-softer ring-1 ring-brand/40' : 'bg-surface-2',
                    )}
                  >
                    <p className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
                      {t(tier.label)}
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-base font-semibold tabular-nums',
                        active ? 'text-brand-ink' : 'text-ink',
                      )}
                    >
                      {tier.discount === 0 ? 'List' : `−${tier.discount}%`}
                    </p>
                    <p className="mt-0.5 text-2xs tabular-nums text-ink-faint">
                      {tier.to === Infinity
                        ? `${num(tier.from / 1000)}k+`
                        : `${num(tier.from / 1000)}–${num(tier.to / 1000)}k`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-veil p-5">
            <p className="eyebrow">Estimated monthly voice spend</p>
            <p className="display mt-1.5 text-3xl font-semibold tabular-nums text-ink">
              {money(estMonthly, currency)}
            </p>
            <p className="mt-1 text-xs tabular-nums text-ink-faint">
              {money((estMonthly / volume) * 1, currency, { precise: true })} effective per minute
            </p>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tier discount</span>
                <span className="font-medium tabular-nums text-brand-ink">−{discount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Saved vs list</span>
                <span className="font-medium tabular-nums text-success-ink">{money(savings, currency)}/mo</span>
              </div>
            </div>
            <Progress value={(discount / 24) * 100} className="mt-4" size="xs" />
            <p className="mt-1.5 text-2xs text-ink-faint">
              {discount === 24
                ? 'Maximum standard discount reached'
                : t('{n} min unlocks the next tier', {
                    n: num(TIERS.find((tier) => tier.discount > discount)?.from ?? 0),
                  })}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Rate table ────────────────────────────────── */}
      <Section
        className="mt-16"
        eyebrow={
          selected === 'volume'
            ? `Tier ${TIERS.findIndex((t) => t.discount === discount) + 1} rates in ${currency}`
            : `List rates in ${currency}`
        }
        title={t('Voice & messaging')}
        divided
        action={
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t('Search destinations…')}
            size="sm"
            className="w-52"
          />
        }
      >
        <DataTable
          columns={columns}
          rows={filtered}
          compact
          empty={
            <EmptyState
              compact
              icon={<Search />}
              title={t('No rates for “{q}”', { q })}
              description={t(
                'We publish rates for 190+ destinations. Search by country name or ask us for a full rate card.',
              )}
              action={
                <Button variant="secondary" onClick={() => setQ('')}>
                  {t('Clear search')}
                </Button>
              }
            />
          }
        />
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-ink-faint">
          Rates exclude 14% Egyptian VAT and are billed per second with a one-second minimum. Toll-free inbound
          is billed to you rather than the caller. Full rate cards for all 190+ destinations are available on
          request.
        </p>
      </Section>

      {/* ── Included ──────────────────────────────────── */}
      <Section className="mt-16" eyebrow={t('On every plan')} title={t('What you always get')} divided>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: t('No platform fee'),
              body: 'API, SIP, webhooks and the dashboard are included on every plan.',
            },
            {
              icon: Phone,
              title: t('Per-second billing'),
              body: 'A 12-second call costs 12 seconds — no 60-second rounding.',
            },
            {
              icon: ShieldCheck,
              title: t('Compliance included'),
              body: 'KYC review, emergency registration and CNAM at no extra cost.',
            },
            {
              icon: Headphones,
              title: t('Real engineers'),
              body: 'Support is staffed by voice engineers, not a ticket queue.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.1 + i * 0.05 }}
            >
              <div className="h-full">
                <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand">
                  <f.icon className="size-4" />
                </span>
                <h4 className="mt-4 text-base font-medium text-ink">{f.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Enterprise ────────────────────────────────── */}
      <div className="mt-16 overflow-hidden rounded-[28px] bg-onyx p-6 text-onyx-fg sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            className="pointer-events-none absolute -end-10 -top-24 size-64 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 70%)' }}
          />
          <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10">
            <Building2 className="size-5 text-white/85" />
          </span>
          <div className="relative min-w-0 flex-1">
            <h3 className="display text-xl font-semibold text-white">Running voice at national scale?</h3>
            <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-white/60">
              Enterprise agreements add dedicated interconnects, private carrier routes, custom SLAs with
              financial remedies, on-premise SBC peering and a named engineering contact. Typical onboarding is
              two weeks.
            </p>
          </div>
          <Button
            size="lg"
            className="relative shrink-0 bg-white text-onyx shadow-none hover:bg-white/90"
            onClick={() =>
              toast.success('Request received', { description: t('Our enterprise team will email you today.') })
            }
          >
            {t('Contact enterprise sales')}
          </Button>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────── */}
      <Section className="mt-16" eyebrow={t('Before you ask')} title={t('Pricing questions')} divided>
        <Accordion type="single" collapsible>
          <AccordionItem value="switch" title="Can I move between plans?">
            Yes, in both directions. Moving to volume pricing takes effect at the start of the next billing
            period so your current month isn't re-rated. Moving back to pay as you go happens at the end of your
            commitment term.
          </AccordionItem>
          <AccordionItem value="unused" title="What happens to unused committed minutes?">
            They don't roll over, which is why we size commitments from your actual traffic rather than your
            ambitions. If you consistently overshoot, we move you up a tier automatically — you never pay list
            rates for volume you've already earned a discount on.
          </AccordionItem>
          <AccordionItem value="numbers" title="Are number fees discounted too?">
            Number rental is discounted at tier 3 and above. Setup fees are waived on all volume plans.
          </AccordionItem>
          <AccordionItem value="currency" title="Can I be billed in EGP?">
            Yes. Workspaces set to EGP are invoiced in EGP at the mid-market rate on the invoice date, and local
            bank transfer avoids card processing fees entirely.
          </AccordionItem>
        </Accordion>
      </Section>

      <Alert tone="brand" className="mt-4" icon={<CircleCheck />}>
        Every plan includes the full platform. We don't gate SIP, webhooks, recordings or the API behind a
        higher tier — the only thing that changes with volume is the per-minute rate.{' '}
        <Link to="/numbers/buy" className="font-medium underline underline-offset-2">
          {t('Start with a number')}
        </Link>
        .
      </Alert>
    </>
  )
}
