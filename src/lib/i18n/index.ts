import * as React from 'react'
import { useApp } from '@/store/app'
import { ar } from './ar'
import { setFormatLocale } from '@/lib/format'

export type Locale = 'en' | 'ar'

export const LOCALES: Record<Locale, { label: string; native: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', native: 'English', dir: 'ltr' },
  ar: { label: 'Arabic', native: 'العربية', dir: 'rtl' },
}

/**
 * Translations are keyed by their English source string, not by an abstract id.
 * That choice is deliberate for a codebase this size: it means `t('Buy a number')`
 * reads the same as the JSX it replaced, an untranslated string renders as
 * English rather than as a missing-key placeholder, and adding a locale never
 * requires touching a component.
 */
export type Dictionary = Record<string, string>

const DICTS: Record<Locale, Dictionary> = { en: {}, ar }

/** Interpolates `{name}` placeholders so counts and names can sit inside copy. */
function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  return interpolate(DICTS[locale][key] ?? key, vars)
}

/**
 * Splits a translated string on its `{placeholder}` markers so a caller can
 * render the substituted values as elements rather than text.
 *
 * This exists because a figure and its unit have to be one translation key —
 * split across two nodes, the bidi algorithm reorders them and "69 days of
 * runway" comes out as "days of runway 69" — but the design often wants the
 * figure itself styled differently from the words around it. `t()` returns a
 * string and can't carry that; this returns nodes and can.
 */
export function interpolateNodes(s: string, vars: Record<string, React.ReactNode>): React.ReactNode[] {
  return s.split(/(\{\w+\})/).map((part, i) => {
    const m = /^\{(\w+)\}$/.exec(part)
    if (m && m[1] in vars) return React.createElement(React.Fragment, { key: i }, vars[m[1]])
    return part
  })
}

export interface I18n {
  locale: Locale
  dir: 'ltr' | 'rtl'
  rtl: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
  /** Like `t`, but the substituted values may be elements. */
  tNode: (key: string, vars: Record<string, React.ReactNode>) => React.ReactNode[]
  setLocale: (l: Locale) => void
}

export function useI18n(): I18n {
  const locale = useApp((s) => s.locale)
  const setLocale = useApp((s) => s.setLocale)
  const dir = LOCALES[locale].dir

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  )

  const tNode = React.useCallback(
    (key: string, vars: Record<string, React.ReactNode>) => interpolateNodes(DICTS[locale][key] ?? key, vars),
    [locale],
  )

  return React.useMemo(
    () => ({ locale, dir, rtl: dir === 'rtl', t, tNode, setLocale }),
    [locale, dir, t, tNode, setLocale],
  )
}

/**
 * Puts the locale on the document. `dir` on <html> is what actually drives every
 * logical property in the stylesheet, so this one effect flips the entire layout.
 */
export function useApplyLocale(): void {
  const locale = useApp((s) => s.locale)

  // Set during render, not in the effect: the formatters are called while the
  // tree below renders, so an effect would leave the first frame after a locale
  // change formatting dates in the previous language.
  setFormatLocale(locale)

  React.useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = LOCALES[locale].dir
  }, [locale])
}

/**
 * Digits, phone numbers, money and code stay left-to-right even in an Arabic
 * layout: an E.164 number reversed is a different number. Wrap those in this.
 */
export function ltrProps(): { dir: 'ltr'; style: React.CSSProperties } {
  return { dir: 'ltr', style: { unicodeBidi: 'isolate' } }
}

/**
 * +1 in a left-to-right layout, -1 in a right-to-left one.
 *
 * CSS logical properties handle static layout, but a JS-driven motion offset is
 * a raw number: a panel that slides in from `x: 28` enters from the right, which
 * is the wrong edge once the panel itself has moved to the left. Multiplying
 * every horizontal offset by this keeps "enters from its own edge" true in both
 * directions.
 */
export function useDirSign(): 1 | -1 {
  const locale = useApp((s) => s.locale)
  return LOCALES[locale].dir === 'rtl' ? -1 : 1
}
