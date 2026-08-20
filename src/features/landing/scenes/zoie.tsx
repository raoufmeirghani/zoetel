import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Cpu, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ZOIE_URL } from '@/lib/zoie'
import { formatE164 } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import { EASE, Glow, Reveal, Scene, Title } from '../kit'

/**
 * Scene 09 — from infrastructure to intelligence.
 *
 * Composed as two stacked planes with real depth between them, centred rather
 * than split, so the chapter is read top to bottom as a lift rather than left to
 * right as a comparison. The number is the only thing that crosses: it detaches
 * from the lower plane and travels up the channel as the scene enters.
 *
 * Zoie's product rule holds here as it does in the app. It is one destination a
 * number can point at, it lives on its own domain, and reaching it is something
 * the visitor chooses to do. No banner, no interstitial, no upsell.
 */

const CAPABILITIES = [
  'Voice agents that answer, qualify and book',
  'AI SMS and WhatsApp on the same number',
  'Appointments written into a calendar',
  'CRM sync and lead scoring',
  'Human handoff the moment it is needed',
]

export function ZoieScene() {
  const { t } = useI18n()
  const numbers = useApp((s) => s.numbers)
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 55%'] })

  // The number rides the channel between the planes, and fades as it arrives —
  // otherwise it slides behind the upper plane and reads as a glitch rather
  // than as a handover.
  const travel = useTransform(scrollYProgress, [0.15, 0.75], ['0rem', '-9.5rem'])
  const fade = useTransform(scrollYProgress, [0.15, 0.3, 0.62, 0.75], [0, 1, 1, 0])
  const handOff = useTransform(scrollYProgress, [0.35, 0.7], [0, 1])

  const sample = numbers[0]?.e164 ?? '+20224618890'

  return (
    <Scene ground="mesh" groundOpacity={0.42} measure="tall" edge="fade-y">
      <Glow x="50%" y="6%" size="54rem" opacity={0.4} />

      <Reveal className="mx-auto max-w-[38rem] text-center">
        <p className="eyebrow">{t('08 — When you are ready')}</p>
        <Title size="lg" className="mt-6">
          {t('Infrastructure meets intelligence.')}
        </Title>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">
          {t(
            'Every number here can become an AI channel. The line, the trunk and the billing stay with Zoetel. The agent that picks up lives in Zoie.',
          )}
        </p>
      </Reveal>

      <div ref={ref} className="relative mx-auto mt-24 max-w-[42rem]">
        {/* Upper plane — Zoie. Onyx, so the lift is legible as a change of
            material and not just of position. */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="relative z-20"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-onyx shadow-xl dark:ring-1 dark:ring-white/[0.08]">
            <span aria-hidden className="bg-tooth" />
            <span
              aria-hidden
              className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full opacity-40 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 70%)' }}
            />
            <div className="relative px-6 py-7 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5">
                  <span className="bg-white/12 grid size-8 place-items-center rounded-xl text-white">
                    <Cpu className="size-4" />
                  </span>
                  <span className="text-lg font-medium text-white">{t('Zoie')}</span>
                </span>
                <span className="eyebrow text-white/55">{t('Intelligence')}</span>
              </div>

              <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {CAPABILITIES.map((c, i) => (
                  <motion.li
                    key={c}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.25 + i * 0.06, ease: EASE }}
                    className={cn(
                      'rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm leading-relaxed text-white/75',
                      i === CAPABILITIES.length - 1 && 'sm:col-span-2',
                    )}
                  >
                    {t(c)}
                  </motion.li>
                ))}
              </ul>

              {/* The number, arrived. Opacity is driven by the same scroll
                  progress that moves the travelling copy below. */}
              <motion.div
                style={{ opacity: handOff }}
                className="mt-7 flex items-center gap-3 border-t border-white/10 pt-6"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand text-brand-fg">
                  <Phone className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-sm tabular-nums text-white">
                    {formatE164(sample)}
                  </span>
                  <span className="block text-2xs text-white/60">{t('now answered by an agent')}</span>
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* The channel. One number wide, gradient-lit, with the travelling
            number pinned to it. */}
        <div className="relative h-40" aria-hidden>
          <span className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-brand/45 via-line-strong to-line-strong rtl:translate-x-1/2" />
          <motion.span
            style={{ y: travel, opacity: fade }}
            className="absolute bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
          >
            <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 shadow-md">
              <Phone className="size-3 text-brand" />
              <span className="font-mono text-2xs tabular-nums text-ink">{formatE164(sample)}</span>
            </span>
          </motion.span>
        </div>

        {/* Lower plane — Zoetel. The ground the number starts on. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-8% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative"
        >
          <div className="glass overflow-hidden rounded-[28px] px-6 py-7 shadow-lg dark:ring-1 dark:ring-white/[0.06] sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-brand text-brand-fg">
                  <Phone className="size-4" />
                </span>
                <span className="text-lg font-medium text-ink">{t('Zoetel')}</span>
              </span>
              <span className="eyebrow">{t('Infrastructure')}</span>
            </div>
            <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-ink-subtle">
              {t(
                'The number, the trunk, the routing, the wallet — everything that has to be licensed, provisioned and metered.',
              )}
            </p>
          </div>
        </motion.div>
      </div>

      <Reveal delay={0.1} className="mx-auto mt-16 max-w-[38rem] text-center">
        <Button variant="primary" size="xl" asChild>
          <a href={`${ZOIE_URL}/?from=zoetel-landing`} target="_blank" rel="noopener noreferrer">
            {t('Open Zoie')}
            <ArrowUpRight className="size-[18px]" />
          </a>
        </Button>
        <p className="mt-5 text-sm leading-relaxed text-ink-faint">
          {t('Opens in a new tab. Zoie is a separate product, priced separately, built to work with Zoetel.')}
        </p>
      </Reveal>
    </Scene>
  )
}
