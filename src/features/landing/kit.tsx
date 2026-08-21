import * as React from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Scene primitives for the marketing surface.
 *
 * The page is a sequence of scenes, not a stack of sections. A scene owns three
 * things a section usually doesn't: its own ground, its own vertical measure,
 * and its own way of ending. That is what stops a long page reading as one white
 * canvas — the transition between two scenes becomes part of the composition,
 * so there is never a rule or a gap left doing that work.
 *
 * Everything here draws on the application's tokens. Two things differ from the
 * app, both on purpose:
 *
 * - **Scale.** Type steps up and the vertical measure is several times the
 *   dashboard's, because this is read at arm's length rather than worked in.
 * - **Icons.** This surface uses Heroicons' *solid* set; the product uses
 *   lucide's strokes. A stroked icon is right in a dense interface, where it
 *   has to sit beside text at 13px without shouting. On a marketing page an
 *   icon is a landmark, not a label, and a filled mark carries at a glance.
 *   Keep the split at this boundary — mixing the two inside one screen is what
 *   makes an icon set look accidental.
 */

export const EASE = [0.16, 1, 0.3, 1] as const

/** Reading measures. Prose sits far narrower than the app's content column. */
export const MEASURE = 'max-w-[34rem]'
export const MEASURE_TIGHT = 'max-w-[26rem]'

/* ── Grounds ───────────────────────────────────────────────────────────── */

export type Ground =
  /** The canvas, untouched. For scenes that should feel like a held breath. */
  | 'bare'
  /** Two pale washes and a warm centre — an editorial page with a ground. */
  | 'paper'
  /** A ruled field. Reads as drafting paper; suits anything mechanical. */
  | 'grid'
  /** Dotted texture, without the grid's architecture. */
  | 'dots'
  /** Onyx, toothed and vignetted. The page's immersive register. */
  | 'onyx'
  /** The application's own hero mesh, for continuity with the product. */
  | 'mesh'

function GroundLayer({ ground, dim }: { ground: Ground; dim?: number }) {
  if (ground === 'bare') return null

  if (ground === 'onyx') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-onyx">
        <span className="bg-tooth" />
        <span className="bg-vignette" />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={dim != null ? ({ '--hero-opacity': dim, opacity: dim } as React.CSSProperties) : undefined}
    >
      {ground === 'paper' && <span className="bg-paper" />}
      {ground === 'grid' && <span className="bg-grid" />}
      {ground === 'dots' && <span className="bg-dots" />}
      {ground === 'mesh' && (
        <>
          <span className="hero-mesh" />
          <span className="hero-grain" />
        </>
      )}
    </div>
  )
}

/**
 * One chapter of the page.
 *
 * `measure` sets the vertical weight — scenes are deliberately different heights
 * so the page has a pulse. `edge` decides how a coloured ground meets the scenes
 * either side of it; a plane that stops dead is the thing that makes a page look
 * assembled rather than composed.
 */
