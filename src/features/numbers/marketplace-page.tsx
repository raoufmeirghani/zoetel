import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Hero } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChipGroup } from '@/components/ui/inputs-special'
import { EmptyState } from '@/components/ui/feedback'
import { Tooltip } from '@/components/ui/tooltip'
import { CapabilityPills } from '@/components/shared/capability-pills'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { COUNTRIES, NUMBER_TYPE_META, countryByCode } from '@/lib/data/countries'
import { searchInventory, type NumberQuery } from '@/lib/data/numbers'
import type { Capability, NumberType, PhoneNumber } from '@/lib/types'
import { formatE164, money, num } from '@/lib/format'
import { cn, sleep } from '@/lib/utils'
import { useApp } from '@/store/app'

const CAP_OPTIONS: { value: Capability; label: string; icon: React.ReactNode }[] = [
  { value: 'voice', label: 'Voice', icon: <Phone /> },
  { value: 'sms', label: 'SMS', icon: <MessageSquare /> },
  { value: 'mms', label: 'MMS', icon: <ImageIcon /> },
  { value: 'fax', label: 'Fax', icon: <Printer /> },
]

const TYPE_OPTIONS: { value: NumberType; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'national', label: 'National' },
  { value: 'tollfree', label: 'Toll-free' },
]

type Sort = 'price-asc' | 'price-desc' | 'type' | 'city'

