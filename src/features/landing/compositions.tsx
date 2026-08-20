import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Cpu, Globe, MessageSquare, Network, Phone, Webhook } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { CapabilityPills } from '@/components/shared/capability-pills'
import { formatE164, money } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EASE } from './kit'
import { useI18n } from '@/lib/i18n'

/**
 * Product compositions for the marketing page.
 *
 * Every one of these is assembled from the components the application actually
 * ships — the same carrier marks, capability pills, status dots and badges, at
 * the same radii and elevations. Nothing here is a screenshot and nothing is a
 * mock-up of a screen that doesn't exist: they are small, true fragments of the
 * product, which is why they can carry the page without looking like stock art.
 *
 * Numbers shown are the same sample inventory the app's marketplace uses.
 */

/** The floating shell every composition sits in. */
function Pane({
  children,
  className,
  tone = 'glass',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'glass' | 'onyx'
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[22px]',
        tone === 'glass'
          ? 'glass shadow-lg'
          : 'bg-onyx text-onyx-fg shadow-xl dark:ring-1 dark:ring-white/[0.07]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function PaneHeader({ label, meta }: { label: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-2.5">
      <span className="eyebrow">{label}</span>
      {meta}
    </div>
  )
}

/* ── Numbers ───────────────────────────────────────────────────────────── */

const INVENTORY = [
  { e164: '+20224618890', city: 'New Cairo', type: 'Local', carrier: 'we' as const, price: 1.03 },
  { e164: '+201028834471', city: 'Cairo', type: 'Mobile', carrier: 'vodafone' as const, price: 1.05 },
  { e164: '+20168822', city: 'Nationwide', type: 'Toll-free', carrier: 'etisalat' as const, price: 4.5 },
]

/**
 * The marketplace result row, which is the moment the product is really about:
 * a number, what it can carry, what it costs, and one button.
 */
export function NumberInventory({ compact }: { compact?: boolean }) {
  const { t } = useI18n()
  const rows = compact ? INVENTORY.slice(0, 2) : INVENTORY

  return (
    <Pane>
      <PaneHeader
        label={t('Egypt · available now')}
        meta={<span className="text-xs tabular-nums text-ink-faint">{t('{n} numbers', { n: 84 })}</span>}
      />
      <ul className="divide-y divide-line-soft">
        {rows.map((n, i) => (
          <motion.li
            key={n.e164}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease: EASE }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <CarrierAvatar carrier={n.carrier} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-sm tabular-nums text-ink">
                {formatE164(n.e164)}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-faint">
                {n.type}
                <span aria-hidden>·</span>
                {n.city}
              </span>
            </span>
            <CapabilityPills capabilities={['voice', 'sms']} size="sm" className="hidden sm:flex" />
            <span className="shrink-0 text-end">
              <span className="block text-sm font-semibold tabular-nums text-ink">{money(n.price)}</span>
              <span className="block text-2xs text-ink-faint">{t('/mo')}</span>
            </span>
            <Button size="sm" variant={i === 0 ? 'primary' : 'secondary'} className="shrink-0">
              {i === 0 ? 'Selected' : 'Select'}
            </Button>
          </motion.li>
        ))}
      </ul>
    </Pane>
  )
}

/* ── SIP ───────────────────────────────────────────────────────────────── */

