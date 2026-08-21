import { motion } from 'framer-motion'
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/logo'
import { StatusDot } from '@/components/ui/status'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Reveal, Title } from '../kit'

/**
 * Scene 09 — the invitation, and the footer under it.
 *
 * One sentence at the largest type on the page, over a bloom that rises from
 * behind the headline rather than sitting behind the whole section. The vertical
 * hairlines over it are the only ornament on this page: they give the dark plane
 * a grain so it doesn't read as a flat rectangle at the end of a long scroll.
 *
 * The footer shares the section rather than sitting in a band of its own, so the
 * page finishes instead of trailing off. It is a real sitemap: a page that ends
 * in five links and a copyright tells a visitor there is nothing else here,
 * which for a platform this size is the wrong thing to say.
 */

const COLUMNS: { heading: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    heading: 'Platform',
    links: [
      { label: 'Phone numbers', to: '/numbers' },
      { label: 'SIP connections', to: '/sip' },
      { label: 'Messaging', to: '/analytics' },
      { label: 'Usage & quality', to: '/analytics' },
      { label: 'Billing & wallet', to: '/billing' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'API reference', to: '/developers' },
      { label: 'Webhooks', to: '/developers/webhooks' },
      { label: 'Request logs', to: '/developers/logs' },
      { label: 'SDKs', to: '/developers' },
      { label: 'How it works', href: '#how' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact sales', to: '/pricing' },
      { label: 'Support', to: '/pricing' },
      // The one genuinely external link here, and the only one that needs the
      // affordance saying so.
      { label: 'Zoie', href: 'https://us.zoie.ai/?from=zoetel-landing' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '#pricing' },
      { label: 'Privacy', href: '#pricing' },
      { label: 'Acceptable use policy', href: '#pricing' },
      { label: 'NTRA compliance', to: '/verification' },
      { label: 'Data residency', to: '/settings' },
    ],
  },
]

const FOOTER_LINK = 'text-sm text-white/50 transition-colors hover:text-white'

export function ClosingScene() {
  const { t } = useI18n()
  const external = (href?: string) => !!href && href.startsWith('http')

  return (
    <section id="start" className="relative isolate overflow-hidden bg-onyx-2 text-white">
      {/* Transform-only drift, like the hero's. Animating opacity here would
          pulse the whole plane's brightness, which reads as a fault rather than
          as light. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-[34%] left-1/2 -z-10 h-[92%] w-[125%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(46% 56% at 50% 0%, hsl(249 100% 74%) 0%, hsl(var(--brand)) 32%, hsl(248 61% 44% / 0.45) 58%, transparent 80%)',
        }}
        animate={{ x: ['-50%', '-51.5%', '-50%'], y: ['0%', '-2%', '0%'], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px)',
          backgroundSize: '12.5% 100%',
        }}
      />

      <div className="mx-auto grid w-full max-w-[var(--page-max)] justify-items-center px-6 pb-10 pt-24 text-center sm:px-8 sm:pb-14 sm:pt-32 lg:pt-[8.75rem]">
        <Reveal>
          <Title size="xl" className="max-w-[20ch] !text-white">
            {t('Your number is one search away.')}
          </Title>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5 sm:mt-9">
            {/* White rather than brand: the plane behind it is already brand,
                so a brand button would disappear into its own glow. */}
            <Button size="xl" asChild className="border-0 bg-white text-onyx shadow-none hover:bg-white/90">
              <Link to="/welcome">
                {t('Start free')}
                <ArrowRightIcon className="opacity-60" />
              </Link>
            </Button>
            <Button variant="glassOnDark" size="xl" asChild>
              <Link to="/pricing">{t('Contact sales')}</Link>
            </Button>
          </div>
        </Reveal>
      </div>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-6 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[19rem_1fr] lg:gap-16">
            {/* The identity column earns its width: the mark, what the company
                actually is, and the one operational fact a buyer checks before
                they check anything else. */}
            <div>
              <span className="flex items-center gap-2.5">
                <Logo size={26} tone="onDark" />
                <span className="headline text-lg font-semibold text-white">Zoetel</span>
              </span>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
                {t(
                  'Cloud telephony for Egypt and the region. Numbers, SIP, messaging and the APIs to drive them.',
                )}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/75">
                <StatusDot tone="success" pulse />
                {t('All systems operational')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
              {COLUMNS.map((col) => (
                <div key={col.heading}>
                  <p className="eyebrow font-mono tracking-[0.11em] !text-white/40">{t(col.heading)}</p>
                  <ul className="mt-4 grid gap-2.5">
                    {col.links.map((l) => (
                      <li key={`${col.heading}-${l.label}`}>
                        {l.to ? (
                          <Link to={l.to} className={FOOTER_LINK}>
                            {t(l.label)}
                          </Link>
                        ) : (
                          <a
                            href={l.href}
                            {...(external(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className={cn('group inline-flex items-center gap-1', FOOTER_LINK)}
                          >
                            {t(l.label)}
                            {external(l.href) && (
                              <ArrowUpRightIcon className="size-3 text-white/30 transition-transform group-hover:-translate-y-px" />
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

          <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            {/* The long form, not "© 2026 Zoetel": the licensing basis is the one
                fact a telecom buyer looks for in a footer. */}
            <p className="text-xs text-white/40">
              {t('© {year} Zoetel. Numbers provisioned under NTRA-licensed carrier agreements.', {
                year: new Date().getFullYear(),
              })}
            </p>
            <p className="text-xs text-white/40">{t('Cairo · Frankfurt')}</p>
          </div>
        </div>
      </footer>
    </section>
  )
}
