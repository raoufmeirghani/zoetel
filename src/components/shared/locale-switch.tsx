import { motion } from 'framer-motion'
import { LOCALES, useI18n, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const ORDER = Object.keys(LOCALES) as Locale[]

/**
 * Language, shown rather than hidden.
 *
 * Everywhere the user is already signed in, the language lives in the account
 * menu beside the theme — both are display preferences and neither needs to be
 * on screen. Onboarding is the exception: someone who cannot read the page
 * cannot be expected to find a control labelled in the language they don't
 * read. So each locale is named in its own script and both are visible at once.
 * "العربية" is legible to the person who needs it without them parsing a single
 * English word.
 *
 * Picking a locale also flips the writing direction, so this is the switch that
 * mirrors the whole product — worth it being an obvious object, not a hint.
 */
export function LocaleSwitch({
  size = 'md',
  className,
}: {
  /** `sm` for dense chrome; `md` where it should be easy to hit. */
  size?: 'sm' | 'md'
  className?: string
}) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      role="radiogroup"
      aria-label={t('Language')}
      className={cn(
        'chrome inline-flex shrink-0 items-center rounded-full p-0.5',
        size === 'sm' ? 'h-9 sm:h-8' : 'h-10 sm:h-9',
        className,
      )}
    >
      {ORDER.map((l) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(l)}
            // The native name is the label. A flag would be wrong — Arabic is
            // not a country — and an abbreviation only helps someone who
            // already reads the alphabet it is abbreviated in.
            lang={l}
            className={cn(
              'relative inline-flex h-full items-center rounded-full px-2.5 font-medium transition-colors',
              size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm',
              active ? 'text-ink' : 'text-ink-subtle hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId="locale-switch"
                className="absolute inset-0 rounded-full bg-veil-strong"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span className="relative whitespace-nowrap">{LOCALES[l].native}</span>
          </button>
        )
      })}
    </div>
  )
}
