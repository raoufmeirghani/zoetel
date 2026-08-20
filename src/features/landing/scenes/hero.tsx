import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { formatE164, money } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { EASE, Glow, LineWipe, Title } from '../kit'

/**
 * Scene 01 — the opening frame.
 *
 * Almost no interface. One sentence at display scale, one glimpse of the
 * product, and a horizon. The artwork runs the full width of the viewport and
 * dissolves downward through the application's own eased mask, so the scene has
 * no bottom edge — the next chapter begins inside this one's atmosphere rather
 * than underneath it.
 *
 * The single product fragment is cropped deliberately. A whole screenshot
 * answers the question; a corner of one asks it.
 */
export function HeroScene() {
  const { t } = useI18n()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // The horizon drifts and the type lifts at different rates, which reads as
  // depth rather than as a parallax effect.
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div ref={ref} className="relative isolate min-h-[92svh] overflow-hidden pt-32 sm:pt-40 lg:min-h-[96svh]">
      {/* Horizon. Two layers: the mesh for colour, the artwork for the scene. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[62rem] overflow-hidden"
      >
        <span className="hero-mesh" />
        <motion.img
          src="/usage.webp"
          alt=""
          style={{ y: artY, scale: artScale }}
          className="hero-fade hero-art absolute inset-x-0 top-0 h-full w-full select-none object-cover object-[50%_16%] mix-blend-multiply [opacity:0.72] dark:mix-blend-screen dark:[opacity:0.26]"
        />
        <span className="hero-grain" />
      </div>
      <Glow x="18%" y="12%" size="52rem" opacity={0.5} />

      <motion.div
        style={{ y: copyY, opacity: fade }}
        className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="chrome inline-flex items-center gap-2 rounded-full py-1.5 pe-3.5 ps-2.5"
        >
          <StatusDot tone="success" pulse />
          <span className="text-xs font-medium text-ink-muted">{t('Egypt-first · NTRA licensed')}</span>
        </motion.div>

        {/* The headline wipes up line by line. Three lines, authored — not
            balanced, so the rhythm survives every viewport. */}
        <Title as="h1" size="xl" balance={false} className="mt-8 max-w-[54rem]">
          <LineWipe immediate delay={0.05}>
            {t('Every business')}
          </LineWipe>
          <LineWipe immediate delay={0.15}>
            {t('needs a phone number.')}
          </LineWipe>
          <LineWipe immediate delay={0.25}>
            <span className="text-ink-muted">{t('None should wait for it.')}</span>
          </LineWipe>
        </Title>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button variant="primary" size="xl" asChild>
            <Link to="/welcome">
              {t('Start free')}
              <ArrowRight className="size-[18px]" />
            </Link>
          </Button>
          <Button variant="ghost" size="xl" asChild>
            <Link to="/developers">{t('Read the docs')}</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* The glimpse. Anchored to the bottom-right of the frame and cropped by
          the viewport edge, so it reads as a detail of something bigger. */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
        style={{ opacity: fade }}
        className="pointer-events-none absolute -bottom-4 -end-6 hidden w-[30rem] lg:block xl:-end-2 xl:w-[34rem]"
      >
        <HeroGlimpse />
      </motion.div>

      {/* Scroll cue: a hairline that breathes. The only piece of chrome in the
          scene, and it points at the next chapter. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
      >
        <span className="eyebrow text-ink-faint">{t('The problem')}</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-ink-faint"
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.div>
    </div>
  )
}

/**
 * One row of live inventory and one line of its cost. Real components, real
 * formatters — the same fragment the marketplace renders.
 */
function HeroGlimpse() {
  const { t } = useI18n()

  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 bottom-2 h-20 rounded-[50%] bg-ink/10 blur-3xl"
      />
      <div className="glass relative overflow-hidden rounded-s-[26px] shadow-xl dark:ring-1 dark:ring-white/[0.07]">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
          <span className="eyebrow">{t('Cairo · available now')}</span>
          <span className="flex items-center gap-1.5 text-xs text-success-ink">
            <StatusDot tone="success" pulse />
            {t('live')}
          </span>
        </div>
        <div className="flex items-center gap-4 px-5 py-5">
          <CarrierAvatar carrier="we" size="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-lg tabular-nums text-ink">
              {formatE164('+20224618890')}
            </span>
            <span className="mt-1 block text-xs text-ink-faint">{t('Local · New Cairo · voice, SMS')}</span>
          </span>
          <span className="shrink-0 text-end">
            <span className="display block text-xl text-ink">{money(1.03)}</span>
            <span className="block text-2xs text-ink-faint">{t('/mo')}</span>
          </span>
        </div>
        <div className="border-t border-line-soft px-5 py-3">
          <p className="text-xs leading-relaxed text-ink-subtle">
            {t('Provisioned in 4 seconds. Routable before you close the tab.')}
          </p>
        </div>
      </div>
    </div>
  )
}
