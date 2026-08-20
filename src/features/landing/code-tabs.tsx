import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CopyButton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { EASE } from './kit'
import { useI18n } from '@/lib/i18n'

/**
 * The developer surface: one request, shown in the four languages people
 * actually reach for first.
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
  python: ['import', 'from', 'client', 'print', 'def', 'return', 'with'],
  php: ['require', 'new', 'echo', 'function', 'return', 'use'],
}

const SNIPPETS: Record<Lang, { label: string; filename: string; code: string }> = {
  curl: {
    label: 'cURL',
    filename: 'place-a-call.sh',
    code: `curl https://api.zoetel.com/v1/calls \\
  -H "Authorization: Bearer $ZOETEL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "+20224618890",
    "to": "+201028834471",
    "answer_url": "https://acme.eg/voice/answer"
  }'`,
  },
  node: {
    label: 'Node',
    filename: 'place-a-call.ts',
    code: `import { Zoetel } from '@zoetel/node'

const zoetel = new Zoetel(process.env.ZOETEL_API_KEY)

// Numbers are E.164. The call is queued the moment this resolves.
const call = await zoetel.calls.create({
  from: '+20224618890',
  to: '+201028834471',
  answerUrl: 'https://acme.eg/voice/answer',
})

console.log(call.id, call.status) // cal_9k2f1 queued`,
  },
  python: {
    label: 'Python',
    filename: 'place_a_call.py',
    code: `from zoetel import Zoetel

client = Zoetel(api_key=os.environ["ZOETEL_API_KEY"])

# Every event lands on your webhook, signed and retried.
call = client.calls.create(
    from_="+20224618890",
    to="+201028834471",
    answer_url="https://acme.eg/voice/answer",
)

print(call.id, call.status)  # cal_9k2f1 queued`,
  },
  php: {
    label: 'PHP',
    filename: 'place-a-call.php',
    code: `require 'vendor/autoload.php';

use Zoetel\\Client;

$zoetel = new Client(getenv('ZOETEL_API_KEY'));

$call = $zoetel->calls->create([
    'from'       => '+20224618890',
    'to'         => '+201028834471',
    'answer_url' => 'https://acme.eg/voice/answer',
]);

echo $call->id . ' ' . $call->status;`,
  },
}

const ORDER: Lang[] = ['curl', 'node', 'python', 'php']

/** Token colours, drawn from the palette rather than a syntax theme. */
const TONE = {
  comment: 'text-white/32',
  string: 'text-[hsl(152_62%_68%)]',
  number: 'text-[hsl(33_92%_68%)]',
  keyword: 'text-[hsl(249_88%_78%)]',
  key: 'text-[hsl(196_88%_74%)]',
  punct: 'text-white/45',
  plain: 'text-[hsl(220_20%_86%)]',
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
  const [lang, setLang] = React.useState<Lang>('node')
  const snippet = SNIPPETS[lang]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[22px] bg-onyx shadow-xl dark:ring-1 dark:ring-white/[0.07]',
        className,
      )}
    >
      {/* Language rail. The sliding pill is the same layout animation the
          application's tabs use, so switching feels identical to the product. */}
      <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto border-b border-white/[0.07] px-3 py-2.5">
        {ORDER.map((l) => {
          const active = l === lang
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              role={t('tab')}
              aria-selected={active}
              className={cn(
                'relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'text-white' : 'text-white/45 hover:text-white/80',
              )}
            >
              {active && (
                <motion.span
                  layoutId="code-lang"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                />
              )}
              <span className="relative">{SNIPPETS[l].label}</span>
            </button>
          )
        })}
        <span className="ms-auto flex shrink-0 items-center gap-2 ps-3">
          <span className="hidden font-mono text-2xs text-white/50 sm:block">{snippet.filename}</span>
          <CopyButton
            value={snippet.code}
            className="text-white/45 hover:bg-white/10 hover:text-white"
            label={t('Copy snippet')}
          />
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={lang}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            dir="ltr"
            className="ltr-island overflow-x-auto px-5 py-5 text-[12.5px] leading-[1.75]"
          >
            <code className={cn('font-mono', TONE.plain)}>{highlight(snippet.code, lang)}</code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  )
}
