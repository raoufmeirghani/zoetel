import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
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
 * The rhythm is dark, white, white, dark, light, dark, white, tinted, dark.
 * That alternation is the composition: the page has chapters without needing a
 * rule between them. The carrier strip and the features scene are the one place
 * two light grounds meet, and the strip's own hairline handles it.
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
 * Flat and full-width over the hero, then a floating frosted bar once the page
 * moves.
 *
 * The hero is dark and everything after the marquee is light, so the nav has to
 * invert with the scroll: white on the artwork, ink on the frosted chrome.
 * `lifted` already tracked that boundary for the background — every colour in
 * here now reads from the same flag, so the two can never disagree.
 *
 * No progress bar: this page is nine scenes, not twelve, and the artwork behind
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
      {/* Two states, one element. Over the hero the bar is the full width of the
          page and completely transparent — there is artwork behind it that
          should be visible. Once the page moves it detaches: insets from the
          edges, takes the application's own `chrome` glass and its radius, and
          loses a little height. Floating is what tells you it is now a layer
          above the document rather than part of its top edge. */}
      <div className={cn('transition-[padding] duration-300 ease-out', lifted && 'px-3 pt-3 sm:px-4 sm:pt-4')}>
        <nav
          aria-label={t('Primary')}
          className={cn(
            'mx-auto flex items-center gap-5 px-6 transition-all duration-300 ease-out sm:px-8',
            lifted ? 'chrome h-14 max-w-[78rem] rounded-2xl' : 'h-16 w-full max-w-[80rem]',
          )}
        >
          <a href="#top" aria-label={t('Zoetel — home')} className="flex shrink-0 items-center gap-2.5">
            {/* `tone="onDark"` exists for exactly this: a surface that is dark
                regardless of the theme. */}
            <Logo size={26} tone={lifted ? 'auto' : 'onDark'} />
            <span className={cn('headline text-base font-semibold', lifted ? 'text-ink' : 'text-white')}>
              Zoetel
            </span>
          </a>

          <div className="mx-auto hidden items-center gap-4 lg:flex xl:gap-7">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'whitespace-nowrap text-sm transition-colors',
                  lifted ? 'text-ink-muted hover:text-ink' : 'text-white/70 hover:text-white',
                )}
              >
                {t(item.label)}
              </a>
            ))}
          </div>

          <div className="ms-auto flex shrink-0 items-center gap-3 lg:ms-0">
            {/* The one control on this page a visitor may not be able to read the
                label of, so it names both languages in their own script. */}
            <LocaleSwitch size="sm" onDark={!lifted} className="max-sm:hidden" />
            <Link
              to="/welcome"
              className={cn(
                'hidden whitespace-nowrap text-sm transition-colors sm:block',
                lifted ? 'text-ink-muted hover:text-ink' : 'text-white/70 hover:text-white',
              )}
            >
              {t('Log in')}
            </Link>
            {/* `bg-ink` is near-black, which is invisible on the hero. Over the
                artwork the button inverts to white-on-onyx and keeps the same
                job: the highest-contrast thing in the bar. */}
            <Link
              to="/welcome"
              className={cn(
                'whitespace-nowrap rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors',
                lifted
                  ? 'bg-ink text-ink-inverse hover:bg-brand'
                  : 'bg-white text-onyx hover:bg-brand hover:text-brand-fg',
              )}
            >
              {t('Sign up')}
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label={t('Open menu')}
              className={cn(
                'grid size-10 place-items-center rounded-lg transition-colors lg:hidden',
                lifted
                  ? 'text-ink-muted hover:bg-veil hover:text-ink'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <Bars3Icon className="size-5" />
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
            className="pt-safe fixed inset-0 z-50 bg-canvas lg:hidden"
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
                <XMarkIcon className="size-5" />
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
                <Button variant="primary" size="xl" block asChild className="shadow-brand">
                  <Link to="/welcome">{t('Start free')}</Link>
                </Button>
                <Button variant="secondary" size="xl" block asChild>
                  <Link to="/welcome">{t('Log in')}</Link>
                </Button>
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
