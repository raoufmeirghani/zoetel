import type { Currency } from './types'

/**
 * Unicode bidirectional isolates (LRI … PDI).
 *
 * In a right-to-left paragraph the bidi algorithm gives a leading `+` or `-` the
 * paragraph's direction, so `+20 2 2461 8890` renders as `20 2 2461 8890+` and
 * `-$12.00` as `$12.00-`. Wrapping the formatted value in an isolate fixes both
 * without a wrapper element, which matters because these strings are just as
 * often passed as a `title` or a toast description as they are rendered as JSX.
 *
 * The characters are zero-width and inert in a left-to-right layout, and
 * `copyText` strips them, so what lands on the clipboard is still a plain
 * number.
 */
const LRI = '\u2066'
const PDI = '\u2069'

/** Pins a value to left-to-right regardless of the surrounding paragraph. */
function ltr(s: string) {
  return `${LRI}${s}${PDI}`
}

/**
 * The locale these formatters render in.
 *
 * Dates and relative times have to be localised — an English "15 hours ago"
 * dropped into an Arabic sentence is reordered by the bidi algorithm and comes
 * out as "hours ago 15". Threading a locale argument through every one of the
 * ~200 call sites would be noise, so the value is set once, from the same hook
 * that sets `dir` on the document.
 *
 * `-u-nu-latn` keeps Western-Arabic digits in Arabic output: every figure the
 * product renders (balances, channel counts, E.164 numbers) uses them, and a
 * date in Arabic-Indic numerals beside a balance in Western ones reads as a bug.
 */
let intlLocale = 'en-US'

export function setFormatLocale(locale: 'en' | 'ar') {
  intlLocale = locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'
}

const RATES: Record<Currency, number> = { USD: 1, EGP: 48.6, EUR: 0.92, AED: 3.67, GBP: 0.79 }
const SYMBOLS: Record<Currency, string> = { USD: '$', EGP: 'E£', EUR: '€', AED: 'AED ', GBP: '£' }

export function convert(usd: number, currency: Currency) {
  return usd * RATES[currency]
}

/** Money formatting that keeps small telecom rates legible (e.g. $0.0042/min). */
export function money(
  usd: number,
  currency: Currency = 'USD',
  opts?: { precise?: boolean; compact?: boolean; trimZeros?: boolean },
) {
  const value = convert(usd, currency)
  const sym = SYMBOLS[currency]
  const abs = Math.abs(value)

  if (opts?.compact && abs >= 1000) {
    return ltr(`${value < 0 ? '-' : ''}${sym}${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`)
  }
  let digits = 2
  if (opts?.precise) digits = abs > 0 && abs < 0.1 ? 4 : abs < 1 ? 3 : 2
  let body = abs.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  // Trimming here rather than at the call site: the returned string is wrapped
  // in bidi isolates, so a caller's `/\.00$/` would no longer anchor.
  if (opts?.trimZeros) body = body.replace(/\.0+$/, '')
  return ltr(`${value < 0 ? '-' : ''}${sym}${body}`)
}

export function num(n: number, digits = 0) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function compactNum(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(Math.abs(n) >= 10_000 ? 0 : 1)}k`
  return String(n)
}

export function pct(n: number, digits = 1) {
  return ltr(`${n > 0 ? '+' : ''}${n.toFixed(digits)}%`)
}

export function minutes(mins: number) {
  if (mins < 60) return `${Math.round(mins)}m`
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return m ? `${num(h)}h ${m}m` : `${num(h)}h`
}

export function duration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function bytes(b: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = b
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export function relativeTime(iso: string | number | Date) {
  const diff = Date.now() - new Date(iso).getTime()
  const abs = Math.abs(diff)
  const sign = diff < 0 ? 1 : -1
  // Intl handles both the plural rules and the "ago"/"in" framing, which Arabic
  // builds differently from English.
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' })
  const mk = (v: number, unit: Intl.RelativeTimeFormatUnit) => rtf.format(sign * v, unit)

  if (abs < 45_000) return rtf.format(0, 'second')
  if (abs < 3_600_000) return mk(Math.round(abs / 60_000), 'minute')
  if (abs < 86_400_000) return mk(Math.round(abs / 3_600_000), 'hour')
  if (abs < 2_592_000_000) return mk(Math.round(abs / 86_400_000), 'day')
  if (abs < 31_536_000_000) return mk(Math.round(abs / 2_592_000_000), 'month')
  return mk(Math.round(abs / 31_536_000_000), 'year')
}

export function dateShort(iso: string | number | Date) {
  return new Date(iso).toLocaleDateString(intlLocale, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function dateTime(iso: string | number | Date) {
  return new Date(iso).toLocaleString(intlLocale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeOnly(iso: string | number | Date) {
  return new Date(iso).toLocaleTimeString(intlLocale, { hour: 'numeric', minute: '2-digit' })
}

/** +20 2 2461 8890 → grouped for scanability in tables, and bidi-isolated. */
export function formatE164(e164: string) {
  return ltr(groupE164(e164))
}

function groupE164(e164: string) {
  const d = e164.replace(/[^\d+]/g, '')
  if (d.startsWith('+20')) {
    const rest = d.slice(3)
    if (rest.length === 10) return `+20 ${rest.slice(0, 2)} ${rest.slice(2, 6)} ${rest.slice(6)}`
    if (rest.length === 9) return `+20 ${rest.slice(0, 1)} ${rest.slice(1, 5)} ${rest.slice(5)}`
    return `+20 ${rest}`
  }
  if (d.startsWith('+1') && d.length === 12) return `+1 (${d.slice(2, 5)}) ${d.slice(5, 8)}-${d.slice(8)}`
  const cc = d.slice(0, 3)
  const rest = d.slice(3)
  return `${cc} ${rest.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim()}`
}

export function maskSecret(secret: string, visible = 4) {
  if (secret.length <= visible) return '•'.repeat(secret.length)
  return `${secret.slice(0, visible)}${'•'.repeat(Math.min(24, secret.length - visible))}`
}
