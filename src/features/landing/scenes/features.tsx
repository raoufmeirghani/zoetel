import { motion } from 'framer-motion'
import {
  ArrowsRightLeftIcon,
  ChartBarIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ServerStackIcon,
} from '@heroicons/react/24/solid'
import { Logo } from '@/components/layout/logo'
import { StatusDot } from '@/components/ui/status'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE, Eyebrow, Reveal, Scene, Title } from '../kit'

/**
 * Scene 03 — what a number needs.
 *
 * Each card carries both a filled icon and a small working fragment of the thing
 * it describes. They do different jobs and the card needs both: the icon is what
 * you catch while scanning past, the fragment is what convinces you once you have
 * stopped. An icon alone leaves the section generic — five tinted squares could
 * belong to any product — and a fragment alone is a drawing you have to study
 * before you know what you are looking at.
 *
 * Every fragment is `aria-hidden`. It is decoration for the sentence beside it,
 * and read aloud it would be a stream of digits with no context.
 */

/** Bars for the usage card. Fixed, not random — the shape should be stable. */
const BARS = [34, 48, 41, 62, 55, 74, 68, 88, 79]

function Card({
  children,
  icon: Icon,
  title,
  body,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  icon: typeof MagnifyingGlassIcon
  title: string
  body: string
  delay?: number
  className?: string
}) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={cn(
        // The application's card treatment, at the application's radius. Glass
        // needs something behind it, which is what the scene's mesh is for.
        'glass group grid content-start gap-6 rounded-[28px] p-5 transition-transform duration-300',
        'hover:-translate-y-[3px] sm:p-7',
        className,
      )}
    >
      <div aria-hidden className="grid h-[12.25rem] place-items-center overflow-hidden">
        {children}
      </div>
      <div>
        {/* Icon and heading on one line: the icon is a marker for the sentence,
            not a separate object stacked above it. */}
        <h3 className="headline flex items-center gap-2.5 text-lg text-ink">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
            <Icon className="size-[17px]" />
          </span>
          {t(title)}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{t(body)}</p>
      </div>
    </motion.div>
  )
}

/** The panel every fragment sits on: the app's surface, lifted off the card. */
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      // Solid, not glass: nesting glass inside glass reads as a mistake, and
      // this panel is standing in for a real product surface anyway.
      className={cn('w-full overflow-hidden rounded-[14px] border border-line bg-surface shadow-md', className)}
    >
      {children}
    </div>
  )
}

