import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { CapabilityPills } from '@/components/shared/capability-pills'
import { formatE164, money } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE, Reveal, Scene, Title } from '../kit'
import type { CarrierId, Capability, NumberType } from '@/lib/types'

/**
 * Scene 04 — the first real product moment, and the first interactive one.
 *
 * Rather than describe the marketplace, the scene *is* the marketplace: a search
 * field over the same sample inventory the application uses, filtering on digits
 * and city as you type, with the type chips actually filtering. The composition
 * puts the input at display scale in the centre of the scene and lets the
 * results run wider than the reading column, so the list feels like a window
 * onto something much larger than the page.
 *
 * This is the "oh, that's interesting" beat. Nothing about it is a mock-up.
 */

interface Row {
  e164: string
  city: string
  type: NumberType
  carrier: CarrierId
  price: number
  caps: Capability[]
  regulated?: boolean
}

const INVENTORY: Row[] = [
  {
    e164: '+20224618890',
    city: 'New Cairo',
    type: 'local',
    carrier: 'we',
    price: 1.03,
    caps: ['voice', 'sms'],
  },
  {
    e164: '+20227541000',
    city: 'Cairo',
    type: 'local',
    carrier: 'we',
    price: 1.03,
    caps: ['voice', 'sms', 'fax'],
  },
  { e164: '+20233914444', city: 'Giza', type: 'local', carrier: 'vodafone', price: 1.06, caps: ['voice'] },
  {
    e164: '+20345219080',
    city: 'Alexandria',
    type: 'local',
    carrier: 'etisalat',
    price: 1.05,
    caps: ['voice', 'sms'],
  },
  { e164: '+20693381000', city: 'Sharm El Sheikh', type: 'local', carrier: 'we', price: 1.07, caps: ['voice'] },
  {
    e164: '+20951000710',
    city: 'Luxor',
    type: 'local',
    carrier: 'etisalat',
    price: 1.07,
    caps: ['voice', 'sms'],
  },
  {
    e164: '+201028834471',
    city: 'Cairo',
    type: 'mobile',
    carrier: 'vodafone',
    price: 1.05,
    caps: ['voice', 'sms', 'mms'],
    regulated: true,
  },
  {
    e164: '+201554409821',
    city: 'Cairo',
    type: 'mobile',
    carrier: 'we',
    price: 1.09,
    caps: ['voice', 'sms', 'mms'],
    regulated: true,
  },
  {
    e164: '+201110004444',
    city: 'Nationwide',
    type: 'mobile',
    carrier: 'etisalat',
    price: 1.12,
    caps: ['voice', 'sms'],
    regulated: true,
  },
  {
    e164: '+2016882200',
    city: 'Nationwide',
    type: 'national',
    carrier: 'we',
    price: 3.4,
    caps: ['voice'],
    regulated: true,
  },
  {
    e164: '+2019001000',
    city: 'Nationwide',
    type: 'national',
    carrier: 'vodafone',
    price: 3.6,
    caps: ['voice'],
    regulated: true,
  },
  {
    e164: '+208000010000',
    city: 'Nationwide',
    type: 'tollfree',
    carrier: 'we',
    price: 4.5,
    caps: ['voice'],
    regulated: true,
  },
  {
    e164: '+208000044444',
    city: 'Nationwide',
    type: 'tollfree',
    carrier: 'etisalat',
    price: 4.9,
    caps: ['voice'],
    regulated: true,
  },
]

const TYPES: { value: NumberType | 'all'; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'local', label: 'Local' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'national', label: 'National' },
  { value: 'tollfree', label: 'Toll-free' },
]

/** Digits only, so a query can be matched against the raw E.164. */
const digits = (s: string) => s.replace(/\D/g, '')

