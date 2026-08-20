import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Layout primitives for the marketing surface.
 *
 * These are compositions, not a second design language: every value here comes
 * from the same tokens the application uses. What differs is scale and density —
 * a marketing page reads at arm's length and needs far more air between ideas
 * than a dashboard does, so the vertical rhythm is roughly three times the
 * app's and content sits in a narrower measure than the app's `--page-max`.
 */

export const EASE = [0.16, 1, 0.3, 1] as const

/** The reading measure for prose on this page — shorter than the app's column. */
export const MEASURE = 'max-w-[34rem]'

/**
 * One idea per band, with generous air above and below. `flush` drops the
 * bottom padding for the rare pair of bands that belong to each other.
 */
export function Band({
  children,
  className,
  id,
  tight,
  flush,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  tight?: boolean
  flush?: boolean
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        // Anchored bands clear the fixed navigation when jumped to.
        id && 'scroll-mt-24',
        tight ? 'py-16 sm:py-20' : 'py-24 sm:py-32 lg:py-40',
        flush && 'pb-0 sm:pb-0 lg:pb-0',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">{children}</div>
    </section>
  )
}

/**
 * Enters once, on approach. Deliberately small: 14px and 600ms, which reads as
 * the page settling rather than as an effect. `MotionConfig reducedMotion="user"`
 * in App.tsx already neutralises it for anyone who asks.
 */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('eyebrow', className)}>{children}</p>
}

/**
 * The headline scale for the page. `.headline` is the app's display face; only
 * the size steps up — a marketing headline is the same voice spoken louder.
 */
export function Title({
  children,
  as: Tag = 'h2',
  size = 'md',
  balance = true,
  className,
}: {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  /**
   * Off when the copy carries its own line breaks — balancing then fights the
   * author, re-wrapping lines that were chosen for rhythm.
   */
  balance?: boolean
  className?: string
}) {
  const scale = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.06]',
    // The hero steps through four sizes rather than two: at 375px a 44px
    // headline with authored line breaks eats the entire first screen.
    lg: 'text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.04]',
  }
  return (
    <Tag className={cn('headline text-ink', balance && 'text-balance', scale[size], className)}>{children}</Tag>
  )
}

export function Lede({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-lg leading-relaxed text-ink-muted', MEASURE, className)}>{children}</p>
}

/**
 * A hairline that fades at both ends, so a divider never collides with the
 * page's soft edges. Used instead of borders between editorial blocks.
 */
export function Hairline({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'block h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent',
        className,
      )}
    />
  )
}

/**
 * The atmospheric band behind a section. Reuses the application's hero
 * machinery wholesale — the same artwork, the same eased 11-stop fade, the same
 * blend modes — so a marketing band and a product header are visibly the same
 * material.
 *
 * `mix-blend-multiply` lets the white-backed art sit on the canvas without a
 * visible plate; dark mode screens it back at a fraction of the opacity the
 * pale art was tuned at.
 */
export function Backdrop({
  src,
  opacity = 0.62,
  height = 'h-[46rem]',
  from = '-top-24',
  mesh = true,
  className,
}: {
  src?: string
  opacity?: number
  height?: string
  from?: string
  mesh?: boolean
  className?: string
}) {
  const [failed, setFailed] = React.useState(false)

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0 -z-10 overflow-hidden', from, height, className)}
    >
      {mesh && (
        <div className="absolute inset-x-0 -top-24 bottom-0 overflow-hidden">
          <span className="hero-mesh" />
          <span className="hero-grain" />
        </div>
      )}
      {src && !failed && (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ '--hero-img': opacity } as React.CSSProperties}
          className={cn(
            'absolute inset-x-0 top-0 h-full w-full select-none object-cover object-[50%_18%]',
            'hero-fade hero-art',
            '[opacity:var(--hero-img)] dark:[opacity:calc(var(--hero-img)*0.36)]',
            'mix-blend-multiply dark:mix-blend-screen',
          )}
        />
      )}
    </div>
  )
}

/**
 * Moves a decorative layer at a fraction of scroll speed. Range is kept under
 * 40px: enough to give the composition depth as the page moves, small enough
 * that nobody notices it happening.
 */
export function Parallax({
  children,
  distance = 28,
  className,
}: {
  children: React.ReactNode
  distance?: number
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

/**
 * Two columns that swap sides down the page, so the eye is never marched down a
 * single rail. Collapses to one column below `lg`, always with the copy first —
 * on a phone the sentence should arrive before the picture.
 */
export function Split({
  copy,
  visual,
  flip,
  className,
}: {
  copy: React.ReactNode
  visual: React.ReactNode
  flip?: boolean
  className?: string
}) {
  return (
    <div className={cn('grid items-center gap-12 lg:grid-cols-2 lg:gap-20', className)}>
      <div className={cn('min-w-0', flip && 'lg:order-2')}>{copy}</div>
      <div className={cn('min-w-0', flip && 'lg:order-1')}>{visual}</div>
    </div>
  )
}