export function FeatureScene() {
  const { t } = useI18n()

  // `mesh` is the dashboard's own hero atmosphere, dialled back: a treatment
  // tuned for a header band is too much colour to fill a whole scene with.
  return (
    <Scene id="features" ground="mesh" groundOpacity={0.5} edge="fade-y" measure="full" className="page-ground">
      <div className="grid justify-items-center text-center">
        <Reveal>
          <Eyebrow tone="brand">{t('Usually four vendors')}</Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <Title size="md" className="mt-4 max-w-[22ch]">
            {t('Everything a phone number needs, in one account')}
          </Title>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-3.5 sm:mt-16 lg:grid-cols-3">
        {/* ── Search ──────────────────────────────────── */}
        <Card
          icon={MagnifyingGlassIcon}
          delay={0.04}
          title="Live number search"
          body="Filter real inventory by country, city, type and capability. Every result carries a published rate and provisions on the spot."
        >
          <Panel className="max-w-[20.5rem]">
            <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2.5">
              <span className="size-1.5 rounded-full bg-brand" />
              <span className="h-1.5 flex-1 rounded-full bg-line-soft" />
            </div>
            <div className="grid gap-2 px-3 py-2.5" dir="ltr">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink">+20 2 2200 0117</span>
                <span className="ms-auto rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.05em] text-brand-ink">
                  VOICE · SMS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-subtle">+20 2 2200 0184</span>
                <span className="ms-auto h-1.5 w-11 rounded-full bg-line-soft" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-subtle">+20 3 4200 0203</span>
                <span className="ms-auto h-1.5 w-8 rounded-full bg-line-soft" />
              </div>
            </div>
            <div className="mx-3 mb-3 mt-1 flex items-center gap-2 rounded-[10px] border-[1.5px] border-brand bg-surface px-2.5 py-2">
              <span className="font-mono text-[11px] text-ink-faint">contains 200</span>
              <span className="ms-auto rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-brand-fg">
                {t('Search')}
              </span>
            </div>
          </Panel>
        </Card>

        {/* ── SIP ─────────────────────────────────────── */}
        <Card
          icon={ServerStackIcon}
          delay={0.08}
          title="SIP that registers first try"
          body="Point a trunk at the PBX you already run. Credentials issue on confirm, encrypted end to end by default."
        >
          <div className="grid w-full max-w-[18.75rem] gap-2.5" dir="ltr">
            <Panel className="px-3 py-3">
              <p className="eyebrow font-mono tracking-[0.1em]">Host</p>
              <p className="mt-1.5 font-mono text-xs text-ink">sip.zoetel.net:5060</p>
            </Panel>
            <div className="flex items-center gap-2.5 rounded-xl border border-success/25 bg-success-soft px-3 py-3">
              <StatusDot tone="success" pulse />
              <span className="font-mono text-[11px] tracking-[0.04em] text-success-ink">
                REGISTERED · 41ms
              </span>
              <span className="ms-auto font-mono text-[9.5px] text-success">TLS · SRTP</span>
            </div>
            <div className="flex gap-2.5">
              {['us-west', 'eu-central'].map((r) => (
                <span
                  key={r}
                  className="flex-1 rounded-[10px] border border-line bg-surface px-2.5 py-2 font-mono text-[10.5px] text-ink-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Usage ───────────────────────────────────── */}
        <Card
          icon={ChartBarIcon}
          delay={0.12}
          title="Usage you can actually read"
          body="Minutes, messages, quality and spend in one view. Per-second metering, published rates, no month-end surprises."
        >
          <Panel className="max-w-[18.75rem] p-3.5">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="text-xs font-medium text-ink">{t('Minutes')}</span>
              <span className="ms-auto inline-flex items-center gap-1 rounded-[5px] bg-success-soft px-1.5 py-0.5 font-mono text-[9.5px] text-success-ink">
                ↗ 24%
              </span>
            </div>
            <div className="flex h-[4.875rem] items-end gap-1.5">
              {BARS.map((h, i) => (
                <motion.span
                  key={i}
                  initial={{ scaleY: 0.12 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
                  style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                  className="flex-1 rounded-t-[3px] bg-gradient-to-b from-brand/85 to-brand/35"
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[8.5px] text-ink-faint" dir="ltr">
              {['Jan', 'Mar', 'May', 'Jul', 'Sep'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </Panel>
        </Card>

        {/* ── Routing ─────────────────────────────────── */}
        <Card
          icon={ArrowsRightLeftIcon}
          delay={0.16}
          title="Route it anywhere"
          body="One inbound number, every destination. SIP trunk, REST, webhook, forwarding — or a Zoie AI agent. Changed in a click."
          className="lg:col-span-2"
        >
          <div className="relative grid size-[12.25rem] place-items-center">
            {[186, 128, 74].map((d, i) => (
              <span
                key={d}
                style={{ width: d, height: d }}
                className={cn(
                  'absolute rounded-full border',
                  ['border-line-strong/60', 'border-line', 'border-line-soft'][i],
                )}
              />
            ))}
            {/* One rotating layer carries all four chips, so they stay in
                formation instead of drifting apart. It is inset by half a chip
                so the chips ride a smaller circle than the outer ring and stay
                inside the card's fragment box, which clips. */}
            <motion.span
              className="absolute inset-[17px]"
              animate={{ rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            >
              {[
                { label: 'SIP', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
                { label: 'API', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
                { label: 'HOOK', pos: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' },
                { label: 'ZOIE', pos: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', brand: true },
              ].map((c) => (
                // Two spans on purpose: the outer one owns the translate that
                // centres the chip on its orbit, the inner one owns the
                // counter-rotation. Both on one element and framer's inline
                // `transform` would overwrite the translate and fling the chip
                // to the middle.
                <span key={c.label} className={cn('absolute', c.pos)}>
                  {/* Counter-rotating the whole chip keeps it upright as the
                      ring turns. Rotating the box and holding only the label
                      level reads as a fault. */}
                  <motion.span
                    animate={{ rotate: -360 }}
                    transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                    className={cn(
                      'grid size-[34px] place-items-center rounded-[11px] border font-mono text-[9px] shadow-sm',
                      c.brand
                        ? 'border-brand-ring bg-brand-soft text-brand-ink'
                        : 'border-line bg-surface text-ink-muted',
                      c.label === 'HOOK' && 'text-[8px]',
                    )}
                  >
                    {c.label}
                  </motion.span>
                </span>
              ))}
            </motion.span>
            <span className="relative grid size-12 place-items-center rounded-2xl bg-brand shadow-brand">
              <Logo size={26} className="[&_*]:!fill-white" />
            </span>
          </div>
        </Card>

        {/* ── Keys and logs ───────────────────────────── */}
        <Card
          icon={KeyIcon}
          delay={0.2}
          title="Keys, logs, webhooks"
          body="Scoped keys, signed webhooks and every request logged. The same key that buys a number attaches an agent later."
        >
          <div className="grid w-full max-w-[18.75rem] gap-2.5" dir="ltr">
            <div className="flex items-center gap-2 rounded-[11px] bg-onyx px-3 py-2.5">
              <span className="font-mono text-[11px] text-[hsl(249_88%_78%)]">zt_live_9f4c</span>
              <span className="font-mono text-[11px] text-white/30">············</span>
              <span className="eyebrow ms-auto font-mono text-white/50">Copy</span>
            </div>
            <Panel className="px-3 py-1">
              {[
                ['call.completed', '2s'],
                ['message.delivered', '6s'],
                ['number.provisioned', '1m'],
              ].map(([event, ago], i) => (
                <div
                  key={event}
                  className={cn(
                    'flex items-center gap-2.5 py-2 font-mono text-[10.5px] text-ink-muted',
                    i < 2 && 'border-b border-line-soft',
                  )}
                >
                  <span className="text-success">200</span>
                  {event}
                  <span className="ms-auto text-ink-faint">{ago}</span>
                </div>
              ))}
            </Panel>
          </div>
        </Card>
      </div>
    </Scene>
  )
}
