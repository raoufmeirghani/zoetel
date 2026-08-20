import { Check, ChevronDown, Languages } from 'lucide-react'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
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
 * read. So the trigger names the current language in its own script, and the
 * menu names every language in its own — "العربية" is legible to the person who
 * needs it without them parsing a single English word.
 *
 * A menu rather than a segmented control: two locales fit in a row, five will
 * not, and a control whose shape changes when a language ships is a control
 * that has to be redesigned twice. This one only grows downward.
 *
 * Picking a locale also flips the writing direction, so the menu says so.
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
    <Menu>
      <MenuTrigger
        aria-label={t('Language')}
        className={cn(
          'chrome inline-flex shrink-0 items-center gap-1.5 rounded-full pe-2.5 ps-3',
          'text-ink-subtle transition-colors hover:text-ink data-[state=open]:text-ink',
          size === 'sm' ? 'h-9 text-xs sm:h-8' : 'h-10 text-sm sm:h-9',
          className,
        )}
      >
        <Languages className="size-4 shrink-0 text-ink-faint" />
        {/* The trigger is set in the language it names, so the glyphs
            themselves tell you which one is active. */}
        <span lang={locale} className="font-medium">
          {LOCALES[locale].native}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-ink-faint" />
      </MenuTrigger>

      <MenuContent align="end" className="min-w-[13rem]">
        <MenuLabel>{t('Language')}</MenuLabel>
        <MenuSeparator />
        {ORDER.map((l) => {
          const active = l === locale
          return (
            <MenuItem key={l} onSelect={() => setLocale(l)}>
              {/* `lang` without `dir`: the script renders right-to-left on its
                  own, and forcing the direction here would right-align this row
                  against the menu it sits in. */}
              <span lang={l} className="flex-1">
                {LOCALES[l].native}
              </span>
              {/* Direction is part of the choice, not a side effect of it. */}
              <span className="font-mono text-2xs uppercase text-ink-faint">
                {LOCALES[l].dir === 'rtl' ? t('RTL') : t('LTR')}
              </span>
              {/* Always occupies its slot so the tags above stay in a column. */}
              <span className="grid size-4 shrink-0 place-items-center">
                {active && <Check className="!text-brand" />}
              </span>
            </MenuItem>
          )
        })}
      </MenuContent>
    </Menu>
  )
}
