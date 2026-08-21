import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { StatusDot } from '@/components/ui/status'
import { COUNTRIES } from '@/lib/data/countries'
import { searchInventory } from '@/lib/data/numbers'
import { useI18n } from '@/lib/i18n'
import { num } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Capability, NumberType } from '@/lib/types'
import { EASE, Lede, Title } from '../kit'

/**
 * Scene 01 — the opening frame.
 *
 * The page's argument starts before the account does: instead of describing what
 * Zoetel sells, the hero hands over the first screen of the product. Country,
 * number type and capability are the same three axes the marketplace filters on,
 * so a visitor who sets them here has already started the task, and the count
 * underneath proves there is real stock behind the claim.
 *
 * Search doesn't run a search — it can't, without an account — so it carries the
 * preferences into signup as query params and the marketplace opens pre-filtered.
 */

/**
 * The rotator's vocabulary: the four things a business actually comes here for.
 *
 * The article travels with the lead-in. Fixing "a" in a static half of the
 * sentence produces "a SMS channel" one turn in four, and a headline with a
 * grammatical error in it is worse than a headline that doesn't move.
 */
const WORDS = [
  { lead: 'Every business needs a', noun: 'phone number' },
  { lead: 'Every business needs a', noun: 'SIP trunk' },
  { lead: 'Every business needs a', noun: 'WhatsApp line' },
  { lead: 'Every business needs an', noun: 'SMS channel' },
]

/** `any` is a real option here, not an absent one — hence its own entry. */
const COUNTRY_OPTS = [
  { code: 'any', label: 'Anywhere' },
  ...COUNTRIES.filter((c) => c.live).map((c) => ({ code: c.code, label: c.name })),
]
const TYPE_OPTS: { value: NumberType | 'any'; label: string }[] = [
  { value: 'any', label: 'Any type' },
  { value: 'local', label: 'Local' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'national', label: 'National' },
  { value: 'tollfree', label: 'Toll-free' },
]
const CAP_OPTS: { value: Capability | 'any'; label: string }[] = [
  { value: 'any', label: 'Any capability' },
  { value: 'voice', label: 'Voice' },
  { value: 'sms', label: 'SMS' },
  { value: 'mms', label: 'MMS' },
]

/**
 * The rule between two fields: vertical when they sit in a row, horizontal when
 * they stack. It used to vanish on a phone, which left the bar as one white
 * block with three values floating in it.
 */
function Divider() {
  return (
    <span
      aria-hidden
      className="shrink-0 bg-line-soft max-sm:mx-4 max-sm:h-px max-sm:w-[calc(100%-2rem)] sm:h-[30px] sm:w-px sm:self-center"
    />
  )
}

/**
 * One segment of the search bar.
 *
 * A plain button and an absolutely-placed list rather than the app's `Select`:
 * this control is 56px tall with a label stacked over its value, which is a
 * different object from a form field, and dressing a `Select` up to look like it
 * would mean overriding nearly all of it.
 */
