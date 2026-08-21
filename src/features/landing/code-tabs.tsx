import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CopyButton } from '@/components/ui/misc'
import { StatusDot } from '@/components/ui/status'
import { cn } from '@/lib/utils'
import { EASE } from './kit'
import { useI18n } from '@/lib/i18n'

/**
 * The developer surface: one request, shown in the four languages people
 * actually reach for first, with the response it returns beside it.
 *
 * The request and response sit side by side rather than stacked because the point
 * being made is how short the round trip is — a reader should be able to see the
 * whole exchange without scrolling, and splitting it vertically hides the half
 * that proves it.
 *
 * The highlighter is deliberately small — a single tokenising pass over a
 * combined regex, no dependency. A landing page needs code to *look* like code;
 * it does not need a parser, and shipping one for four fixed snippets would be
 * 40 KB spent on decoration.
 */

type Lang = 'curl' | 'node' | 'python' | 'php'

const KEYWORDS: Record<Lang, string[]> = {
  curl: ['curl', 'POST', 'GET', 'Authorization', 'Bearer', 'Content-Type'],
  node: ['import', 'from', 'const', 'await', 'new', 'async', 'function', 'return'],
  python: ['import', 'from', 'client', 'print', 'def', 'return', 'with', 'os'],
  php: ['require', 'new', 'echo', 'function', 'return', 'use', 'getenv'],
}

/**
 * Buying a number and pointing it at a PBX, on the app's real API surface:
 * `/v2/phone_numbers` is the path the request log records for this call, and the
 * id format matches what the marketplace mints. Worth keeping in step — a
 * landing page that invents endpoints teaches people the wrong ones.
 */
const SNIPPETS: Record<Lang, { label: string; filename: string; latency: number; code: string; res: string }> =
  {
    curl: {
      label: 'cURL',
      filename: 'buy-a-number.sh',
      latency: 38,
      code: `curl https://api.zoetel.com/v2/phone_numbers \\
  -H "Authorization: Bearer $ZOETEL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "+20222000117",
    "route": { "type": "sip", "target": "pbx.acme.io" },
    "sms":   { "webhook": "https://acme.eg/hooks" }
  }'`,
      res: `{
  "id": "num_20222000117",
  "number": "+20 2 2200 0117",
  "status": "active",
  "route": "sip:pbx.acme.io",
  "zoie_ready": true
}`,
    },
    node: {
      label: 'Node',
      filename: 'buy-a-number.ts',
      latency: 41,
      code: `import { Zoetel } from '@zoetel/node'

const zoetel = new Zoetel(process.env.ZOETEL_API_KEY)

const number = await zoetel.phoneNumbers.buy({
  number: '+20222000117',
  route: { type: 'sip', target: 'pbx.acme.io' },
  sms: { webhook: 'https://acme.eg/hooks' },
})

// active before this line runs`,
      res: `{
  id: 'num_20222000117',
  number: '+20 2 2200 0117',
  status: 'active',
  route: 'sip:pbx.acme.io',
  zoieReady: true
}`,
    },
    python: {
      label: 'Python',
      filename: 'buy_a_number.py',
      latency: 44,
      code: `from zoetel import Zoetel

client = Zoetel(api_key=os.environ["ZOETEL_API_KEY"])

number = client.phone_numbers.buy(
    number="+20222000117",
    route={"type": "sip", "target": "pbx.acme.io"},
    sms={"webhook": "https://acme.eg/hooks"},
)

print(number.status)  # active`,
      res: `{
  'id': 'num_20222000117',
  'number': '+20 2 2200 0117',
  'status': 'active',
  'route': 'sip:pbx.acme.io',
  'zoie_ready': True
}`,
    },
    php: {
      label: 'PHP',
      filename: 'buy-a-number.php',
      latency: 47,
      code: `require 'vendor/autoload.php';

use Zoetel\\Client;

$zoetel = new Client(getenv('ZOETEL_API_KEY'));

$number = $zoetel->phoneNumbers->buy([
    'number' => '+20222000117',
    'route'  => ['type' => 'sip', 'target' => 'pbx.acme.io'],
    'sms'    => ['webhook' => 'https://acme.eg/hooks'],
]);`,
      res: `{
  "id": "num_20222000117",
  "number": "+20 2 2200 0117",
  "status": "active",
  "route": "sip:pbx.acme.io",
  "zoie_ready": true
}`,
    },
  }

