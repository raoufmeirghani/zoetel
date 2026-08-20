import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Check,
  Code2,
  Cpu,
  Minus,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem } from '@/components/ui/misc'
import { Avatar } from '@/components/ui/avatar'
import { ZOIE_URL } from '@/lib/zoie'
import { cn } from '@/lib/utils'
import { Backdrop, Band, EASE, Eyebrow, Hairline, Lede, MEASURE, Parallax, Reveal, Split, Title } from './kit'
import { ChannelStack, HandoffDiagram, NumberInventory, RoutingDiagram, TrunkHealth } from './compositions'
import { CodeTabs } from './code-tabs'
import { useI18n } from '@/lib/i18n'

/**
 * The narrative half of the landing page: four capability sections, the Zoie
 * handoff, the comparison, pricing, the journey, proof and questions.
 *
 * Each band answers exactly one objection, in the order a buyer raises them.
 * That ordering is the whole design — the alternating layout and the changing
 * visual are there to keep a long page readable, not to decorate it.
 */

/* ── Shared copy block for a story section ─────────────────────────────── */

function StoryCopy({
  eyebrow,
  title,
  lede,
  points,
  cta,
}: {
  eyebrow: string
  title: React.ReactNode
  lede: string
  points?: { label: string; meta: string }[]
  cta: { label: string; to?: string; href?: string; external?: boolean }
}) {
  return (
    <div>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title className="mt-4">{title}</Title>
        <Lede className="mt-5">{lede}</Lede>
      </Reveal>

      {points && (
        <dl className={cn('mt-9 space-y-5', MEASURE)}>
          {points.map((p, i) => (
            <Reveal key={p.label} delay={0.05 + i * 0.05}>
              <div className="flex gap-3.5">
                <span className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink">
                  <Check className="size-3" />
                </span>
                <div className="min-w-0">
                  <dt className="text-base font-medium text-ink">{p.label}</dt>
                  <dd className="mt-0.5 text-base leading-relaxed text-ink-subtle">{p.meta}</dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      )}

      <Reveal delay={0.15}>
        <div className="mt-9">
          {cta.external ? (
            <Button variant="secondary" size="lg" asChild>
              <a href={cta.href} target="_blank" rel="noopener noreferrer">
                {cta.label}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          ) : (
            <Button variant="secondary" size="lg" asChild>
              <Link to={cta.to ?? '/'}>
                {cta.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </Reveal>
    </div>
  )
}

/* ── 1 · Numbers ───────────────────────────────────────────────────────── */

export function NumbersSection() {
  const { t } = useI18n()
  return (
    <Band>
      <Split
        copy={
          <StoryCopy
            eyebrow={t('Phone numbers')}
            title={
              <>
                {t('Search the inventory.')}
                <br />
                {t('Own it in seconds.')}
              </>
            }
            lede={t(
              'Local, mobile, national and toll-free ranges across Egypt, with live carrier inventory rather than a request form. Pick a number and it is routable before you have closed the tab.',
            )}
            points={[
              {
                label: t('Search by digits'),
                meta: t('Look for 1000, 4444 or your street number and see what is actually free.'),
              },
              {
                label: t('Priced before you commit'),
                meta: t('Monthly and setup cost on every row. Nothing is charged until you confirm.'),
              },
              {
                label: t('Compliance handled inline'),
                meta: t('Regulated ranges tell you what they need instead of failing at checkout.'),
              },
            ]}
            cta={{ label: t('Browse numbers'), to: '/numbers/buy' }}
          />
        }
        visual={
          <Reveal delay={0.1}>
            <Parallax distance={20}>
              <NumberInventory />
            </Parallax>
          </Reveal>
        }
      />
    </Band>
  )
}

/* ── 2 · SIP ───────────────────────────────────────────────────────────── */

export function SipSection() {
  const { t } = useI18n()
  return (
    <Band className="relative">
      <Backdrop src="/sip.webp" opacity={0.3} height="h-[34rem]" from="-top-32" mesh={false} />
      <Split
        flip
        copy={
          <StoryCopy
            eyebrow={t('Enterprise SIP')}
            title={
              <>
                {t('Carrier-grade trunks,')}
                <br />
                {t('configured like software.')}
              </>
            }
            lede={t(
              'Register your PBX against a hostname and start carrying traffic in under a minute. Credentials, IP allow-lists or FQDN — TLS and SRTP throughout, with the health of every trunk in front of you.',
            )}
            points={[
              {
                label: t('Three ways to authenticate'),
                meta: t('Credentials for softphones and dynamic IPs, allow-list or FQDN for fixed stacks.'),
              },
              {
                label: t('Quality you can see'),
                meta: t('MOS, ASR, jitter and packet loss per trunk — not a support ticket away.'),
              },
              {
                label: t('Capacity you control'),
                meta: t('Channel limits, outbound caps and failover, so a spike can never become a bill.'),
              },
            ]}
            cta={{ label: t('See SIP connections'), to: '/sip' }}
          />
        }
        visual={
          <Reveal delay={0.1}>
            <Parallax distance={22}>
              <div className="space-y-4">
                <TrunkHealth />
                <div className="me-0 ms-6 sm:ms-10">
                  <RoutingDiagram />
                </div>
              </div>
            </Parallax>
          </Reveal>
        }
      />
    </Band>
  )
}

/* ── 3 · Messaging ─────────────────────────────────────────────────────── */

export function MessagingSection() {
  const { t } = useI18n()
  return (
    <Band>
      <Split
        copy={
          <StoryCopy
            eyebrow={t('Messaging')}
            title={
              <>
                {t('SMS today.')}
                <br />
                {t('WhatsApp next to it.')}
              </>
            }
            lede={t(
              'One send call, one delivery webhook, one log — whatever the channel underneath. Enable SMS on a mobile or local number and you are sending in a single request.',
            )}
            points={[
              {
                label: t('Unified surface'),
                meta: t('Adding WhatsApp is a field on the request, not a second integration.'),
              },
              {
                label: t('Delivery you can audit'),
                meta: t('Segments, cost and status on every message, retained and searchable.'),
              },
              {
                label: t('Built for the next channel'),
                meta: t('RCS and beyond arrive behind the same API you already wrote against.'),
              },
            ]}
            cta={{ label: t('Read the messaging guide'), to: '/developers' }}
          />
        }
        visual={
          <Reveal delay={0.1}>
            <Parallax distance={20}>
              <ChannelStack />
            </Parallax>
          </Reveal>
        }
      />
    </Band>
  )
}

/* ── 4 · Developer experience ──────────────────────────────────────────── */

export function DeveloperSection() {
  const { t } = useI18n()
  return (
    <Band id="developers">
      <Split
        flip
        copy={
          <StoryCopy
            eyebrow={t('Developer experience')}
            title={
              <>
                {t('An API you can hold')}
                <br />
                {t('in your head.')}
              </>
            }
            lede={t(
              'REST that behaves, SDKs that are thin, webhooks that are signed and retried, and a log of every request your keys have ever made. Scoped keys, live and test environments, no surprises.',
            )}
            points={[
              {
                label: t('Signed, retried webhooks'),
                meta: t('Every call and message event, with the full body and a searchable history.'),
              },
              {
                label: t('Scoped, revocable keys'),
                meta: t('One per service. Rotate a single credential without touching the rest.'),
              },
              {
                label: t('The log is the support channel'),
                meta: t('Status, latency and payload for every request, retained for 30 days.'),
              },
            ]}
            cta={{ label: t('API reference'), to: '/developers' }}
          />
        }
        visual={
          <Reveal delay={0.1}>
            <CodeTabs />
          </Reveal>
        }
      />
    </Band>
  )
}

/* ── Zoie ──────────────────────────────────────────────────────────────── */

/**
 * Zoie appears once, positioned as a layer rather than an upsell. The rule from
 * the product carries over to the marketing page: it is one destination a number
 * can point at, it lives on its own domain, and crossing over is a deliberate
 * act the visitor takes — never a banner, never a modal.
 */
export function ZoieSection() {
  const { t } = useI18n()
  const capabilities = [
    'AI voice agents that answer, qualify and book',
    'AI SMS and WhatsApp on the same numbers',
    'Appointment booking straight into a calendar',
    'CRM sync and lead qualification',
    'Automations across channels',
    'Human handoff the moment it is needed',
  ]

  return (
    <Band className="relative overflow-hidden">
      <Backdrop src="/overview.webp" opacity={0.3} height="h-[40rem]" from="-top-40" />
      <Split
        copy={
          <div>
            <Reveal>
              <Eyebrow>{t('The intelligence layer')}</Eyebrow>
              <Title className="mt-4">
                {t('Infrastructure meets')}
                <br />
                {t('intelligence.')}
              </Title>
              <Lede className="mt-5">
                Every phone number bought through Zoetel can become an AI-powered channel. The number, the trunk
                and the billing stay here; the agent that answers lives in Zoie.
              </Lede>
            </Reveal>

            <ul className={cn('mt-9 space-y-3', MEASURE)}>
              {capabilities.map((c, i) => (
                <Reveal key={c} delay={0.04 + i * 0.04}>
                  <li className="flex items-start gap-3 text-base leading-relaxed text-ink-subtle">
                    <Sparkles className="mt-1 size-3.5 shrink-0 text-brand" />
                    {c}
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" asChild>
                  <a href={`${ZOIE_URL}/?from=zoetel-landing`} target="_blank" rel="noopener noreferrer">
                    {t('Open Zoie')}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
                <p className="text-sm leading-relaxed text-ink-faint">
                  {t('Opens in a new tab. Zoie is a separate product, built to work with Zoetel.')}
                </p>
              </div>
            </Reveal>
          </div>
        }
        visual={
          <Reveal delay={0.1}>
            <Parallax distance={18}>
              <HandoffDiagram />
            </Parallax>
          </Reveal>
        }
      />
    </Band>
  )
}

/* ── Why Zoetel ────────────────────────────────────────────────────────── */

const OLD_WAY = [
  'Weeks of procurement before a number exists',
  'Pricing behind a sales call',
  'Onboarding by email attachment',
  'Provisioning by ticket',
  'A portal from another decade',
]

const NEW_WAY = [
  'A number provisioned in seconds',
  'Every rate published, per second',
  'Verification once, in three minutes',
  'Provisioning by API or one click',
  'A dashboard you will actually open',
]

export function ComparisonSection() {
  const { t } = useI18n()
  return (
    <Band id="why" tight>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>{t('Why Zoetel')}</Eyebrow>
        <Title className="mt-4">{t('Telecom, without the telecom.')}</Title>
        <Lede className="mx-auto mt-5 text-center">
          {t(
            'The regulated parts are genuinely hard. Everything around them — the waiting, the quoting, the ticketing — was never necessary.',
          )}
        </Lede>
      </Reveal>

      <div className="relative mt-16 grid gap-10 lg:grid-cols-2 lg:gap-0">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-6 start-1/2 hidden w-px bg-gradient-to-b from-transparent via-line-strong to-transparent lg:block"
        />

        <div className="lg:pe-14">
          <Reveal>
            <p className="text-base font-medium text-ink-faint">{t('Traditional telecom')}</p>
            <ul className="mt-6 space-y-4">
              {OLD_WAY.map((o) => (
                <li key={o} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-veil-strong text-ink-faint">
                    <X className="size-3" />
                  </span>
                  <span className="text-base leading-relaxed text-ink-faint">{t(o)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:ps-14">
          <Reveal delay={0.08}>
            <p className="text-base font-medium text-ink">Zoetel</p>
            <ul className="mt-6 space-y-4">
              {NEW_WAY.map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink">
                    <Check className="size-3" />
                  </span>
                  <span className="text-base leading-relaxed text-ink">{t(n)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Band>
  )
}

/* ── Journey ───────────────────────────────────────────────────────────── */

const STEPS = [
  { icon: Sparkles, label: 'Create an account', meta: 'Two fields and a password.' },
  { icon: ScanLine, label: 'Verify the business', meta: 'Once, in about three minutes.' },
  { icon: Banknote, label: 'Fund the wallet', meta: 'Card or bank transfer.' },
  { icon: Phone, label: 'Buy a number', meta: 'Live seconds after checkout.' },
  { icon: Code2, label: 'Go live', meta: 'Point it at SIP, a webhook or Zoie.' },
]

export function JourneySection() {
  const { t } = useI18n()
  return (
    <Band tight>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>{t('From nothing to live')}</Eyebrow>
        <Title className="mt-4" size="sm">
          {t('Five steps, one afternoon.')}
        </Title>
      </Reveal>

      <div className="relative mt-14">
        {/* The rail runs behind the marks, fading at both ends so it never
            terminates in a hard stop. */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 start-[13px] top-3 w-px bg-gradient-to-b from-transparent via-line-strong to-transparent lg:inset-x-[8%] lg:inset-y-auto lg:top-[15px] lg:h-px lg:w-auto lg:bg-gradient-to-r"
        />
        <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <li className="flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-ink-muted shadow-ring">
                  <s.icon className="size-3.5" />
                </span>
                <span className="min-w-0 lg:mt-5">
                  <span className="block text-base font-medium text-ink">{t(s.label)}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-faint">{t(s.meta)}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Band>
  )
}

/* ── Pricing ───────────────────────────────────────────────────────────── */

export function PricingSection() {
  const { t } = useI18n()
  const plans = [
    {
      name: t('Pay as you go'),
      price: t('No commitment'),
      meta: t('Top up the wallet, pay only for what you use.'),
      points: [
        'Per-second billing on every destination',
        'Every API and SIP feature included',
        'Unlimited keys, webhooks and connections',
        'Numbers from $1.03 a month',
      ],
      cta: { label: t('Start free'), to: '/welcome' },
      featured: true,
    },
    {
      name: t('Volume'),
      price: t('Custom'),
      meta: t('Committed minutes at lower rates, with people attached.'),
      points: [
        'Discounts that apply automatically as you grow',
        'Dedicated carrier routes and priority capacity',
        'Named technical contact and an SLA',
        'Monthly invoicing on net-30 terms',
      ],
      cta: { label: t('Talk to sales'), to: '/pricing' },
    },
  ]

  return (
    <Band id="pricing">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <Title className="mt-4">{t('Two ways to pay. Both honest.')}</Title>
        <Lede className="mx-auto mt-5 text-center">
          {t(
            'Rates are published for every destination. There is no platform fee, no minimum, and nothing to negotiate until volume makes it worth your while.',
          )}
        </Lede>
      </Reveal>

      <div className="mt-16 grid gap-5 lg:grid-cols-2">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <div
              className={cn(
                'relative flex h-full flex-col rounded-[26px] p-7 sm:p-9',
                p.featured ? 'glass shadow-lg' : 'bg-surface-2 shadow-ring',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-medium text-ink">{p.name}</p>
                {p.featured && (
                  <Badge tone="brand" size="sm">
                    {t('Most start here')}
                  </Badge>
                )}
              </div>
              <p className="headline mt-5 text-3xl text-ink">{p.price}</p>
              <p className="mt-2.5 text-base leading-relaxed text-ink-muted">{p.meta}</p>

              <ul className="mt-7 flex-1 space-y-3">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5">
                    <Check className="mt-1 size-3.5 shrink-0 text-brand" />
                    <span className="text-base leading-relaxed text-ink-subtle">{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <Button variant={p.featured ? 'primary' : 'secondary'} size="lg" block asChild>
                  <Link to={p.cta.to}>{p.cta.label}</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Band>
  )
}

/* ── Proof ─────────────────────────────────────────────────────────────── */

const QUOTES = [
  {
    quote:
      'We had a Cairo number answering calls the same afternoon we signed up. The part I still think about is that nobody had to email us a spreadsheet.',
    name: 'Youssef Hegazy',
    role: 'Operations lead · Acme Retail',
    hue: 262,
  },
  {
    quote:
      'Knowing exactly which documents were needed up front meant compliance took one pass instead of four rounds of email.',
    name: 'Nour Abdelrahman',
    role: 'Compliance · Delta Logistics',
    hue: 190,
  },
  {
    quote:
      'The trunk registered on the first try and the quality panel told me more than our old carrier ever did. That is the whole review.',
    name: 'Karim Farouk',
    role: 'Platform engineer · Nile Health',
    hue: 152,
  },
]

export function TestimonialsSection() {
  const { t } = useI18n()
  return (
    <Band tight>
      <Reveal>
        <Eyebrow>{t('In production')}</Eyebrow>
      </Reveal>
      <div className="mt-10 grid gap-x-10 gap-y-12 lg:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 0.08}>
            <figure className="flex h-full flex-col">
              <blockquote className="flex-1 text-lg leading-relaxed text-ink">“{t(q.quote)}”</blockquote>
              <Hairline className="my-6" />
              <figcaption className="flex items-center gap-3">
                <Avatar name={q.name} hue={q.hue} size="md" />
                <span className="min-w-0">
                  <span className="block truncate text-base font-medium text-ink">{q.name}</span>
                  <span className="block truncate text-sm text-ink-faint">{t(q.role)}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Band>
  )
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */

export function FaqSection() {
  const { t } = useI18n()
  return (
    <Band id="faq">
      <div className="grid gap-12 lg:grid-cols-[20rem_1fr] lg:gap-20">
        <Reveal>
          <div>
            <Eyebrow>Questions</Eyebrow>
            <Title className="mt-4" size="sm">
              {t('Before you sign up.')}
            </Title>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              {t('Anything else, ask a real engineer — support is not a chatbot.')}
            </p>
            <Button variant="ghost" size="md" className="-ms-3.5 mt-5" asChild>
              <Link to="/welcome">
                {t('Contact support')}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Accordion type="single" collapsible>
            <AccordionItem
              value="how-fast"
              title={t('How quickly can I get a working number?')}
              icon={<Phone />}
            >
              {t(
                'Local geographic numbers activate within seconds of checkout — you can place a test call immediately. National, mobile and toll-free ranges are regulated and need a verified business first, which takes about three minutes to submit and is usually reviewed inside six hours.',
              )}
            </AccordionItem>
            <AccordionItem value="kyc" title={t('Why do I need to verify my business?')} icon={<ShieldCheck />}>
              {t(
                'Phone numbers are a regulated national resource. In Egypt the NTRA holds the licensed carrier responsible for who uses each number, which is why identity or business verification is required before certain ranges can be provisioned. One check unlocks every range, permanently.',
              )}
            </AccordionItem>
            <AccordionItem value="billing" title={t('How does billing actually work?')} icon={<Banknote />}>
              {t(
                'A prepaid wallet, drawn down per second as usage happens. Nothing can run away from you: calls stop at zero rather than producing a surprise invoice, and you can set a monthly spend limit and an auto-recharge threshold. Rates for every destination are published.',
              )}
            </AccordionItem>
            <AccordionItem value="port" title={t('Can I bring numbers I already own?')} icon={<ArrowRight />}>
              {t(
                'Yes — porting is supported for Egyptian ranges, and your existing number keeps working while the port completes. Start it from the marketplace and we handle the carrier paperwork.',
              )}
            </AccordionItem>
            <AccordionItem value="zoie" title={t('Do I have to use Zoie?')} icon={<Cpu />}>
              {t(
                'No. Zoie is one of four things a number can point at, alongside a SIP trunk, a webhook and plain forwarding. It is a separate product on its own domain, priced separately, and Zoetel works exactly the same if you never open it.',
              )}
            </AccordionItem>
            <AccordionItem value="lock-in" title={t('Is there a contract?')} icon={<Minus />}>
              Not on pay as you go. Release a number and it returns to the carrier pool immediately; close the
              account and nothing is owed beyond usage already drawn from the wallet. Volume plans have terms,
              which is the point of them.
            </AccordionItem>
          </Accordion>
        </Reveal>
      </div>
    </Band>
  )
}

/* ── Trust band ────────────────────────────────────────────────────────── */

const TRUST = [
  { label: 'NTRA licensed', meta: 'Egyptian ranges, provisioned lawfully' },
  { label: 'Developer-first APIs', meta: 'REST, SDKs, signed webhooks' },
  { label: 'TLS and SRTP throughout', meta: 'Encrypted signalling and media' },
  { label: '99.99% uptime target', meta: 'Anycast edges in Cairo and Frankfurt' },
  { label: 'Instant provisioning', meta: 'Seconds, not procurement cycles' },
  { label: 'Built for scale', meta: 'Thousands of concurrent channels' },
]

export function TrustBand() {
  const { t } = useI18n()
  return (
    <Band tight className="relative">
      <Hairline />
      <div className="grid gap-x-10 gap-y-8 pt-14 sm:grid-cols-2 lg:grid-cols-3">
        {TRUST.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.05}>
            <div className="flex items-start gap-3">
              <motion.span
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-veil text-ink-muted"
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease: EASE }}
              >
                <Check className="size-3" />
              </motion.span>
              <div className="min-w-0">
                <p className="text-base font-medium text-ink">{t(item.label)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-faint">{t(item.meta)}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Band>
  )
}
