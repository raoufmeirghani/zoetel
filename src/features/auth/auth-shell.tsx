import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/layout/logo'
import { LocaleSwitch } from '@/components/shared/locale-switch'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The frame both auth pages share.
 *
 * A single centred card on the application's own canvas, with the hero mesh
 * behind it — the same atmosphere the dashboard opens on, so signing in looks
 * like arriving at the product rather than passing through a gate bolted to the
 * front of it. Nothing else is on screen: no marketing column, no testimonial,
 * no feature list. Someone on this page has already decided.
 *
 * The card is `glass`, which is why the mesh is there at all — glass with
 * nothing behind it is just a grey box.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  const { t } = useI18n()

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden">
        <span className="hero-mesh" />
        <span className="hero-grain" />
      </div>

      <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <Link to="/landing" aria-label={t('Zoetel — home')} className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="headline text-base font-semibold text-ink">Zoetel</span>
        </Link>
        <LocaleSwitch size="sm" />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[26rem]"
        >
          <div className="glass rounded-[28px] p-6 sm:p-8">
            <h1 className="headline text-2xl text-ink sm:text-3xl">{title}</h1>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <div className="mt-5 text-center text-base text-ink-muted">{footer}</div>
        </motion.div>
      </main>

      <p className="px-6 pb-8 text-center text-xs text-ink-faint sm:px-8">
        {t('By continuing you agree to the acceptable use policy and local telecom regulations.')}
      </p>
    </div>
  )
}

/* ── Federated sign-in ─────────────────────────────────────────────────── */

/**
 * Brand marks are drawn inline rather than pulled from an icon set: both are
 * required to be reproduced exactly, and neither lucide nor Heroicons ships
 * them. Google's is the four-colour mark at its official proportions; Apple's is
 * monochrome and takes the button's own ink, which is what Apple's guidelines
 * ask for on a light button.
 */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className="size-[18px] shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className="size-[18px] shrink-0 fill-current">
      <path d="M12.63 9.6c.02 2.2 1.93 2.93 1.95 2.94-.02.05-.31 1.05-1.02 2.08-.61.9-1.25 1.79-2.26 1.8-.99.02-1.31-.58-2.45-.58-1.14 0-1.49.57-2.43.6-.97.03-1.71-.95-2.33-1.84-1.35-1.95-2.38-5.52-1-7.93.69-1.2 1.92-1.96 3.25-1.98.96-.02 1.87.65 2.45.65.58 0 1.68-.8 2.83-.68.48.02 1.84.17 2.71 1.32-.7.04-1.7.99-1.7 2.62ZM10.9 3.2c.51-.62.86-1.48.76-2.34-.76.03-1.68.51-2.21 1.13-.48.55-.9 1.43-.79 2.27.85.07 1.72-.43 2.24-1.06Z" />
    </svg>
  )
}

/**
 * The federated buttons, above the form.
 *
 * Above, not below: the great majority of people take one of these, and burying
 * them under a form asks everyone to read past the slower option to reach the
 * faster one.
 */
export function FederatedButtons({ verb }: { verb: 'in' | 'up' }) {
  const { t } = useI18n()

  const base = cn(
    'inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-base font-medium',
    'bg-surface text-ink shadow-[0_0_0_1px_hsl(var(--line-strong)),0_1px_2px_rgb(17_18_28/0.04)]',
    'transition-[background-color,box-shadow] hover:bg-surface-2',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2',
  )

  return (
    <div className="grid gap-2.5">
      <button type="button" className={base}>
        <GoogleMark />
        {verb === 'in' ? t('Continue with Google') : t('Sign up with Google')}
      </button>
      <button type="button" className={base}>
        <AppleMark />
        {verb === 'in' ? t('Continue with Apple') : t('Sign up with Apple')}
      </button>
    </div>
  )
}

/** A rule with a word in it, for the seam between federated and email. */
export function OrDivider() {
  const { t } = useI18n()
  return (
    <div className="my-6 flex items-center gap-3">
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="eyebrow font-mono tracking-[0.11em]">{t('or')}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  )
}