const ORDER: Lang[] = ['curl', 'node', 'python', 'php']

/** The four surfaces the key reaches. Zoie last, and tinted, because it is the
    one that is a separate product. */
const SURFACES = ['REST', 'Webhooks', 'SIP', 'Zoie']

/** Token colours, drawn from the palette rather than a syntax theme. */
const TONE = {
  comment: 'text-white/34',
  string: 'text-[hsl(152_45%_73%)]',
  number: 'text-[hsl(249_70%_87%)]',
  keyword: 'text-[hsl(249_88%_78%)]',
  key: 'text-[hsl(249_88%_78%)]',
  punct: 'text-white/42',
  plain: 'text-white/90',
} as const

function highlight(code: string, lang: Lang): React.ReactNode[] {
  const kw = KEYWORDS[lang].map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(
    [
      `(?<comment>(?:\\/\\/|#)[^\\n]*)`,
      `(?<string>'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`,
      `(?<key>[A-Za-z_$][\\w$]*(?=\\s*(?::|=>)))`,
      `(?<keyword>\\b(?:${kw})\\b)`,
      `(?<number>\\b\\d[\\d.]*\\b)`,
      `(?<punct>[{}()[\\];,:=>&|\\\\$@.-]+)`,
    ].join('|'),
    'g',
  )

  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0

  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index))
    const groups = m.groups ?? {}
    const kind = (Object.keys(groups) as (keyof typeof TONE)[]).find((k) => groups[k] != null)
    out.push(
      <span key={i++} className={kind ? TONE[kind] : TONE.plain}>
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

export function CodeTabs({ className }: { className?: string }) {
  const { t } = useI18n()
  const [lang, setLang] = React.useState<Lang>('curl')
  const snippet = SNIPPETS[lang]

  return (
    <div
      className={cn('overflow-hidden rounded-[20px] border border-white/[0.09] bg-onyx shadow-xl', className)}
    >
      {/* Language rail. The sliding pill is the same layout animation the
          application's tabs use, so switching feels identical to the product. */}
      <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto border-b border-white/[0.08] px-2.5 py-2">
        {ORDER.map((l) => {
          const active = l === lang
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={active}
              className={cn(
                'relative shrink-0 rounded-lg px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.11em] transition-colors',
                active ? 'text-white' : 'text-white/45 hover:text-white/80',
              )}
            >
              {active && (
                <motion.span
                  layoutId="code-lang"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                />
              )}
              <span className="relative">{SNIPPETS[l].label}</span>
            </button>
          )
        })}
        <span className="ms-auto flex shrink-0 items-center gap-2 ps-3">
          <span className="hidden font-mono text-2xs text-white/40 sm:block">{snippet.filename}</span>
          <CopyButton
            value={snippet.code}
            className="text-white/45 hover:bg-white/10 hover:text-white"
            label={t('Copy snippet')}
          />
        </span>
      </div>

      <div className="grid lg:grid-cols-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={`req-${lang}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            dir="ltr"
            className="ltr-island overflow-x-auto border-white/[0.07] px-5 py-5 text-xs leading-[1.85] lg:border-e"
          >
            <code className={cn('font-mono', TONE.plain)}>{highlight(snippet.code, lang)}</code>
          </motion.pre>
        </AnimatePresence>

        <div className="grid content-start gap-3.5 border-t border-white/[0.07] bg-white/[0.025] px-5 py-5 lg:border-t-0">
          <span className="eyebrow flex items-center gap-2.5 font-mono tracking-[0.11em] !text-white/50">
            <StatusDot tone="success" />
            {t('201 Created · {n}ms', { n: snippet.latency })}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.pre
              key={`res-${lang}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE }}
              dir="ltr"
              className="ltr-island overflow-x-auto font-mono text-xs leading-[1.85] text-white/70"
            >
              {snippet.res}
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-white/[0.08] sm:grid-cols-4">
        {SURFACES.map((s, i) => (
          <div
            key={s}
            className={cn(
              'eyebrow border-white/[0.07] px-4 py-3 font-mono tracking-[0.11em]',
              i < SURFACES.length - 1 && 'border-e',
              i < 2 && 'border-b sm:border-b-0',
              s === 'Zoie' ? '!text-[hsl(249_88%_78%)]' : '!text-white/55',
            )}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}