export default function MarketplacePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const cart = useApp((s) => s.cart)
  const navPinned = useApp((s) => s.navPinned)
  const addToCart = useApp((s) => s.addToCart)
  const removeFromCart = useApp((s) => s.removeFromCart)
  const favorites = useApp((s) => s.favorites)
  const toggleFavorite = useApp((s) => s.toggleFavorite)
  const pushRecentSearch = useApp((s) => s.pushRecentSearch)
  const currency = useApp((s) => s.workspace.currency)
  const kycStage = useApp((s) => s.verification.stage)

  const [country, setCountry] = React.useState(params.get('country') ?? 'EG')
  const [types, setTypes] = React.useState<NumberType[]>(
    params.get('type') ? [params.get('type') as NumberType] : [],
  )
  const [contains, setContains] = React.useState(params.get('contains') ?? '')
  const [debounced, setDebounced] = React.useState(contains)
  const [refineOpen, setRefineOpen] = React.useState(false)
  const [region, setRegion] = React.useState('any')
  const [city, setCity] = React.useState('any')
  const [caps, setCaps] = React.useState<Capability[]>([])
  const [sort, setSort] = React.useState<Sort>('price-asc')
  const [onlySaved, setOnlySaved] = React.useState(false)

  const meta = countryByCode(country)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(contains)
      if (contains.length >= 3) pushRecentSearch(contains)
    }, 300)
    return () => clearTimeout(t)
  }, [contains, pushRecentSearch])

  React.useEffect(() => {
    setRegion('any')
    setCity('any')
  }, [country])

  React.useEffect(() => {
    const next = new URLSearchParams()
    if (country !== 'EG') next.set('country', country)
    if (types.length === 1) next.set('type', types[0])
    if (debounced) next.set('contains', debounced)
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, types, debounced])

  const query: NumberQuery = {
    country,
    region: region === 'any' ? undefined : region,
    city: city === 'any' ? undefined : city,
    type: types.length === 1 ? types[0] : 'any',
    capabilities: caps,
    contains: debounced || undefined,
  }

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['inventory', query],
    queryFn: async () => {
      await sleep(240)
      return searchInventory(query, 84)
    },
    placeholderData: (prev) => prev,
  })

  const results = React.useMemo(() => {
    let rows = data ?? []
    if (types.length > 1) rows = rows.filter((r) => types.includes(r.type))
    if (onlySaved) rows = rows.filter((r) => favorites.includes(r.id))
    const sorters: Record<Sort, (a: PhoneNumber, b: PhoneNumber) => number> = {
      'price-asc': (a, b) => a.monthly + a.setup - (b.monthly + b.setup),
      'price-desc': (a, b) => b.monthly + b.setup - (a.monthly + a.setup),
      type: (a, b) => a.type.localeCompare(b.type),
      city: (a, b) => a.city.localeCompare(b.city),
    }
    return [...rows].sort(sorters[sort])
  }, [data, types, onlySaved, favorites, sort])

  const inCart = (id: string) => cart.some((c) => c.id === id)
  const cartTotal = cart.reduce((s, n) => s + n.monthly + n.setup, 0)
  const refineCount = (region !== 'any' ? 1 : 0) + (city !== 'any' ? 1 : 0) + caps.length

  const reset = () => {
    setTypes([])
    setContains('')
    setRegion('any')
    setCity('any')
    setCaps([])
    setOnlySaved(false)
  }

  return (
    <>
      <Hero
        size="md"
        breadcrumbs={[{ label: 'Phone numbers', href: '/numbers' }, { label: 'Buy' }]}
        title="Find your number"
        lede={`Live inventory across ${COUNTRIES.filter((c) => c.live).length} countries. Pick one and it's routable within seconds of checkout.`}
      >
        {/* ── The search is the page ─────────────────── */}
        <div className="chrome relative z-10 rounded-[26px] p-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                size="lg"
                className="w-full shrink-0 rounded-[18px] border-0 bg-veil-strong shadow-none hover:bg-line-soft focus-visible:shadow-none data-[state=open]:shadow-none sm:w-56"
              >
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-base">{meta.flag}</span>
                    <span className="truncate font-medium">{meta.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.filter((c) => c.live).map((c) => (
                  <SelectItem key={c.code} value={c.code} hint={c.dial}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
                {COUNTRIES.filter((c) => !c.live).map((c) => (
                  <SelectItem key={c.code} value={c.code} disabled hint="Waitlist">
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex min-w-0 flex-1 items-center">
              <Search className="pointer-events-none absolute left-3.5 size-4 text-ink-faint" />
              <input
                value={contains}
                onChange={(e) => setContains(e.target.value.replace(/[^\d]/g, ''))}
                inputMode="numeric"
                placeholder="Search for digits you want — 1000, 4444, your street number…"
                aria-label="Digits the number should contain"
                className="h-11 w-full min-w-0 rounded-[18px] bg-transparent pl-10 pr-10 text-md tabular-nums text-ink placeholder:text-ink-faint focus:outline-none"
              />
              {contains && (
                <button
                  onClick={() => setContains('')}
                  className="absolute right-3 grid size-6 place-items-center rounded-full text-ink-faint transition-colors hover:bg-veil-strong hover:text-ink"
                  aria-label="Clear"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 px-1 pb-1">
            <ChipGroup size="sm" options={TYPE_OPTIONS} value={types} onChange={setTypes} />
            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
            <button
              onClick={() => setRefineOpen((v) => !v)}
              aria-expanded={refineOpen}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors',
                refineOpen || refineCount
                  ? 'bg-brand-soft text-brand-ink'
                  : 'text-ink-muted hover:bg-veil-strong hover:text-ink',
              )}
            >
              Refine
              {refineCount > 0 && <span className="tabular-nums">· {refineCount}</span>}
              <ChevronDown className={cn('size-3 transition-transform', refineOpen && 'rotate-180')} />
            </button>
            <button
              onClick={() => setOnlySaved((v) => !v)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors',
                onlySaved
                  ? 'bg-brand-soft text-brand-ink'
                  : 'text-ink-muted hover:bg-veil-strong hover:text-ink',
              )}
            >
              <Heart className={cn('size-3', onlySaved && 'fill-current')} />
              Saved
              {favorites.length > 0 && <span className="tabular-nums">{favorites.length}</span>}
            </button>
            <span className="ml-auto text-xs tabular-nums text-ink-faint">
              {isFetching && !data ? 'Searching…' : `${num(results.length)} available`}
            </span>
          </div>

          {/* Advanced filters stay folded away until asked for. */}
          <AnimatePresence initial={false}>
            {refineOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-4 border-t border-line-soft px-1 pb-1 pt-4 sm:grid-cols-3">
                  <Field label="Region">
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger size="sm">
                        <SelectValue placeholder="Any region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any region</SelectItem>
                        {meta.regions.map((r) => (
                          <SelectItem key={r.name} value={r.name} hint={`0${r.areaCode}`}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="City">
                    <Select value={city} onValueChange={setCity} disabled={region === 'any'}>
                      <SelectTrigger size="sm">
                        <SelectValue placeholder={region === 'any' ? 'Pick a region first' : 'Any city'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any city</SelectItem>
                        {(meta.regions.find((r) => r.name === region)?.cities ?? []).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Must support">
                    <ChipGroup size="sm" options={CAP_OPTIONS} value={caps} onChange={setCaps} />
                  </Field>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* One quiet line where a compliance banner used to be. */}
        {meta.regulated && kycStage !== 'approved' && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-subtle">
            <TriangleAlert className="size-3.5 shrink-0 text-warning" />
            National, mobile and toll-free ranges need a verified entity.
            <button
              onClick={() => navigate('/verification')}
              className="font-medium text-brand-ink underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
            >
              Verify now
            </button>
            <span className="text-ink-faint">— local numbers are available immediately.</span>
          </p>
        )}
      </Hero>

      {/* ── Results ─────────────────────────────────── */}
      <Section
        className="pt-4"
        action={
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger
              size="sm"
              className="w-[9.5rem] border-0 bg-transparent shadow-none hover:bg-veil-strong"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Cheapest first</SelectItem>
              <SelectItem value="price-desc">Priciest first</SelectItem>
              <SelectItem value="type">By number type</SelectItem>
              <SelectItem value="city">By city</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {isError ? (
          <EmptyState
            icon={<TriangleAlert />}
            title="Inventory is temporarily unavailable"
            description="Our carrier partner didn't respond in time. Nothing was charged — try the search again."
            action={
              <Button variant="primary" onClick={() => refetch()}>
                Retry search
              </Button>
            }
          />
        ) : isFetching && !data ? (
          <ul className="divide-y divide-line-soft">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 py-4" style={{ opacity: 1 - i * 0.1 }}>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="ml-auto h-4 w-16" />
                <Skeleton className="h-8 w-[68px] rounded-xl" />
              </li>
            ))}
          </ul>
        ) : results.length === 0 ? (
          onlySaved ? (
            <EmptyState
              icon={<Heart />}
              title="Nothing saved yet"
              description="Tap the star beside any number to keep it here while you compare options with your team."
              action={
                <Button variant="secondary" onClick={() => setOnlySaved(false)}>
                  Browse all numbers
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Search />}
              title="No numbers match that"
              description={`We couldn't find ${
                types.length
                  ? types.map((t) => NUMBER_TYPE_META[t].label.toLowerCase()).join(' or ')
                  : 'numbers'
              } in ${region === 'any' ? meta.name : region}${debounced ? ` containing ${debounced}` : ''}. Widening the search usually helps.`}
              action={
                <Button variant="primary" onClick={reset} icon={<RotateCcw />}>
                  Clear filters
                </Button>
              }
            />
          )
        ) : (
          <>
            <ul className="divide-y divide-line-soft">
              {results.slice(0, 40).map((r, i) => {
                const added = inCart(r.id)
                const saved = favorites.includes(r.id)
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: Math.min(i * 0.014, 0.25), ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div
                      className={cn(
                        'group -mx-3 flex items-center gap-3 rounded-2xl px-3 py-3.5 transition-colors sm:gap-5',
                        added ? 'bg-brand-softer' : 'hover:bg-veil',
                      )}
                    >
                      <button
                        onClick={() => toggleFavorite(r.id)}
                        className="shrink-0 text-ink-faint/60 transition-colors hover:text-warning"
                        aria-label={saved ? 'Remove from saved' : 'Save this number'}
                      >
                        <Star className={cn('size-4', saved && 'fill-warning text-warning')} />
                      </button>

                      <CarrierAvatar carrier={r.carrier} size="sm" />

                      <div className="min-w-0 flex-1">
                        <p className="tnum truncate font-mono text-[15px] font-medium text-ink">
                          {formatE164(r.e164)}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-subtle">
                          <span>{NUMBER_TYPE_META[r.type].label}</span>
                          <span className="text-ink-faint/60" aria-hidden>
                            ·
                          </span>
                          <span className="truncate">{r.city}</span>
                          {r.isNew && (
                            <Badge tone="brand" size="sm" className="h-4 px-1 text-[9px]">
                              New
                            </Badge>
                          )}
                          {r.requiresRegulatoryDocs && (
                            <Tooltip
                              content={
                                kycStage === 'approved'
                                  ? 'Your entity is verified — this provisions immediately.'
                                  : `The ${meta.name} regulator requires a verified entity for this range.`
                              }
                            >
                              <span
                                className={cn(
                                  'inline-flex cursor-help items-center gap-1',
                                  kycStage === 'approved' ? 'text-success-ink' : 'text-warning-ink',
                                )}
                              >
                                {kycStage === 'approved' ? (
                                  <ShieldCheck className="size-3" />
                                ) : (
                                  <TriangleAlert className="size-3" />
                                )}
                                {kycStage === 'approved' ? 'Cleared' : 'Docs needed'}
                              </span>
                            </Tooltip>
                          )}
                        </p>
                      </div>

                      <CapabilityPills
                        capabilities={r.capabilities}
                        size="sm"
                        className="hidden shrink-0 md:flex"
                      />

                      <div className="shrink-0 text-right">
                        <p className="text-base font-medium tabular-nums text-ink">
                          {money(r.monthly, currency)}
                        </p>
                        <p className="mt-0.5 hidden whitespace-nowrap text-xs tabular-nums text-ink-faint sm:block">
                          {r.setup > 0 ? `+${money(r.setup, currency)} setup` : 'no setup fee'}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={added ? 'brandSoft' : 'secondary'}
                        onClick={() => (added ? removeFromCart(r.id) : addToCart(r))}
                        className="min-w-[68px] shrink-0 justify-center"
                        icon={added ? <Check /> : undefined}
                      >
                        {added ? 'Added' : 'Select'}
                      </Button>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
            {results.length > 40 && (
              <p className="pt-6 text-center text-sm text-ink-faint">
                Showing the first 40 of {num(results.length)}. Narrow the search to see further.
              </p>
            )}
          </>
        )}
      </Section>

      {cart.length > 0 && <div className="h-24" aria-hidden />}

      {/* ── Selection bar ───────────────────────────── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-20 transition-[padding] duration-300 ease-out sm:px-6 lg:pb-6',
              navPinned ? 'lg:pl-[calc(264px+1.5rem)]' : 'lg:pl-[calc(76px+1.5rem)]',
            )}
          >
            <div className="flex w-full max-w-2xl items-center gap-3 rounded-[26px] bg-onyx p-3 pl-4 text-onyx-fg shadow-xl">
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white/10">
                <Sparkles className="size-4 text-white/80" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-white">
                  {cart.length} {cart.length === 1 ? 'number' : 'numbers'} selected
                </p>
                <p className="truncate text-xs tabular-nums text-white/50">
                  {money(cartTotal, currency)} due today · then{' '}
                  {money(
                    cart.reduce((s, n) => s + n.monthly, 0),
                    currency,
                  )}
                  /mo
                </p>
              </div>
              <div className="hidden max-w-[15rem] flex-wrap gap-1 md:flex">
                {cart.slice(0, 3).map((n) => (
                  <span
                    key={n.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-white/80"
                  >
                    {formatE164(n.e164)}
                    <button onClick={() => removeFromCart(n.id)} aria-label={`Remove ${n.e164}`}>
                      <X className="size-3 opacity-60 hover:opacity-100" />
                    </button>
                  </span>
                ))}
                {cart.length > 3 && <span className="px-1 text-[11px] text-white/45">+{cart.length - 3}</span>}
              </div>
              <Button
                size="md"
                className="shrink-0 bg-white text-onyx shadow-none hover:bg-white/90"
                onClick={() => navigate('/numbers/checkout')}
              >
                Review order
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
