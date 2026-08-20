import * as React from 'react'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Check, CreditCard, Network, PhoneCall, ScanLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/ui/status'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { formatE164, money } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE, Glow, Title } from '../kit'

/**
 * Scene 05 — provisioning, told as a sticky sequence.
 *
 * The scene is a tall track. The product fragment pins to the viewport while the
 * four steps scroll past it, and the fragment advances a state each time a step
 * takes over. Reading the copy and watching the thing happen are the same
 * gesture, which no static diagram of the flow can manage.
 *
 * Progress is read from scroll position rather than from intersection
 * observers on each step: one motion value, four thresholds, no flicker at the
 * boundaries.
 */

const STEPS = [
  {
    icon: ScanLine,
    label: 'Verify once',
    body: 'Identity or business documents, submitted in about three minutes. One review unlocks every regulated range, permanently.',
  },
  {
    icon: CreditCard,
    label: 'Fund the wallet',
    body: 'Card or bank transfer. Usage draws down per second, and calls stop at zero rather than becoming an invoice.',
  },
  {
    icon: PhoneCall,
    label: 'Take the number',
    body: 'Confirm and the carrier hold becomes yours. Local Cairo lines are live in seconds; nothing is charged until you press the button.',
  },
  {
    icon: Network,
    label: 'Point it somewhere',
    body: 'A SIP trunk, your webhook, a plain forward, or a Zoie agent. Change it whenever — new calls pick it up immediately.',
  },
]

export function ProvisionScene() {
  const { t } = useI18n()
  const track = React.useRef<HTMLDivElement>(null)
  const [step, setStep] = React.useState(0)

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Four equal bands, nudged so a step claims the pin slightly before its
    // copy reaches the middle of the screen.
    const next = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length + 0.18))
    setStep((prev) => (prev === next ? prev : next))
  })

  return (
    <section className="relative isolate">
      <div aria-hidden className="edge-fade-y absolute inset-0 -z-10">
        <span className="bg-paper absolute inset-0" />
      </div>
      <Glow x="72%" y="18%" size="46rem" opacity={0.35} />

      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 pt-28 sm:px-8 sm:pt-36">
        <div className="max-w-[36rem]">
          <p className="eyebrow">{t('04 — Getting live')}</p>
          <Title size="lg" className="mt-6">
            {t('Four steps. One afternoon.')}
          </Title>
        </div>
      </div>

      {/* The track. Its height is what gives the pin something to travel
          through — one viewport per step, plus a lead-in. */}
      <div ref={track} className="relative mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Copy column: the steps in sequence, each a screen apart. */}
          <ol className="relative py-16 lg:py-24">
            {STEPS.map((s, i) => {
              const active = i === step
              return (
                <li key={s.label} className="flex min-h-[62svh] flex-col justify-center lg:min-h-[74svh]">
                  <motion.div
                    animate={{ opacity: active ? 1 : 0.32 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="max-w-[30rem]"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          'grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-500',
                          active ? 'bg-brand text-brand-fg shadow-brand' : 'bg-veil-strong text-ink-faint',
                        )}
                      >
                        <s.icon className="size-4" />
                      </span>
                      <span className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
                        {t('Step {n}', { n: i + 1 })}
                      </span>
                    </span>
                    <h3 className="headline mt-5 text-2xl text-ink sm:text-3xl">{t(s.label)}</h3>
                    <p className="mt-4 text-lg leading-relaxed text-ink-muted">{t(s.body)}</p>
                  </motion.div>
                </li>
              )
            })}
          </ol>

          {/* Pinned column: one object, four states. Hidden below lg, where the
              sequence becomes the fragment inline under each step instead. */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-svh items-center">
              <div className="w-full">
                <ProvisionStage step={step} />
                <div className="mt-6 flex items-center gap-1.5">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.label}
                      className={cn(
                        'h-0.5 flex-1 rounded-full transition-colors duration-500',
                        i <= step ? 'bg-brand' : 'bg-line-strong',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below lg the pinned stage would have nothing to pin to, so the final
          state is shown once, after the steps. */}
      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 pb-28 sm:px-8 lg:hidden">
        <ProvisionStage step={3} />
      </div>
    </section>
  )
}

/**
 * The object that advances. Kept to one card so the eye has a fixed place to
 * look; what changes inside it is the number's state, exactly as the app shows
 * it — held, funded, active, routed.
 */
function ProvisionStage({ step }: { step: number }) {
  const { t } = useI18n()

  const state = [
    { badge: 'Reserved', tone: 'warning' as const, dot: 'warning' as const, note: 'Held pending verification' },
    { badge: 'Funded', tone: 'info' as const, dot: 'info' as const, note: 'Wallet topped up' },
    { badge: 'Active', tone: 'success' as const, dot: 'success' as const, note: 'Provisioned and billable' },
    {
      badge: 'Routed',
      tone: 'success' as const,
      dot: 'success' as const,
      note: 'Answering on Production Edge',
    },
  ][step]

  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -bottom-6 h-20 rounded-[50%] bg-ink/[0.08] blur-3xl"
      />
      <div className="glass relative overflow-hidden rounded-[26px] shadow-xl dark:ring-1 dark:ring-white/[0.07]">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
          <span className="eyebrow">{t('Your first number')}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={state.badge}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <Badge tone={state.tone} size="sm">
                <StatusDot tone={state.dot} pulse={step >= 2} />
                {t(state.badge)}
              </Badge>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center gap-4">
            <CarrierAvatar carrier="we" size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-xl tabular-nums text-ink">
                {formatE164('+20224618890')}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={state.note}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 block text-xs text-ink-faint"
                >
                  {t(state.note)}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          {/* Checklist. Each row lights as its step passes, which is the whole
              point of pinning the card. */}
          <ul className="mt-7 space-y-3 border-t border-line-soft pt-5">
            {[
              { label: 'Business verified', at: 0 },
              { label: 'Wallet funded', at: 1 },
              { label: 'Number provisioned', at: 2 },
              { label: 'Routing assigned', at: 3 },
            ].map((row) => {
              const done = step >= row.at
              return (
                <li key={row.label} className="flex items-center gap-3">
                  <motion.span
                    animate={{
                      backgroundColor: done ? 'hsl(var(--brand))' : 'hsl(var(--veil-strong))',
                      color: done ? 'hsl(var(--brand-fg))' : 'hsl(var(--ink-faint))',
                      scale: done ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="grid size-5 shrink-0 place-items-center rounded-full"
                  >
                    <Check className="size-3" />
                  </motion.span>
                  <motion.span
                    animate={{ opacity: done ? 1 : 0.45 }}
                    transition={{ duration: 0.35 }}
                    className="text-base text-ink"
                  >
                    {t(row.label)}
                  </motion.span>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 flex items-baseline justify-between border-t border-line-soft pt-5">
            <span className="text-sm text-ink-subtle">{t('Charged so far')}</span>
            <motion.span
              key={step}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="display text-xl text-ink"
            >
              {step >= 2 ? money(1.03) : money(0)}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}
