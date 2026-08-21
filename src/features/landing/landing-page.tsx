import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { LocaleSwitch } from '@/components/shared/locale-switch'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE } from './kit'
import { HeroScene } from './scenes/hero'
import { CarrierScene } from './scenes/carriers'
import { FeatureScene } from './scenes/features'
import { ProductScene } from './scenes/product'
import { CoverageScene } from './scenes/coverage'
import { ZoieScene } from './scenes/zoie'
import { DeveloperScene } from './scenes/developers'
import { PricingScene } from './scenes/pricing'
import { ClosingScene } from './scenes/close'

/**
 * The public landing page.
 *
 * Product-first by construction: rather than describing features, the page hands
 * over the search from the marketplace in its first screen and three real
 * dashboard screens in its fourth. Everything between those two is there to make
 * the screens legible — who the carriers are, what a number can point at, what it
 * costs.
 *
 * The rhythm is light, white, dark, light, dark, white, tinted, dark. That
 * alternation is the composition: no two adjacent scenes share a ground, so the
 * page has chapters without needing a rule between them.
 *
 * One principle worth keeping. Nothing here gates visibility on an observer or an
 * animation — every `Reveal` animates opacity *and* offset together from a
 * `whileInView`, which framer resolves to the settled state if the observer never
 * fires, and `MotionConfig reducedMotion="user"` in App.tsx neutralises the
 * motion entirely on request. An earlier build of this design set `opacity: 0` up
 * front and waited for an IntersectionObserver; where the callback never ran, the
 * page rendered blank.
 */

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Zoie AI', href: '#zoie' },
  { label: 'Developers', href: '#developers' },
  { label: 'Pricing', href: '#pricing' },
]

/**
 * Flat over the hero, frosted once the page moves.
 *
 * No progress bar: this page is eight scenes, not twelve, and the artwork behind
 * the nav is the thing that should be visible at the top of it.
 */
function LandingNav() {
  const { t } = useI18n()
  const [lifted, setLifted] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out',
          lifted && 'chrome',
        )}
      >
        <nav
          aria-label={t('Primary')}
          className="mx-auto flex h-16 w-full max-w-[80rem] items-center gap-5 px-6 sm:px-8"
        >
          <a href="#top" aria-label={t('Zoetel — home')} className="flex shrink-0 items-center gap-2.5">
            <Logo size={26} />
            <span className="headline text-base font-semibold text-ink">Zoetel</span>
          </a>

          <div className="mx-auto hidden items-center gap-4 lg:flex xl:gap-7">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="whitespace-nowrap text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {t(item.label)}
              </a>
            ))}
          </div>

          <div className="ms-auto flex shrink-0 items-center gap-3 lg:ms-0">
            {/* The one control on this page a visitor may not be able to read the
                label of, so it names both languages in their own script. */}
            <LocaleSwitch size="sm" className="max-sm:hidden" />
            <Link
              to="/welcome"
              className="hidden whitespace-nowrap text-sm text-ink-muted transition-colors hover:text-ink sm:block"
            >
              {t('Log in')}
            </Link>
            <Link
              to="/welcome"
              className="whitespace-nowrap rounded-[10px] bg-ink px-4 py-2.5 text-sm font-medium text-ink-inverse transition-colors hover:bg-brand"
            >
              {t('Sign up')}
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label={t('Open menu')}
              className="grid size-10 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-veil hover:text-ink lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-canvas pt-safe lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-6">
              <span className="flex items-center gap-2.5">
                <Logo size={26} />
                <span className="headline text-base font-semibold text-ink">Zoetel</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('Close menu')}
                className="grid size-10 place-items-center rounded-lg text-ink-muted hover:bg-veil hover:text-ink"
              >
                <X className="size-[18px]" />
              </button>
            </div>
            <div className="px-6 pt-6">
              <ul className="space-y-1">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 * i, ease: EASE }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 text-xl font-medium text-ink hover:bg-veil"
                    >
                      {t(item.label)}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 grid gap-2.5">
                <Link
                  to="/welcome"
                  className="rounded-xl bg-brand px-5 py-3.5 text-center text-md font-medium text-brand-fg shadow-brand"
                >
                  {t('Start free')}
                </Link>
                <Link
                  to="/welcome"
                  className="rounded-xl border border-line bg-surface px-5 py-3.5 text-center text-md font-medium text-ink"
                >
                  {t('Log in')}
                </Link>
              </div>
              <div className="mt-8 flex justify-center">
                <LocaleSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default function LandingPage() {
  return (
    <div className="landing relative min-h-screen overflow-x-clip bg-canvas">
      <LandingNav />
      <main>
        {/* 01 — the opening frame, and the search that starts the task */}
        <HeroScene />
        {/* 02 — whose ranges these are */}
        <CarrierScene />
        {/* 03 — what a number needs, in five working fragments */}
        <FeatureScene />
        {/* 04 — the product itself, three real screens */}
        <ProductScene />
        {/* 05 — the reach behind them */}
        <CoverageScene />
        {/* 06 — the same screen, one more destination */}
        <ZoieScene />
        {/* 07 — one request */}
        <DeveloperScene />
        {/* 08 — what it costs */}
        <PricingScene />
        {/* 09 — the invitation, and the footer */}
        <ClosingScene />
      </main>
    </div>
  )
}
