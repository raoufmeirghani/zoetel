import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useDirSign, useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Title } from '../kit'

/**
 * Scene 07 — coverage, as a horizontal pan.
 *
 * The only scene that moves sideways. Its track is pinned and the row of ranges
 * is pulled across as the page scrolls down, which gives the chapter a motion
 * signature nothing else on the page has — and it suits the content, because
 * coverage is a list that genuinely continues past the edge of the frame.
 *
 * The pan is driven from scroll progress rather than from a scroll container, so
 * it cannot fight the page's own scrolling or trap a trackpad. Below `lg` the
 * track simply becomes a normal horizontal scroller, which is the right
 * behaviour on a touch device anyway.
 */

interface Range {
  flag: string
  country: string
  kind: string
  detail: string
  status: 'live' | 'soon'
}

const RANGES: Range[] = [
  {
    flag: '🇪🇬',
    country: 'Egypt',
    kind: 'Local · geographic',
    detail: 'Cairo, Giza, Alexandria and 27 more governorates',
    status: 'live',
  },
  {
    flag: '🇪🇬',
    country: 'Egypt',
    kind: 'Mobile',
    detail: 'WE, Vodafone, Etisalat and Orange ranges',
    status: 'live',
  },
  {
    flag: '🇪🇬',
    country: 'Egypt',
    kind: 'National · toll-free',
    detail: 'Short codes and 0800 numbers, NTRA authorised',
    status: 'live',
  },
  {
    flag: '🇦🇪',
    country: 'UAE',
    kind: 'Mobile',
    detail: 'Etisalat and du, for regional campaigns',
    status: 'live',
  },
  {
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    kind: 'Mobile',
    detail: 'STC and Mobily, verification traffic',
    status: 'live',
  },
  {
    flag: '🇬🇧',
    country: 'United Kingdom',
    kind: 'Local · geographic',
    detail: 'London and regional, for inbound sales',
    status: 'live',
  },
  {
    flag: '🇩🇪',
    country: 'Germany',
    kind: 'Local · geographic',
    detail: 'Frankfurt edge, EU data residency',
    status: 'soon',
  },
  { flag: '🇰🇼', country: 'Kuwait', kind: 'Mobile', detail: 'Zain and Ooredoo', status: 'soon' },
]

export function CoverageScene() {
  const { t } = useI18n()
  const dirSign = useDirSign()
  const track = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef<HTMLDivElement>(null)
  const row = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })

  /**
   * The pan distance is measured, not expressed as a percentage.
   *
   * A percentage `x` resolves against the animated element's own width, which
   * on a `w-max` flex row is whatever the content happens to add up to — and in
   * a mirrored layout the row overflows the other way, so the same percentage
   * lands somewhere unrelated. Measuring the actual overflow and translating by
   * pixels is deterministic in both directions and survives a font swap or a
   * card being added.
   */
  const [distance, setDistance] = React.useState(0)

  React.useEffect(() => {
    const measure = () => {
      if (!row.current || !frame.current) return
      const overflow = row.current.scrollWidth - frame.current.clientWidth
      setDistance(Math.max(0, overflow + 48))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (row.current) ro.observe(row.current)
    if (frame.current) ro.observe(frame.current)
    return () => ro.disconnect()
  }, [])

  // Leftward in a left-to-right layout, rightward in a mirrored one — in both
  // cases, toward the cards that are still off-frame.
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance * dirSign])
  const dim = useTransform(scrollYProgress, [0, 0.12], [0, 1])

  return (
    <section className="relative isolate">
      <div aria-hidden className="edge-fade-y absolute inset-0 -z-10">
        <span className="bg-grid absolute inset-0" />
      </div>

      {/* Desktop: a pinned frame the row is pulled through. */}
      <div ref={track} className="relative hidden h-[260svh] lg:block">
        <div ref={frame} className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
          <div className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">
            <p className="eyebrow">{t('06 — Reach')}</p>
            <Title size="lg" className="mt-6 max-w-[34rem]">
              {t('Egypt first. Then wherever your customers are.')}
            </Title>
          </div>

          <motion.div ref={row} style={{ x }} className="mt-16 flex w-max gap-6 px-6 sm:px-8">
            {RANGES.map((r, i) => (
              <RangeCard key={`${r.country}-${r.kind}`} range={r} index={i} />
            ))}
            <ClosingCard />
          </motion.div>

          {/* A fade on the leading edge, so cards arrive out of the ground
              rather than sliding in from a hard boundary. */}
          <motion.span
            aria-hidden
            style={{ opacity: dim }}
            className="pointer-events-none absolute inset-y-0 start-0 w-32 bg-gradient-to-r from-canvas to-transparent rtl:bg-gradient-to-l"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 end-0 w-32 bg-gradient-to-l from-canvas to-transparent rtl:bg-gradient-to-r"
          />
        </div>
      </div>

      {/* Touch: a plain scroller, which is what a finger expects. */}
      <div className="py-24 lg:hidden">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">
          <p className="eyebrow">{t('06 — Reach')}</p>
          <Title size="md" className="mt-5">
            {t('Egypt first. Then wherever your customers are.')}
          </Title>
        </div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:px-8">
          {RANGES.map((r, i) => (
            <RangeCard key={`${r.country}-${r.kind}`} range={r} index={i} />
          ))}
          <ClosingCard />
        </div>
      </div>
    </section>
  )
}

/**
 * A range, presented as a plate rather than a card: no border, a translucent
 * ground, and the flag doing the work an icon usually would.
 */
function RangeCard({ range, index }: { range: Range; index: number }) {
  const { t } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className={cn(
        'glass w-[19rem] shrink-0 snap-start rounded-[24px] p-6 shadow-md',
        'dark:ring-1 dark:ring-white/[0.06] sm:w-[21rem]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {range.flag}
        </span>
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em]',
            range.status === 'live' ? 'bg-success-soft text-success-ink' : 'bg-veil-strong text-ink-muted',
          )}
        >
          {t(range.status === 'live' ? 'Live' : 'Soon')}
        </span>
      </div>
      <p className="mt-6 text-xl font-medium text-ink">{t(range.country)}</p>
      <p className="mt-1 text-sm text-ink-faint">{t(range.kind)}</p>
      <p className="mt-5 text-base leading-relaxed text-ink-subtle">{t(range.detail)}</p>
    </motion.div>
  )
}

/** The end of the row: a statement rather than another plate. */
function ClosingCard() {
  const { t } = useI18n()
  return (
    <div className="flex w-[19rem] shrink-0 snap-start items-center sm:w-[21rem]">
      <p className="headline text-balance text-2xl leading-snug text-ink-muted">
        {t('190+ destinations reachable outbound, every rate published.')}
      </p>
    </div>
  )
}
