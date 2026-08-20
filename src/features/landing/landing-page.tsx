import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { Logo } from '@/components/layout/logo'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE } from './kit'
import { HeroScene } from './scenes/hero'
import { PhilosophyScene, ProblemScene } from './scenes/problem'
import { SearchScene } from './scenes/search'
import { ProvisionScene } from './scenes/provision'
import { NetworkScene } from './scenes/network'
import { CoverageScene } from './scenes/coverage'
import { DeveloperScene } from './scenes/developers'
import { ZoieScene } from './scenes/zoie'
import { ClosingScene, PricingScene, ProofScene } from './scenes/close'

/**
 * The public landing page, built as a sequence of scenes.
 *
 * Organised as a story rather than a feature list: the problem, the decisions
 * taken because of it, finding a number, getting live, the network it runs on,
 * its reach, building against it, adding intelligence, what it costs, and an
 * invitation.
 *
 * Each chapter owns its own ground, vertical measure, composition and motion
 * signature — a pinned sequence, a sideways pan, a live diagram, a working
 * search — so no two scrolls feel the same. Everything is drawn from the
 * application's design system: the compositions differ, the material does not.
 */

const NAV = [
  { label: 'Numbers', href: '#numbers' },
  { label: 'Network', href: '#network' },
  { label: 'Developers', href: '#developers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', to: '/developers' },
]

/* ── Chrome ────────────────────────────────────────────────────────────── */

/**
 * Transparent over the opening frame, frosted once the page moves, with a
 * hairline progress bar along its bottom edge. The bar is the page's only
 * persistent chrome, and it earns its place on a document this long: it says how
 * much story is left.
 */
function LandingNav() {
  const { t } = useI18n()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.4 })
  const [lifted, setLifted] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => scrollY.on('change', (v) => setLifted(v > 24)), [scrollY])

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
          'relative transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out',
          lifted && 'chrome',
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-[var(--page-max)] items-center gap-3 px-6 sm:px-8"
        >
          <Link to="/" aria-label={t('Zoetel — home')} className="flex shrink-0 items-center gap-2.5">
            <Logo size={28} />
            <span className="headline text-lg text-ink">Zoetel</span>
          </Link>

          <div className="mx-auto hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-lg px-3 py-1.5 text-base font-medium text-ink-muted transition-colors hover:bg-veil hover:text-ink"
                >
                  {t(item.label)}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-base font-medium text-ink-muted transition-colors hover:bg-veil hover:text-ink"
                >
                  {t(item.label)}
                </a>
              ),
            )}
          </div>

          <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
            <Button variant="ghost" size="md" className="hidden sm:inline-flex" asChild>
              <Link to="/welcome">{t('Sign in')}</Link>
            </Button>
            <Button variant="primary" size="md" asChild>
              <Link to="/welcome">{t('Start free')}</Link>
            </Button>
            <button
              onClick={() => setOpen(true)}
              aria-label={t('Open menu')}
              className="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-veil hover:text-ink lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </nav>

        {/* Progress. Sub-pixel and only visible once the page has moved —
            otherwise it reads as a loading bar. */}
        <motion.span
          aria-hidden
          style={{ scaleX: progress, opacity: lifted ? 1 : 0 }}
          className="absolute inset-x-0 bottom-0 h-px origin-[0%] bg-brand/70 transition-opacity duration-300 rtl:origin-[100%]"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-canvas lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-6">
              <span className="flex items-center gap-2.5">
                <Logo size={28} />
                <span className="headline text-lg text-ink">Zoetel</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('Close menu')}
                className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-veil hover:text-ink"
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
                    {item.to ? (
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-3 text-xl font-medium text-ink hover:bg-veil"
                      >
                        {t(item.label)}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-3 text-xl font-medium text-ink hover:bg-veil"
                      >
                        {t(item.label)}
                      </a>
                    )}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 space-y-2.5">
                <Button variant="primary" size="xl" block asChild>
                  <Link to="/welcome">{t('Start free')}</Link>
                </Button>
                <Button variant="secondary" size="xl" block asChild>
                  <Link to="/welcome">{t('Sign in')}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ── Footer ────────────────────────────────────────────────────────────── */