export function SearchScene() {
  const { t } = useI18n()
  const [q, setQ] = React.useState('')
  const [type, setType] = React.useState<NumberType | 'all'>('all')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const rows = React.useMemo(() => {
    const d = digits(q)
    const text = q.trim().toLowerCase()
    return INVENTORY.filter((r) => {
      if (type !== 'all' && r.type !== type) return false
      if (!text) return true
      // A query of digits searches the number; anything else searches the city.
      return d ? digits(r.e164).includes(d) : r.city.toLowerCase().includes(text)
    })
  }, [q, type])

  return (
    <Scene ground="dots" measure="tall" edge="fade-y">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{t('03 — Find one')}</p>
        <Title size="lg" className="mt-6">
          {t('Search the carrier’s stock, not a contact form.')}
        </Title>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">
          {t('This is the real inventory search, running here. Try a digit you want.')}
        </p>
      </Reveal>

      {/* The input is the object in this scene: oversized, centred, floating in
          its own light rather than sitting in a card. */}
      <Reveal delay={0.1} className="mt-14">
        <div className="relative mx-auto max-w-3xl">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-12 -bottom-4 h-14 rounded-[50%] bg-ink/[0.08] blur-2xl"
          />
          <div className="glass relative flex items-center gap-3 rounded-full px-5 py-3 shadow-lg dark:ring-1 dark:ring-white/[0.07] sm:px-7 sm:py-4">
            <Search className="size-5 shrink-0 text-ink-faint" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputMode="numeric"
              placeholder={t('Try 4444, or 1000, or Alexandria')}
              aria-label={t('Search available numbers')}
              className="ltr-island min-w-0 flex-1 bg-transparent text-lg tabular-nums text-ink placeholder:text-ink-faint focus:outline-none sm:text-xl"
            />
            <AnimatePresence>
              {q && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setQ('')
                    inputRef.current?.focus()
                  }}
                  aria-label={t('Clear')}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-veil-strong hover:text-ink"
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {TYPES.map((ty) => {
            const active = ty.value === type
            return (
              <button
                key={ty.value}
                onClick={() => setType(ty.value)}
                aria-pressed={active}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  active ? 'text-ink' : 'text-ink-subtle hover:text-ink',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="search-type"
                    className="absolute inset-0 rounded-full bg-veil-strong"
                    transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                  />
                )}
                <span className="relative">{t(ty.label)}</span>
              </button>
            )
          })}
        </div>
      </Reveal>

      {/* Results run wider than the reading column — the list is a window onto
          something bigger than this page. */}
      <div className="relative mx-auto mt-16 max-w-4xl">
        <div className="mb-4 flex items-baseline justify-between gap-3 px-1">
          <p className="eyebrow">
            {rows.length === 1 ? t('One number matches') : t('{n} numbers match', { n: rows.length })}
          </p>
          <p className="text-xs tabular-nums text-ink-faint">{t('of {n} in Egypt', { n: 84 })}</p>
        </div>

        <div className="min-h-[22rem]">
          <AnimatePresence mode="popLayout">
            {rows.map((r, i) => (
              <motion.div
                key={r.e164}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2), ease: EASE }}
                className="group flex items-center gap-4 border-b border-line-soft px-1 py-4 last:border-b-0"
              >
                <CarrierAvatar carrier={r.carrier} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-md tabular-nums text-ink">
                    {formatE164(r.e164)}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-faint">
                    {t(TYPE_LABEL[r.type])}
                    <span aria-hidden>·</span>
                    {t(r.city)}
                  </span>
                </span>
                {r.regulated && (
                  <Badge tone="warning" size="sm" className="hidden shrink-0 sm:inline-flex">
                    {t('Needs verification')}
                  </Badge>
                )}
                <CapabilityPills capabilities={r.caps} size="sm" className="hidden md:flex" />
                <span className="shrink-0 text-end">
                  <span className="block text-sm font-semibold tabular-nums text-ink">{money(r.price)}</span>
                  <span className="block text-2xs text-ink-faint">{t('/mo')}</span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {rows.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
              <p className="text-lg text-ink">{t('Nothing with those digits — in this sample.')}</p>
              <p className="mt-2 text-base text-ink-subtle">
                {t('The live search covers the whole Egyptian range.')}
              </p>
            </motion.div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="secondary" size="lg" asChild>
            <Link to="/numbers/buy">
              {t('Open the real marketplace')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Scene>
  )
}

const TYPE_LABEL: Record<NumberType, string> = {
  local: 'Local',
  mobile: 'Mobile',
  national: 'National',
  tollfree: 'Toll-free',
}