/** A trunk as the SIP list renders it: health first, capacity second. */
export function TrunkHealth() {
  const { t } = useI18n()
  const metrics = [
    { label: t('MOS'), value: '4.48' },
    { label: t('ASR'), value: '84.2%' },
    { label: t('Latency'), value: t('{n} ms', { n: 11 }) },
  ]

  return (
    <Pane>
      <PaneHeader
        label={t('Production Edge')}
        meta={
          <span className="flex items-center gap-1.5 text-xs text-success-ink">
            <StatusDot tone="success" pulse />
            {t('Registered')}
          </span>
        }
      />
      <div className="px-4 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-ink-subtle">{t('Channels in use')}</span>
          <span className="text-sm font-semibold tabular-nums text-ink">
            {t('{used} / {total}', { used: 112, total: 500 })}
          </span>
        </div>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-veil-strong">
          <motion.span
            className="block h-full rounded-full bg-brand"
            initial={{ width: 0 }}
            whileInView={{ width: '22%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          />
        </span>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line-soft pt-4">
          {metrics.map((m) => (
            <span key={m.label} className="block">
              <span className="eyebrow">{m.label}</span>
              <span className="display mt-1 block text-lg text-ink">{m.value}</span>
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge tone="outline" size="sm">
            {t('TLS')}
          </Badge>
          <Badge tone="outline" size="sm">
            {t('SRTP')}
          </Badge>
          <Badge tone="outline" size="sm">
            {t('OPUS')}
          </Badge>
          <Badge tone="neutral" size="sm">
            {t('Cairo · eg-cai-1')}
          </Badge>
        </div>
      </div>
    </Pane>
  )
}

/**
 * Where an inbound call can go. Drawn rather than screenshotted because the
 * point is the shape of the routing, not a particular screen: one number, four
 * honest destinations, Zoie among them as a peer rather than a promotion.
 */
export function RoutingDiagram() {
  const { t } = useI18n()
  const destinations = [
    { icon: Network, label: t('SIP trunk'), meta: t('Your PBX or softswitch') },
    { icon: Webhook, label: t('Webhook'), meta: t('Your application drives the call') },
    { icon: Phone, label: t('Forwarding'), meta: t('A mobile or landline') },
    { icon: Cpu, label: t('Zoie agent'), meta: t('AI answers and books') },
  ]

  return (
    <Pane>
      <PaneHeader
        label={t('Inbound routing')}
        meta={
          <Badge tone="brand" size="sm">
            {t('Live')}
          </Badge>
        }
      />
      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-fg">
            <Phone className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-sm tabular-nums text-ink">{formatE164('+20224618890')}</span>
            <span className="block text-2xs text-ink-faint">{t('Support line — Cairo')}</span>
          </span>
        </div>

        <ul className="ms-4 mt-2 space-y-0.5 border-s border-line ps-5">
          {destinations.map((d, i) => (
            <motion.li
              key={d.label}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: EASE }}
              className="relative flex items-center gap-2.5 py-2"
            >
              <span aria-hidden className="absolute -start-5 top-1/2 h-px w-4 -translate-y-1/2 bg-line" />
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-veil text-ink-muted">
                <d.icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-medium text-ink">{d.label}</span>
                <span className="block truncate text-2xs text-ink-faint">{d.meta}</span>
              </span>
              {i === 0 && <Check className="size-4 shrink-0 text-brand" />}
            </motion.li>
          ))}
        </ul>
      </div>
    </Pane>
  )
}

/* ── Messaging ─────────────────────────────────────────────────────────── */

export function ChannelStack() {
  const { t } = useI18n()
  const channels = [
    {
      icon: MessageSquare,
      label: t('SMS'),
      meta: t('Live on mobile and local ranges'),
      tone: 'success' as const,
      badge: 'Live',
    },
    {
      icon: MessageSquare,
      label: t('WhatsApp'),
      meta: t('Business API, template messaging'),
      tone: 'info' as const,
      badge: 'Beta',
    },
    {
      icon: Globe,
      label: t('RCS'),
      meta: t('On the roadmap, same API surface'),
      tone: 'neutral' as const,
      badge: 'Soon',
    },
  ]

  return (
    <Pane>
      <PaneHeader
        label={t('Messaging channels')}
        meta={<span className="text-xs tabular-nums text-ink-faint">{t('one API')}</span>}
      />
      <ul className="divide-y divide-line-soft">
        {channels.map((c, i) => (
          <motion.li
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease: EASE }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <span
              className={cn(
                'grid size-8 shrink-0 place-items-center rounded-xl',
                c.tone === 'success'
                  ? 'bg-success-soft text-success'
                  : c.tone === 'info'
                    ? 'bg-info-soft text-info'
                    : 'bg-veil text-ink-faint',
              )}
            >
              <c.icon className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium text-ink">{c.label}</span>
              <span className="block truncate text-2xs text-ink-faint">{c.meta}</span>
            </span>
            <Badge tone={c.tone === 'neutral' ? 'outline' : c.tone} size="sm">
              {c.badge}
            </Badge>
          </motion.li>
        ))}
      </ul>
      <div className="border-t border-line-soft px-4 py-3">
        <p className="text-xs leading-relaxed text-ink-subtle">
          {t(
            'The same send call, the same delivery webhooks, the same log. Adding a channel is a field, not an integration.',
          )}
        </p>
      </div>
    </Pane>
  )
}

/* ── Above the fold ────────────────────────────────────────────────────── */

/**
 * The hero composition: three panes, overlapping down the page rather than
 * absolutely positioned, so the arrangement survives every width without a
 * separate mobile layout. Each is inset from the last, which reads as depth
 * without any of them leaving the column.
 */
export function HeroComposition() {
  const { t } = useI18n()
  return (
    <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
      >
        <NumberInventory compact />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
        className="relative z-10 -mt-3 ms-auto w-[86%] sm:w-[76%]"
      >
        <Pane className="rounded-[18px]">
          <div className="flex items-center gap-3 px-4 py-3">
            <StatusDot tone="success" pulse />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium text-ink">{t('Production Edge')}</span>
              <span className="block text-2xs text-ink-faint">
                {t('SIP registered · {used} of {total} channels', { used: 112, total: 500 })}
              </span>
            </span>
            <span className="hidden shrink-0 text-end sm:block">
              <span className="display block text-base text-ink">4.48</span>
              <span className="eyebrow">MOS</span>
            </span>
          </div>
        </Pane>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.46, ease: EASE }}
        className="relative z-20 -mt-2 w-[92%] sm:w-[82%]"
      >
        <Pane tone="onyx" className="rounded-[18px]">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/70">
              <ArrowRight className="size-3.5" />
            </span>
            <code
              dir="ltr"
              className="ltr-island min-w-0 flex-1 truncate font-mono text-[12.5px] text-white/80"
            >
              POST /v1/calls <span className="text-white/40">→</span>{' '}
              <span className="text-[hsl(152_62%_62%)]">201 Created</span>
            </code>
            <span className="hidden shrink-0 font-mono text-2xs tabular-nums text-white/40 sm:block">
              38 ms
            </span>
          </div>
        </Pane>
      </motion.div>
    </div>
  )
}