function Field<T extends string>({
  label,
  value,
  options,
  onPick,
  open,
  onToggle,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onPick: (v: T) => void
  open: boolean
  onToggle: () => void
}) {
  const { t } = useI18n()
  const current = options.find((o) => o.value === value) ?? options[0]

  return (
    <div className="relative min-w-0 flex-1 basis-[10.5rem]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'grid w-full gap-0.5 rounded-[14px] px-4 py-3 text-start transition-colors',
          open ? 'bg-surface-3' : 'hover:bg-surface-3/60',
        )}
      >
        <span className="eyebrow font-mono tracking-[0.11em]">{t(label)}</span>
        <span className="flex w-full items-center gap-1.5 text-md font-medium text-ink">
          <span className="min-w-0 truncate">{t(current.label)}</span>
          <ChevronDownIcon
            className={cn(
              'ms-auto size-3.5 shrink-0 text-ink-faint transition-transform',
              open && 'rotate-180',
            )}
          />
        </span>
      </button>

      {open && (
        <motion.div
          role="listbox"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: EASE }}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-20 grid min-w-[11.5rem] gap-0.5 rounded-[14px] border border-line bg-surface p-1.5 shadow-pop"
        >
          {options.map((o) => {
            const on = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => onPick(o.value)}
                className={cn(
                  'flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-start text-sm transition-colors',
                  on ? 'bg-brand-soft font-medium text-brand-ink' : 'text-ink-muted hover:bg-veil',
                )}
              >
                <span className="min-w-0 truncate">{t(o.label)}</span>
                {on && <CheckIcon className="ms-auto size-3.5 shrink-0 text-brand" />}
              </button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export function HeroScene() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const [word, setWord] = React.useState(0)
  const [country, setCountry] = React.useState('any')
  const [type, setType] = React.useState<NumberType | 'any'>('any')
  const [cap, setCap] = React.useState<Capability | 'any'>('any')
  const [open, setOpen] = React.useState<string | null>(null)

  React.useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 3000)
    return () => clearInterval(id)
  }, [])

  // Any click that isn't inside the bar closes whichever menu is open. Without
  // this the menu survives a scroll and detaches from its field.
  const bar = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  /**
   * The live count, from the same inventory the marketplace searches. Anywhere
   * can't be counted honestly — there is no single country to search — so it
   * reports the published reach instead of a number that would be a guess.
   */
  const matches = React.useMemo(() => {
    if (country === 'any') return null
    return searchInventory({ country, type, capabilities: cap === 'any' ? [] : [cap] }, 40).length
  }, [country, type, cap])

  const countryName = COUNTRY_OPTS.find((c) => c.code === country)?.label ?? 'Anywhere'

  const search = () => {
    const q = new URLSearchParams({ next: '/numbers/buy' })
    if (country !== 'any') q.set('country', country)
    if (type !== 'any') q.set('type', type)
    if (cap !== 'any') q.set('cap', cap)
    navigate(`/welcome?${q}`)
  }

  return (
    <header
      id="top"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-[hsl(240_16%_5%)] text-white"
    >
      {/* The background stack sits at the default stacking level with the
          content lifted above it, rather than on a `-z-10` layer.
          `mix-blend-mode` inside a negative-z group makes Chromium stop
          rasterising the tiles *below* the group — the sections after the hero
          render blank — and no amount of `isolation` on the wrapper fixes it.
          Ordinary source order costs nothing and has no such failure mode.

          The asset is the dashboard header's own, so the page opens on the same
          landscape the product does. The blend is `screen`, not the `multiply`
          this used on a light canvas: multiplying a pale landscape into onyx
          crushes it to black, whereas screening lifts it out as light. Same
          image, opposite operation — which is why the app's own dark theme
          already switches between the two.

          `saturate` is doing quiet work here. Screened onto a near-black
          ground the landscape loses most of its colour and reads as grey
          smoke; pushing saturation back up keeps the blue in the sky. */}
      <img
        aria-hidden
        src="/usage.webp"
        alt=""
        className="hero-art pointer-events-none absolute inset-0 size-full object-cover object-[50%_16%] opacity-[0.28] mix-blend-screen saturate-[1.4]"
      />
      {/* Dissolves the artwork into the ground, so it has no bottom edge. The
          image runs the full height and this decides where it stops being
          visible — which is why there is no band of dead onyx above the fold. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[hsl(240_16%_5%/0.15)] via-[hsl(240_16%_5%/0.5)] via-60% to-[hsl(240_16%_5%)]"
      />
      {/* Brand at 0.2 was tuned against white and disappears on onyx; on a dark
          ground the light has to be roughly twice as strong to read at all. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-[18%] left-1/2 h-[78%] w-[120%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(42% 52% at 32% 22%, hsl(var(--brand) / 0.42), transparent 70%), radial-gradient(40% 46% at 74% 10%, hsl(196 82% 58% / 0.28), transparent 72%)',
        }}
        animate={{ x: ['-50%', '-51.5%', '-50%'], y: ['0%', '-2%', '0%'], scale: [1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* `pt-24` rather than `pt-11`: the nav is fixed and 64px tall, so
          anything less puts the status pill inside it. */}
      <div className="relative z-10 mx-auto grid w-full max-w-[62.5rem] justify-items-center px-6 pb-20 pt-28 text-center sm:px-8 sm:pb-28 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.07] py-1.5 pe-3.5 ps-2.5 text-xs font-medium text-white/75 backdrop-blur"
        >
          <StatusDot tone="success" pulse />
          {t('Egypt-first · NTRA licensed')}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.07, ease: EASE }}
          className="mt-6 sm:mt-9"
        >
          {/* Two blocks, not one wrapping paragraph, so the coloured noun is
              always the second line. Left to wrap, a short noun rides up onto
              line one and the headline changes shape every three seconds —
              which is the one thing a rotator must never do. `balance` is off
              for the same reason: it would rebalance both lines per word. */}
          <Title as="h1" size="xl" balance={false} className="mx-auto max-w-[22ch] !text-white">
            {/* The article travels with the lead-in, not with the noun: it is
                one translatable unit that way, and Arabic — which has no
                indefinite article — maps both variants onto one phrase. */}
            <span className="block text-balance">{t(WORDS[word].lead)}</span>
            {/* The noun and its full stop are one nowrap span, so the period can
                never orphan onto a line of its own. Motion is transform-only and
                opacity stays at 1 — a word whose visibility depends on an
                animation is a word that can vanish. */}
            <motion.span
              key={word}
              initial={{ y: 5 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.48, ease: EASE }}
              // Not `text-brand`: the brand is tuned against white and reads
              // muddy on a dark ground. This is the lighter brand the eyebrows
              // and the code card already use there.
              className="block whitespace-nowrap text-[hsl(249_88%_78%)]"
            >
              {t(WORDS[word].noun)}.
            </motion.span>
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.14, ease: EASE }}
          className="mt-5 sm:mt-6"
        >
          <Lede className="mx-auto max-w-[54ch] text-base !text-white/65 sm:text-md">
            {t(
              'Search live inventory, buy in one click, point it at your stack. Numbers, SIP, SMS and WhatsApp on carrier-grade infrastructure.',
            )}
          </Lede>
        </motion.div>

        {/* ── The search bar ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.21, ease: EASE }}
          className="mt-8 w-full max-w-[45rem] text-start sm:mt-10"
        >
          {/* Deliberately still light. On a dark ground this is the brightest
              object on the page, which is correct — it is the one thing the
              visitor is meant to touch, and a dark bar on a dark hero would
              make the primary action the least visible thing in it. */}
          <div
            ref={bar}
            className="flex flex-wrap items-stretch gap-1 rounded-[20px] border border-white/10 bg-surface p-1.5 shadow-[0_8px_16px_-8px_rgb(0_0_0/0.5),0_32px_64px_-20px_rgb(0_0_0/0.65)]"
          >
            <Field
              label="Country"
              value={country}
              options={COUNTRY_OPTS.map((c) => ({ value: c.code, label: c.label }))}
              onPick={(v) => {
                setCountry(v)
                setOpen(null)
              }}
              open={open === 'country'}
              onToggle={() => setOpen(open === 'country' ? null : 'country')}
            />
            <Divider />
            <Field
              label="Number type"
              value={type}
              options={TYPE_OPTS}
              onPick={(v) => {
                setType(v)
                setOpen(null)
              }}
              open={open === 'type'}
              onToggle={() => setOpen(open === 'type' ? null : 'type')}
            />
            <Divider />
            <Field
              label="Capability"
              value={cap}
              options={CAP_OPTS}
              onPick={(v) => {
                setCap(v)
                setOpen(null)
              }}
              open={open === 'cap'}
              onToggle={() => setOpen(open === 'cap' ? null : 'cap')}
            />
            <button
              type="button"
              onClick={search}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[14px] bg-brand px-5 py-3.5 text-md font-medium text-brand-fg shadow-brand transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-hover max-sm:w-full"
            >
              <MagnifyingGlassIcon className="size-[18px]" />
              {t('Search')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2 pt-3">
            <span className="inline-flex items-center gap-2 text-sm text-white/70">
              <StatusDot tone="success" pulse />
              {matches === null
                ? t('{n} numbers available across 190+ countries', { n: num(2400) })
                : matches === 0
                  ? t('No numbers match — widen your preferences')
                  : t('{n} numbers available in {country}', { n: matches, country: t(countryName) })}
            </span>
            <span className="eyebrow font-mono tracking-[0.11em] !text-white/40">
              {t('Create an account to see the exact numbers')}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease: EASE }}
          className="mt-7 flex flex-wrap justify-center gap-2.5 sm:mt-8"
        >
          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-md font-medium text-brand-fg shadow-brand transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-hover"
          >
            {t('Start free')}
            <ArrowRightIcon className="size-4 opacity-75" />
          </Link>
          <a
            href="#developers"
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-md text-white/85 transition-colors hover:bg-white/[0.12] hover:text-white"
          >
            {t('View documentation')}
          </a>
        </motion.div>
      </div>
    </header>
  )
}