const FOOTER: { heading: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    heading: 'Products',
    links: [
      { label: 'Phone numbers', to: '/numbers' },
      { label: 'SIP connections', to: '/sip' },
      { label: 'Messaging', to: '/analytics' },
      { label: 'Usage & quality', to: '/analytics' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'API reference', to: '/developers' },
      { label: 'Webhooks', to: '/developers/webhooks' },
      { label: 'Request logs', to: '/developers/logs' },
      { label: 'SDKs', to: '/developers' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', to: '/developers' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Support', href: '#pricing' },
      { label: 'Status', href: '#network' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#numbers' },
      { label: 'Careers', href: '#numbers' },
      { label: 'Contact sales', to: '/pricing' },
      { label: 'Zoie', href: 'https://us.zoie.ai/?from=zoetel-landing' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '#pricing' },
      { label: 'Privacy', href: '#pricing' },
      { label: 'Acceptable use', href: '#pricing' },
      { label: 'NTRA compliance', href: '#pricing' },
    ],
  },
]

function Footer() {
  const { t } = useI18n()
  const external = (href?: string) => !!href && href.startsWith('http')

  return (
    <footer className="relative">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[18rem_1fr] lg:gap-20">
          <div>
            <span className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="headline text-lg text-ink">Zoetel</span>
            </span>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-ink-subtle">
              {t(
                'Cloud telephony for Egypt and the region. Numbers, SIP, messaging and the APIs to drive them.',
              )}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success-ink">
              <StatusDot tone="success" pulse />
              {t('All systems operational')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {FOOTER.map((col) => (
              <div key={col.heading}>
                <p className="eyebrow">{t(col.heading)}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={`${col.heading}-${l.label}`}>
                      {l.to ? (
                        <Link to={l.to} className="text-base text-ink-subtle transition-colors hover:text-ink">
                          {t(l.label)}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          {...(external(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="group inline-flex items-center gap-1 text-base text-ink-subtle transition-colors hover:text-ink"
                        >
                          {t(l.label)}
                          {external(l.href) && (
                            <ArrowUpRight className="size-3 text-ink-faint transition-transform group-hover:-translate-y-px" />
                          )}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line-soft pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-faint">
            {t('© {year} Zoetel. Numbers provisioned under NTRA-licensed carrier agreements.', {
              year: new Date().getFullYear(),
            })}
          </p>
          <p className="text-sm text-ink-faint">{t('Cairo · Frankfurt')}</p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="landing relative min-h-screen overflow-x-clip">
      <LandingNav />
      <main>
        {/* 01 — the opening frame: artwork, one sentence, one glimpse */}
        <HeroScene />
        {/* 02 — the problem, almost empty, receipts in the margin */}
        <ProblemScene />
        {/* 03 — the four decisions, on drafting paper */}
        <PhilosophyScene />
        {/* 04 — the live inventory search */}
        <div id="numbers" className="scroll-mt-24">
          <SearchScene />
        </div>
        {/* 05 — provisioning, pinned, one object advancing */}
        <ProvisionScene />
        {/* 06 — the network, immersive and dark */}
        <div id="network" className="scroll-mt-24">
          <NetworkScene />
        </div>
        {/* 07 — reach, panned sideways */}
        <CoverageScene />
        {/* 08 — the API, layered and overlapping */}
        <DeveloperScene />
        {/* 09 — infrastructure lifting into intelligence */}
        <ZoieScene />
        {/* 10 — one voice at a time */}
        <ProofScene />
        {/* 11 — the calculator, and the questions that stop a signup */}
        <PricingScene />
        {/* 12 — the invitation */}
        <ClosingScene />
      </main>
      <Footer />
    </div>
  )
}