/* ── Zoetel → Zoie ─────────────────────────────────────────────────────── */

/**
 * The handoff, drawn as two stacked planes with a channel between them. Zoetel
 * is the ground the number sits on; Zoie is a layer that can be switched on
 * above it. Deliberately not a logo pairing or a comparison — the diagram's
 * only job is to make "separate product, same number" legible at a glance.
 */
export function HandoffDiagram() {
  const { t } = useI18n()
  const upper = ['Voice agents', 'AI SMS', 'AI WhatsApp', 'Booking', 'Lead qualification', 'Human handoff']

  return (
    <div className="relative">
      <Pane className="rounded-[24px]">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-brand text-brand-fg">
                <Phone className="size-3.5" />
              </span>
              <span className="text-base font-medium text-ink">Zoetel</span>
            </span>
            <span className="eyebrow">Infrastructure</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-subtle">
            {t(
              'The number, the trunk, the routing, the wallet. Everything that has to be licensed, provisioned and metered.',
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral" size="sm">
              {t('Numbers')}
            </Badge>
            <Badge tone="neutral" size="sm">
              {t('SIP')}
            </Badge>
            <Badge tone="neutral" size="sm">
              {t('Messaging')}
            </Badge>
            <Badge tone="neutral" size="sm">
              {t('APIs')}
            </Badge>
          </div>
        </div>
      </Pane>

      {/* The channel between the planes. A number crosses over; nothing else does. */}
      <div className="relative flex h-16 items-center justify-center" aria-hidden>
        <span className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-line-strong via-brand/50 to-line-strong rtl:translate-x-1/2" />
        <motion.span
          className="relative grid size-8 place-items-center rounded-full bg-surface text-brand shadow-ring"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        >
          <ArrowRight className="size-4 rotate-90 rtl:rotate-90" />
        </motion.span>
      </div>

      <Pane tone="onyx" className="rounded-[24px]">
        <div className="relative px-5 py-5">
          <span
            aria-hidden
            className="pointer-events-none absolute -end-10 -top-14 size-40 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 70%)' }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="bg-white/12 grid size-7 place-items-center rounded-lg text-white">
                <Cpu className="size-3.5" />
              </span>
              <span className="text-base font-medium text-white">Zoie</span>
            </span>
            <span className="eyebrow text-white/45">Intelligence</span>
          </div>
          <p className="relative mt-3 text-sm leading-relaxed text-white/70">
            {t(
              'A separate product on its own domain. Point a Zoetel number at it and the number starts answering.',
            )}
          </p>
          <div className="relative mt-4 flex flex-wrap gap-1.5">
            {upper.map((u) => (
              <span key={u} className="rounded-md bg-white/10 px-2 py-1 text-2xs font-medium text-white/75">
                {u}
              </span>
            ))}
          </div>
        </div>
      </Pane>
    </div>
  )
}
