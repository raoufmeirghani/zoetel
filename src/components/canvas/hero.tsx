import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export type HeroMood = 'dawn' | 'signal' | 'ledger' | 'trust' | 'code' | 'quiet'

/**
 * Artwork banners for the major surfaces. WebP because the source PNGs are
 * ~0.7–1.1 MB of smooth gradient — the encode is visually identical at
 * 16–21 KB each. Originals live in `design/`.
 */
export const HERO_ART = '/phone-numbers.webp'
export const HERO_ART_OVERVIEW = '/overview.webp'
export const HERO_ART_SIP = '/sip.webp'
export const HERO_ART_USAGE = '/usage.webp'

/**
 * Four pieces of art cover every section, grouped by what the section is about
 * rather than one image per route — a bespoke image per page would dilute all of
 * them:
 *
 * - **overview** (harbour) — trust and the people side: the overview itself,
 *   verification, team, settings.
 * - **phone-numbers** (holographic) — kept exclusive to the number surfaces; it
 *   is the loudest of the four and reads as their identity.
 * - **sip** (tower) — infrastructure and the developer surfaces.
 * - **usage** (satellite) — measurement and money.
 *
 * Inner flows (buying, checkout, a single number or trunk, guided setup) stay on
 * the gradient mesh: the artwork marks arriving somewhere, not working within it.
 */

/**
 * Each section carries its own atmosphere. The mood only shifts the secondary
 * hues — the brand violet anchors every hero so the product still reads as one
 * thing.
 */
const MOODS: Record<HeroMood, React.CSSProperties> = {
  dawn: { '--hero-2': '28 92% 62%', '--hero-3': '340 82% 66%' } as React.CSSProperties,
  signal: { '--hero-2': '190 88% 58%', '--hero-3': '224 90% 64%' } as React.CSSProperties,
  ledger: { '--hero-2': '158 72% 50%', '--hero-3': '188 78% 56%' } as React.CSSProperties,
  trust: { '--hero-2': '152 68% 52%', '--hero-3': '210 88% 62%' } as React.CSSProperties,
  code: { '--hero-2': '270 88% 68%', '--hero-3': '196 88% 58%' } as React.CSSProperties,
  quiet: { '--hero-2': '246 40% 70%', '--hero-3': '220 40% 68%' } as React.CSSProperties,
}

/**
 * The atmospheric band that opens every major page. It bleeds past the content
 * column and dissolves downward, so the page never starts with a hard edge.
 */
