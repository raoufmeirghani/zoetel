import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/logo'
import { useI18n } from '@/lib/i18n'
import { Reveal, Title } from '../kit'

/**
 * Scene 09 — the invitation, and the footer under it.
 *
 * One sentence at the largest type on the page, over a bloom that rises from
 * behind the headline rather than sitting behind the whole section. The vertical
 * hairlines over it are the only ornament on this page: they give the dark plane
 * a grain so it doesn't read as a flat rectangle at the end of a long scroll.
 *
 * The footer shares the section, not a separate band — the page should finish,
 * not trail off.
 */

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Zoie', href: '#zoie' },
  { label: 'Developers', href: '#developers' },
  { label: 'Pricing', href: '#pricing' },
]

export function ClosingScene() {
  const { t } = useI18n()

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
            <Link
              to="/welcome"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-md font-medium text-onyx transition-transform hover:-translate-y-px"
            >
              {t('Start free')}
              <ArrowRightIcon className="size-4 opacity-60" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/[0.05] px-5 py-3 text-md text-white/85 transition-colors hover:bg-white/[0.11] hover:text-white"
            >
              {t('Contact sales')}
            </Link>
          </div>
        </Reveal>
      </div>

      <footer className="relative mx-auto flex w-full max-w-[var(--page-max)] flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 pb-8 pt-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <Logo size={22} tone="onDark" />
          <span className="headline text-base font-semibold text-white">Zoetel</span>
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="eyebrow font-mono tracking-[0.11em] !text-white/45 transition-colors hover:!text-white"
            >
              {t(l.label)}
            </a>
          ))}
          {/* The long form, not "© 2026 Zoetel": the licensing basis is the one
              fact a telecom buyer looks for in a footer. */}
          <span className="eyebrow font-mono tracking-[0.11em] !text-white/45">
            {t('© {year} Zoetel. Numbers provisioned under NTRA-licensed carrier agreements.', {
              year: new Date().getFullYear(),
            })}
          </span>
        </div>
      </footer>
    </section>
  )
}
