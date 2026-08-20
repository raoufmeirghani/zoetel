import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Check, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { Logo } from '@/components/layout/logo'
import { cn } from '@/lib/utils'
import { Backdrop, Band, EASE, Reveal, Title } from './kit'
import { HeroComposition } from './compositions'
import { useI18n } from '@/lib/i18n'
import {
  ComparisonSection,
  DeveloperSection,
  FaqSection,
  JourneySection,
  MessagingSection,
  NumbersSection,
  PricingSection,
  SipSection,
  TestimonialsSection,
  TrustBand,
  ZoieSection,
} from './sections'

/**
 * The public landing page.
 *
 * It is built entirely from the application's design system — the same tokens,
 * glass, artwork, type scale, motion curve and components — because a visitor
 * who signs up should recognise the product they just read about. The only
 * things that change are scale and density: headlines step up two sizes, bands
 * breathe at roughly three times the app's vertical rhythm, and cards give way
 * to editorial composition.
 *
 * Section order is the conversion argument, one objection at a time: why this,
 * can I trust it, what does it do, is it easy to build with, how do I add AI,
 * what does it cost, who uses it, anything else, start now.
 */

const NAV = [
  { label: 'Products', href: '#products' },
  { label: 'Solutions', href: '#why' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Developers', href: '#developers' },
  { label: 'Docs', to: '/developers' },
]

/* ── Navigation ────────────────────────────────────────────────────────── */

/**
 * Transparent over the hero, frosted once the page moves. The switch happens at
 * 24px rather than on any intersection: it needs to feel like the bar reacting
 * to the scroll, not to a particular section boundary.
 */
function LandingNav() {
  const { t } = useI18n()
  const { scrollY } = useScroll()
  const [lifted, setLifted] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const unsub = scrollY.on('change', (v) => setLifted(v > 24))
    return unsub
  }, [scrollY])

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
          lifted && 'chrome shadow-[0_1px_0_0_hsl(var(--line-soft))]',
        )}
      >
        <nav
          aria-label={t('Primary')}
          className="mx-auto flex h-16 w-full max-w-[var(--page-max)] items-center gap-3 px-6 sm:px-8"
        >
          <Link to="/" aria-label={t('Zoetel — home')} className="flex shrink-0 items-center gap-2.5">
            <Logo size={28} />
            <span className="headline text-lg text-ink">Zoetel</span>
          </Link>

          <div className="mx-auto hidden items-center gap-1 lg:flex">
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
      </div>

      {/* Mobile sheet. Full-height and opaque rather than a dropdown, because a
          translucent panel over the hero artwork is unreadable on a phone. */}
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

/* ── Hero ──────────────────────────────────────────────────────────────── */

const PROMISES = ['No monthly commitment', 'Pay as you go', 'Global ready', 'API first']

function Hero() {
  const { t } = useI18n()
  return (
    <section className="relative isolate overflow-hidden pt-32 sm:pt-40 lg:pt-44">
      {/* The artwork is anchored above the fold and dissolves into the canvas —
          the same eased mask the product headers use, given a taller band. */}
      <Backdrop src="/usage.webp" opacity={0.7} height="h-[52rem]" from="-top-16" />

      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="chrome inline-flex items-center gap-2 rounded-full py-1.5 pe-3.5 ps-2.5"
            >
              <StatusDot tone="success" pulse />
              <span className="text-xs font-medium text-ink-muted">
                {t('Egypt-first · NTRA licensed ranges')}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06, ease: EASE }}
            >
              {/* Three deliberate lines. The product list lives in the lede
                  rather than the headline: naming three things at display size
                  costs a line break the column cannot afford, and the headline's
                  job here is confidence, not inventory. */}
              <Title as="h1" size="lg" balance={false} className="mt-7">
                {t('The communication')}
                <br />
                {t('infrastructure your')}
                <br />
                <span className="text-ink-muted">{t('business deserves.')}</span>
              </Title>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.14, ease: EASE }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink-muted"
            >
              {t(
                'Phone numbers, carrier-grade SIP and messaging, behind one API and a wallet you control. Buy a number, point it anywhere, go live the same afternoon.',
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button variant="primary" size="xl" asChild>
                <Link to="/welcome">
                  {t('Start free')}
                  <ArrowRight className="size-[18px]" />
                </Link>
              </Button>
              <Button variant="secondary" size="xl" asChild>
                <Link to="/developers">{t('View documentation')}</Link>
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5"
            >
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-1.5 text-sm text-ink-subtle">
                  <Check className="size-3.5 shrink-0 text-brand" />
                  {t(p)}
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="min-w-0">
            <HeroComposition />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Final CTA ─────────────────────────────────────────────────────────── */

/**
 * The one dark band on the page. Onyx is the product's surface for permanent
 * structure — the nav rail, the wallet — so closing on it reads as arriving at
 * the thing itself rather than at another marketing panel.
 */
function FinalCta() {
  const { t } = useI18n()
  return (
    <Band>
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] bg-onyx px-7 py-20 text-center shadow-xl dark:ring-1 dark:ring-white/[0.07] sm:px-12 sm:py-28">
          {/* Artwork first, glow over it. The other way round the image washes
              out the brand light and the whole panel turns muddy. `sip.webp` is
              the coolest of the four, which is what survives being screened
              back to a tenth of its opacity over onyx. */}
          <img
            src="/sip.webp"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full select-none object-cover opacity-[0.11] mix-blend-screen"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-48 start-1/2 size-[46rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl rtl:translate-x-1/2"
            style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 66%)' }}
          />

          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow text-white/45">{t('Ready to build?')}</p>
            <h2 className="headline mt-5 text-balance text-4xl text-white sm:text-6xl">
              {t('Start in minutes.')}
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/65">
              {t(
                'No sales call, no procurement cycle. Create an account, fund the wallet, and have a number answering before the end of the day.',
              )}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="xl" className="bg-white text-onyx shadow-none hover:bg-white/90" asChild>
                <Link to="/welcome">
                  {t('Start free')}
                  <ArrowRight className="size-[18px]" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="ghost"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link to="/pricing">{t('Contact sales')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Band>
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
    heading: 'Solutions',
    links: [
      { label: 'Contact centres', href: '#products' },
      { label: 'Notifications', href: '#products' },
      { label: 'Verification codes', href: '#products' },
      { label: 'AI agents', href: '#products' },
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
      { label: 'Support', href: '#faq' },
      { label: 'Status', href: '#faq' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#why' },
      { label: 'Careers', href: '#why' },
      { label: 'Contact sales', to: '/pricing' },
      { label: 'Zoie', href: 'https://us.zoie.ai/?from=zoetel-landing' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '#faq' },
      { label: 'Privacy', href: '#faq' },
      { label: 'Acceptable use', href: '#faq' },
      { label: 'NTRA compliance', href: '#faq' },
    ],
  },
]

function Footer() {
  const { t } = useI18n()
  const external = (href?: string) => !!href && href.startsWith('http')

  return (
    <footer className="relative border-t border-line-soft">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-20">
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

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
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
        <Hero />
        <TrustBand />
        <div id="products" className="scroll-mt-24">
          <NumbersSection />
        </div>
        <SipSection />
        <MessagingSection />
        <DeveloperSection />
        <ZoieSection />
        <ComparisonSection />
        <JourneySection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