export function Scene({
  children,
  id,
  ground = 'bare',
  groundOpacity,
  measure = 'full',
  edge = 'fade-y',
  bleed,
  className,
}: {
  children: React.ReactNode
  id?: string
  ground?: Ground
  /**
   * Dials a ground back. A treatment tuned for a header band is often too much
   * colour to fill a whole scene with — the page stays mostly neutral, and
   * colour is spent on guiding the eye rather than on decorating a chapter.
   */
  groundOpacity?: number
  /** short: a single beat. full: a chapter. tall: an immersive stretch. */
  measure?: 'flush' | 'short' | 'full' | 'tall'
  /**
   * How a coloured ground meets its neighbours. `fade-*` and `curve` suit a
   * pale wash, where a hard stop would read as a seam. A dark plane is the
   * opposite: fading onyx into white puts a wide grey gradient across the top
   * and bottom of the section, which looks like a rendering artefact rather
   * than a transition — those want `none` and a clean edge.
   */
  edge?: 'none' | 'fade-y' | 'fade-top' | 'fade-bottom' | 'curve'
  /** Content spans the viewport rather than the reading column. */
  bleed?: boolean
  className?: string
}) {
  const pad = {
    flush: '',
    short: 'py-24 sm:py-32',
    full: 'py-28 sm:py-40 lg:py-48',
    tall: 'py-36 sm:py-52 lg:py-64',
  }
  const edges = {
    none: '',
    'fade-y': 'edge-fade-y',
    'fade-top': 'edge-fade-top',
    'fade-bottom': 'edge-fade-bottom',
    curve: 'edge-curve overflow-hidden',
  }

  return (
    <section id={id} className={cn('relative isolate', id && 'scroll-mt-24', pad[measure], className)}>
      {/* The edge treatment rides on the ground, never on the content — so a
          fade or a curve can't clip a headline. */}
      <div aria-hidden className={cn('absolute inset-0 -z-10', ground !== 'bare' && edges[edge])}>
        <GroundLayer ground={ground} dim={groundOpacity} />
      </div>
      {bleed ? children : <div className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">{children}</div>}
    </section>
  )
}

/** A soft light source placed inside a scene. */
export function Glow({
  x = '50%',
  y = '0%',
  size = '44rem',
  tint,
  opacity,
  className,
}: {
  x?: string
  y?: string
  size?: string
  tint?: string
  opacity?: number
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn('bg-glow -z-10', className)}
      style={
        {
          '--x': x,
          '--y': y,
          '--size': size,
          ...(tint ? { '--tint': tint } : {}),
          ...(opacity != null ? { opacity } : {}),
        } as React.CSSProperties
      }
    />
  )
}

/* ── Type ──────────────────────────────────────────────────────────────── */

/**
 * The page's display scale. `.headline` is the application's display face; only
 * the size changes, so a marketing headline is the same voice spoken louder.
 */
export function Title({
  children,
  as: Tag = 'h2',
  size = 'md',
  balance = true,
  className,
}: {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'p'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Off when the copy carries its own line breaks — balancing fights them. */
  balance?: boolean
  className?: string
}) {
  const scale = {
    xs: 'text-xl sm:text-2xl',
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.06]',
    lg: 'text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.04]',
    xl: 'text-[2.25rem] leading-[1.06] sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[0.98]',
  }
  return (
    <Tag className={cn('headline text-ink', balance && 'text-balance', scale[size], className)}>{children}</Tag>
  )
}

/**
 * The label that opens a scene.
 *
 * `tone` only, because the same label has to sit on three different grounds —
 * the canvas, onyx, and a brand-lit band. An earlier version could also draw a
 * small rule beside itself; one scene used it and the others didn't, which is
 * exactly the kind of near-consistency that makes a page look assembled.
 */
export function Eyebrow({
  children,
  tone = 'faint',
  className,
}: {
  children: React.ReactNode
  tone?: 'faint' | 'brand' | 'inverse'
  className?: string
}) {
  const tones = {
    faint: 'text-ink-faint',
    brand: 'text-brand',
    // Brand at full strength disappears into onyx; this is the tint the app
    // already uses for brand-on-dark.
    inverse: 'text-[hsl(249_88%_78%)]',
  }
  return <p className={cn('eyebrow font-mono tracking-[0.11em]', tones[tone], className)}>{children}</p>
}

/**
 * A figure and its unit, set at display scale with the unit in brand.
 *
 * The two halves are one element on purpose: split across nodes, the bidi
 * algorithm reorders them in Arabic and "99.99%" comes out as "%99.99".
 */
export function Figure({
  value,
  unit,
  label,
  icon: Icon,
  className,
}: {
  value: React.ReactNode
  unit?: React.ReactNode
  label: React.ReactNode
  /** Sits above the figure, so four numbers in a row read as four subjects. */
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      {Icon && (
        <span className="mb-4 grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-[18px]" />
        </span>
      )}
      <p className="display text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-[2.5rem]">
        <span className="tabular-nums">{value}</span>
        {unit && <span className="text-brand">{unit}</span>}
      </p>
      <p className="eyebrow mt-1.5 font-mono tracking-[0.11em]">{label}</p>
    </div>
  )
}

