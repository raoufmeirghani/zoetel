import { useI18n } from '@/lib/i18n'
import { Figure, Reveal, Title } from '../kit'

/**
 * Scene 06 — reach.
 *
 * A light band between two dark scenes, so the page breathes before Zoie. The
 * app's hero artwork covers it under a scrim: the same landscape as the opening
 * frame, further along, which ties the end of the page to its beginning.
 *
 * The four figures are the only unsourced numbers on this page — the client never
 * supplied real ones. They are marked in the code rather than quietly shipped, so
 * whoever confirms them knows where to look.
 */

const FIGURES = [
  // TODO(client): unverified. Confirm against real platform telemetry, or cut
  // the strip — an invented uptime figure is a liability, not a proof point.
  { value: '99.99', unit: '%', label: 'Platform uptime' },
  { value: '60', unit: 's', label: 'To first call' },
  { value: '41', unit: 'ms', label: 'Median latency' },
  // This one is real: the pricing page publishes rates for 190+ destinations.
  { value: '190', unit: '+', label: 'Countries' },
]

export function CoverageScene() {
  const { t } = useI18n()

  return (
    <section className="relative isolate overflow-hidden bg-[hsl(224_45%_96%)] dark:bg-onyx-2">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <img
          src="/usage.webp"
          alt=""
          className="hero-art size-full object-cover object-[50%_34%] dark:opacity-20"
        />
        <span className="absolute inset-0 bg-gradient-to-b from-[hsl(224_45%_96%/0.62)] via-surface/10 to-surface/90 dark:from-onyx-2/60 dark:via-onyx-2/30 dark:to-onyx-2" />
      </div>

      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 pb-12 pt-24 sm:px-8 sm:pb-16 sm:pt-32 lg:pt-36">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Title size="md" className="max-w-[20ch]">
              {t('Real infrastructure in 190+ countries. None of it your problem.')}
            </Title>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="max-w-[34ch] text-md leading-relaxed text-ink-muted">
              {t(
                'Redundant carriers, encrypted media, automatic failover. You see a number and a rate; the interconnects stay ours.',
              )}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-ink/15 pt-6 sm:mt-20 sm:gap-8 lg:grid-cols-4">
            {FIGURES.map((f) => (
              <Figure key={f.label} value={f.value} unit={f.unit} label={t(f.label)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
