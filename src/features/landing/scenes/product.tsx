import * as React from 'react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE, Eyebrow, Glow, Lede, Reveal, SCREEN_LIFT, Scene, Title } from '../kit'

/**
 * Scene 04 — the product.
 *
 * No feature copy. Three real screens of the application, switched by clicking a
 * step, with the window running off the end of the page so it reads as a detail
 * of something larger rather than a screenshot of something small.
 *
 * The screens advance on their own. Scroll-coupling was tried and cut — it took
 * control away from the reader — but a click-only switcher has the opposite
 * problem: most visitors never discover there are three screens, so two thirds
 * of the section is invisible to them. A timer shows all three without being
 * asked.
 *
 * Clicking still works and stops the timer for good. Someone who has taken hold
 * of the control is reading, and continuing to move the thing under them is the
 * rudest thing this page could do.
 */

/** Long enough to read the step and take in the screen it belongs to. */
const DWELL = 5000

const STEPS = [
  {
    eyebrow: '01 — Numbers',
    title: 'Set preferences',
    body: 'Live carrier stock, published rates, checkout on a card.',
    src: '/screens/numbers.png',
    alt: 'Finding a number in Zoetel',
  },
  {
    eyebrow: '02 — Routing',
    title: 'Point it somewhere',
    body: 'A SIP trunk to your PBX, a webhook, forwarding, or a Zoie agent.',
    src: '/screens/routing.png',
    alt: 'Choosing where calls go',
  },
  {
    eyebrow: '03 — Usage',
    title: 'Watch it run',
    body: 'Minutes, spend and call quality across every number.',
    src: '/screens/usage.png',
    alt: 'Usage, minutes and spend',
  },
]

export function ProductScene() {
  const { t } = useI18n()
  const [step, setStep] = React.useState(0)
  const [held, setHeld] = React.useState(false)

  // Only runs while the section is on screen: a timer ticking through a scene
  // nobody is looking at burns frames and lands the reader mid-cycle when they
  // do arrive.
  const section = React.useRef<HTMLDivElement>(null)
  const seen = useInView(section, { amount: 0.35 })

  React.useEffect(() => {
    if (held || !seen) return
    const id = setInterval(() => setStep((i) => (i + 1) % STEPS.length), DWELL)
    return () => clearInterval(id)
  }, [held, seen])

  const pick = (i: number) => {
    setStep(i)
    setHeld(true)
  }

  return (
    <Scene id="how" ground="onyx" measure="full" edge="none" bleed>
      <Glow x="94%" y="50%" size="48rem" opacity={0.55} />

      <div
        ref={section}
        className="mx-auto grid max-w-[80rem] items-center gap-8 ps-6 sm:ps-8 lg:grid-cols-[minmax(17.5rem,25rem)_minmax(0,1fr)] lg:gap-14"
      >
        <div className="grid gap-6 pe-6 sm:gap-9 sm:pe-8 lg:pe-0">
          <div>
            <Reveal>
              <Eyebrow tone="inverse">{t('No implementation project')}</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title size="md" className="mt-3.5 !text-white">
                {t('This is the whole thing.')}
              </Title>
            </Reveal>
            <Reveal delay={0.12}>
              <Lede className="mt-4 !text-white/55">
                {t(
                  'Buy a number, point it somewhere, watch it run. Three screens, one control plane, no implementation project.',
                )}
              </Lede>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            {/* Wider gaps and more inset than a dense list wants. Three items
                carrying a label, a heading and a sentence each need the room —
                packed tight they read as one block of text with rules in it. */}
            <div className="grid gap-8 sm:gap-10">
              {STEPS.map((s, i) => {
                const on = i === step
                return (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => pick(i)}
                    aria-current={on}
                    className={cn(
                      'grid gap-2 border-s-2 ps-5 text-start transition-colors duration-500',
                      on ? 'border-brand' : 'border-white/12 hover:border-white/30',
                    )}
                  >
                    <span
                      className={cn(
                        'eyebrow font-mono tracking-[0.11em] transition-colors duration-500',
                        on ? '!text-[hsl(249_88%_78%)]' : '!text-white/35',
                      )}
                    >
                      {t(s.eyebrow)}
                    </span>
                    <span
                      className={cn(
                        'headline text-lg transition-colors duration-500',
                        on ? 'text-white' : 'text-white/40',
                      )}
                    >
                      {t(s.title)}
                    </span>
                    <span
                      className={cn(
                        'text-sm leading-relaxed transition-colors duration-500',
                        on ? 'text-white/60' : 'text-white/25',
                      )}
                    >
                      {t(s.body)}
                    </span>
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>

        {/* The window. All three images occupy one grid cell so the frame takes
            the natural height of the tallest — giving it a fixed aspect ratio or
            positioning the image at a percentage width either clips the content
            or leaves a dead gap, which is how two earlier revisions failed. */}
        <Reveal delay={0.1} className="min-w-0 max-lg:pe-6 max-sm:pe-0 lg:-me-[clamp(40px,9vw,140px)]">
          <div
            className="grid overflow-hidden rounded-s-2xl border border-e-0 border-white/15 max-lg:rounded-e-2xl max-lg:border-e"
            style={SCREEN_LIFT}
          >
            {STEPS.map((s, i) => (
              <motion.img
                key={s.src}
                src={s.src}
                alt={t(s.alt)}
                loading={i === 0 ? 'eager' : 'lazy'}
                // Screenshots of an English UI are not mirrored in Arabic: a
                // flipped screenshot is a screenshot of a product that does not
                // exist. Only its position on the page mirrors.
                dir="ltr"
                className="col-start-1 row-start-1 block h-auto w-full"
                animate={i === step ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.985 }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </Scene>
  )
}