export function Lede({
  children,
  size = 'md',
  className,
}: {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const scale = { sm: 'text-base', md: 'text-lg', lg: 'text-lg sm:text-xl' }
  return <p className={cn('leading-relaxed text-ink-muted', scale[size], className)}>{children}</p>
}

/**
 * A figure set at display scale, for scenes that lead with a number rather than
 * a sentence.
 */
export function Stat({
  value,
  caption,
  tone = 'ink',
  className,
}: {
  value: React.ReactNode
  caption: React.ReactNode
  tone?: 'ink' | 'inverse'
  className?: string
}) {
  return (
    <div className={className}>
      <p className={cn('display text-4xl sm:text-5xl', tone === 'ink' ? 'text-ink' : 'text-white')}>{value}</p>
      <p className={cn('mt-2 text-sm leading-relaxed', tone === 'ink' ? 'text-ink-subtle' : 'text-white/55')}>
        {caption}
      </p>
    </div>
  )
}

/* ── Motion ────────────────────────────────────────────────────────────── */

/**
 * Enters once, on approach. 14px and 600ms — the page settling, not an effect.
 * `MotionConfig reducedMotion="user"` in App.tsx neutralises it on request.
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

/** Moves a layer against the scroll. Kept small — depth, not spectacle. */
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
 * Wipes a line of type up from behind its own baseline. Used sparingly, on the
 * two or three sentences the page rests on.
 *
 * The observer watches the *wrapper*, not the element being animated. That is
 * not a stylistic choice: the inner span starts translated a full line below
 * the wrapper's `overflow: hidden` box, and an element clipped away by an
 * ancestor is correctly reported as not intersecting — so a `whileInView` on the
 * inner element can never fire, and the line stays hidden forever. Watching the
 * wrapper, which is never clipped, makes the reveal deterministic.
 */
export function LineWipe({
  children,
  delay = 0,
  immediate,
  className,
}: {
  children: React.ReactNode
  delay?: number
  /** Plays on mount — for lines that are already on screen when the page loads. */
  immediate?: boolean
  className?: string
}) {
  const wrapper = React.useRef<HTMLSpanElement>(null)
  const seen = useInView(wrapper, { once: true, amount: 0.4 })
  const show = immediate || seen

  return (
    <span ref={wrapper} className={cn('block overflow-hidden pb-[0.08em]', className)}>
      <motion.span
        className="block"
        initial={{ y: '108%' }}
        animate={show ? { y: '0%' } : { y: '108%' }}
        transition={{ duration: 0.8, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* ── Product framing ───────────────────────────────────────────────────── */

/**
 * The lift under a screenshot that bleeds off the page: a deep black cast so it
 * reads as an object above the plane, plus an indigo bloom so it belongs to the
 * scene it sits in. Declared once because the product and Zoie scenes are
 * mirror images and had a copy each.
 */
export const SCREEN_LIFT = {
  boxShadow: '0 50px 110px -50px rgb(0 0 0 / 0.9), 0 0 120px -60px hsl(var(--brand) / 0.75)',
} as const

/**
 * How a product fragment is presented: floating in light, never inside a card.
 *
 * The frame is a hairline and a shadow plus a pool of light beneath it — the
 * treatment a physical object gets in product photography. `crop` lets a
 * fragment run off the edge of its column, which is what makes it read as a
 * detail of something larger rather than a screenshot of something small.
 */
export function ProductFrame({
  children,
  crop = 'none',
  lift = 'lg',
  className,
}: {
  children: React.ReactNode
  crop?: 'none' | 'start' | 'end'
  lift?: 'md' | 'lg' | 'xl'
  className?: string
}) {
  const shadow = { md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' }
  return (
    <div className={cn('relative', className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -bottom-6 h-16 rounded-[50%] bg-ink/[0.07] blur-2xl"
      />
      <div
        className={cn(
          'glass relative overflow-hidden rounded-[22px] dark:ring-1 dark:ring-white/[0.07]',
          shadow[lift],
          crop === 'end' && '-me-6 sm:-me-16 lg:-me-24',
          crop === 'start' && '-ms-6 sm:-ms-16 lg:-ms-24',
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** The small-caps label that opens a product fragment. */
export function FrameHeader({ label, meta }: { label: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-2.5">
      <span className="eyebrow">{label}</span>
      {meta}
    </div>
  )
}
