import { useI18n } from '@/lib/i18n'

/**
 * Wraps content the product renders but does not own — a sample message body, a
 * customer-supplied label, a log line — in a bidi isolate.
 *
 * The string form lives in `lib/format` as `isolateForeign`; this is for the
 * cases where the value is a ReactNode rather than a string.
 *
 * Why an isolate in the content rather than `direction: ltr` on the element:
 * setting the direction would also flip `text-align: start` to the left, so the
 * text would tear away from the Arabic label above it. The isolate leaves the
 * element right-to-left — alignment keeps following the page — while the run
 * inside reads left-to-right with its punctuation intact.
 */
export function Foreign({ children }: { children?: React.ReactNode }) {
  const { rtl } = useI18n()
  if (children == null || children === false) return null
  // Nothing to isolate from in a left-to-right layout.
  if (!rtl) return <>{children}</>
  return (
    <>
      {'⁦'}
      {children}
      {'⁩'}
    </>
  )
}