export function Hero({
  breadcrumbs,
  eyebrow,
  title,
  lede,
  actions,
  aside,
  children,
  mood = 'quiet',
  backdrop = 'mesh',
  backdropImage,
  backdropOpacity,
  size = 'md',
  className,
}: {
  breadcrumbs?: { label: string; href?: string }[]
  eyebrow?: React.ReactNode
  title: React.ReactNode
  lede?: React.ReactNode
  actions?: React.ReactNode
  aside?: React.ReactNode
  children?: React.ReactNode
  mood?: HeroMood
  /** 'mesh' is the soft gradient atmosphere. */
  backdrop?: 'mesh' | 'none'
  /**
   * A top-aligned artwork banner, e.g. '/hero-numbers.png'. Takes precedence
   * over `backdrop`, and falls back to it if the file is missing.
   */
  backdropImage?: string
  /**
   * Light-theme opacity for `backdropImage`. The default suits the pale
   * illustrations; a saturated piece of art needs far less to stay behind text.
   */
  backdropOpacity?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const { t } = useI18n()
  const pad = { sm: 'pb-8 pt-8', md: 'pb-10 pt-10 sm:pt-14', lg: 'pb-12 pt-12 sm:pt-20' }
  const titleSize = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
  }

  return (
    <header className={cn('relative isolate', className)} style={MOODS[mood]}>
      {/* Atmosphere bleeds outside the content column on both sides. */}
      {backdropImage ? (
        <HeroArtwork src={backdropImage} fallback={backdrop} opacity={backdropOpacity} />
      ) : backdrop === 'mesh' ? (
        <HeroMesh />
      ) : null}

      <div className={cn('flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between', pad[size])}>
        <div className="min-w-0 max-w-2xl">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label={t('Breadcrumb')} className="mb-4 flex items-center gap-1 text-sm">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={`${b.label}-${i}`}>
                  {i > 0 && <ChevronRight className="size-3.5 text-ink-faint" />}
                  {b.href ? (
                    <Link to={b.href} className="text-ink-subtle transition-colors hover:text-ink">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 flex items-center gap-2"
            >
              {eyebrow}
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
            className={cn('headline text-balance text-ink', titleSize[size])}
          >
            {title}
          </motion.h1>
          {lede && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-xl text-md leading-relaxed text-ink-muted"
            >
              {lede}
            </motion.p>
          )}
        </div>

        {(actions || aside) && (
          <div className="flex shrink-0 flex-col items-stretch gap-5 sm:items-end lg:max-w-sm">
            {actions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-2.5 sm:justify-end"
              >
                {actions}
              </motion.div>
            )}
            {aside && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {aside}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* The children slot carries the band that closes a header — a tab row, a
          search field, a progress trail. It needs to breathe before the page's
          first card, and less room above than the title block has, so the band
          still groups with the header rather than floating between the two. */}
      {children && <div className="pb-7">{children}</div>}
    </header>
  )
}

function HeroMesh() {
  return (
    // Full-bleed regardless of the content column's width — anchored to the
    // viewport centre, not the (narrower, max-width) parent — so the mesh
    // always reaches both screen edges, even on very wide viewports.
    // `start-1/2` mirrors with the layout but `translate-x` is physical: in a
    // right-to-left layout `right: 50%` anchors the element's trailing edge to
    // the centre, so the offset that re-centres it has to go the other way.
    // Without the rtl: variant the whole band lands off-screen.
    <div className="pointer-events-none absolute -top-24 bottom-0 start-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden rtl:translate-x-1/2">
      <span className="hero-mesh" />
      <span className="hero-grain" />
    </div>
  )
}

/**
 * Top-aligned artwork banner. The art is anchored to the top of the page and
 * spans the viewport rather than the content column, so its right-hand motifs
 * don't fall off-screen.
 *
 * `mix-blend-multiply` lets a white-backed image sit on the canvas without a
 * visible plate; in dark mode it screens at low opacity instead, so pale line
 * work still reads. If the file is missing we quietly fall back to the mesh
 * rather than leaving a gap.
 */
function HeroArtwork({
  src,
  fallback,
  opacity = 0.6,
}: {
  src: string
  fallback: 'mesh' | 'none'
  opacity?: number
}) {
  const [failed, setFailed] = React.useState(false)

  if (failed) return fallback === 'mesh' ? <HeroMesh /> : null

  return (
    <div
      className={cn(
        // See HeroMesh: the centring offset mirrors with the layout.
        'pointer-events-none absolute -top-16 start-1/2 -z-10 -translate-x-1/2 overflow-hidden rtl:translate-x-1/2',
        // The artwork is the header's atmosphere and ends with it. A long tail
        // (this was +20rem) pushed the fade's strong middle out over the first
        // card — and because the cards are translucent glass, the gradient read
        // as sitting *on* them. Now the eased curve finishes inside the band, so
        // there is nothing left to see by the time content starts.
        'h-[calc(100%+2rem)] w-[164vw] sm:w-[104vw]',
      )}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        onError={() => setFailed(true)}
        style={{ '--hero-img': opacity } as React.CSSProperties}
        className={cn(
          // A 1.6-aspect image can't fit a wide banner uncropped; framing on the
          // upper-middle keeps the map, mast and skyline in view.
          'size-full select-none object-cover object-[50%_20%]',
          // `hero-art` is the hook the stylesheet uses to mirror the composition
          // in a right-to-left layout, so its focal mass stays behind the
          // headline rather than opposite it.
          'hero-fade hero-art',
          // Dark mode keeps the same ratio the pale art was tuned at (0.2/0.6),
          // so one number per hero covers both themes.
          '[opacity:var(--hero-img)] dark:[opacity:calc(var(--hero-img)*0.36)]',
          'mix-blend-multiply dark:mix-blend-screen',
        )}
      />
    </div>
  )
}
