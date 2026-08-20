import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Accordion, AccordionItem } from '@/components/ui/misc'
import { money } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE, Glow, LineWipe, Reveal, Scene, Stat, Title } from '../kit'

/**
 * Scenes 10–12 — the close: proof, price, and the invitation.
 *
 * Deliberately the quietest stretch of the page after the loudest. Proof is one
 * quotation at reading scale with almost nothing around it; pricing is a
 * calculator rather than a pair of plans; and the final frame is the only place
 * the page raises its voice again.
 */

/* ── Scene 10 · proof ──────────────────────────────────────────────────── */

const VOICES = [
  {
    quote:
      'We had a Cairo number answering calls the same afternoon we signed up. The part I still think about is that nobody had to email us a spreadsheet.',
    name: 'Youssef Hegazy',
    role: 'Operations lead · Acme Retail',
    hue: 262,
  },
  {
    quote:
      'Knowing exactly which documents were needed up front meant compliance took one pass instead of four rounds of email.',
    name: 'Nour Abdelrahman',
    role: 'Compliance · Delta Logistics',
    hue: 190,
  },
  {
    quote:
      'The trunk registered on the first try and the quality panel told me more than our old carrier ever did. That is the whole review.',
    name: 'Karim Farouk',
    role: 'Platform engineer · Nile Health',
    hue: 152,
  },
]

/**
 * One voice at a time, at reading scale, on an empty ground. A row of three
 * cards would say the same thing and be skipped; a single quotation the size of
 * a paragraph gets read.
 */
export function ProofScene() {
  const { t } = useI18n()
  const [i, setI] = React.useState(0)
  const v = VOICES[i]

  return (
    <Scene ground="bare" measure="short">
      <div className="mx-auto max-w-[46rem]">
        <Reveal>
          <p className="eyebrow text-center">{t('09 — In production')}</p>
        </Reveal>

        <div className="mt-14 min-h-[16rem]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={v.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <blockquote className="text-balance text-center text-2xl leading-snug text-ink sm:text-3xl">
                {'“'}
                {t(v.quote)}
                {'”'}
              </blockquote>
              <figcaption className="mt-10 flex items-center justify-center gap-3">
                <Avatar name={v.name} hue={v.hue} size="md" />
                <span className="text-start">
                  <span className="block text-base font-medium text-ink">{v.name}</span>
                  <span className="block text-sm text-ink-faint">{t(v.role)}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Dashes, not dots — quieter, and they read as a position in a set. */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {VOICES.map((voice, idx) => (
            <button
              key={voice.name}
              onClick={() => setI(idx)}
              aria-label={t('Show quotation {n}', { n: idx + 1 })}
              aria-current={idx === i}
              className={cn(
                'h-0.5 w-8 rounded-full transition-colors',
                idx === i ? 'bg-ink' : 'bg-line-strong hover:bg-ink-faint',
              )}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-24 grid max-w-[52rem] grid-cols-2 gap-10 border-t border-line-soft pt-14 sm:grid-cols-4">
        <Stat value={t('4s')} caption={t('to provision a local line')} />
        <Stat value={t('99.99%')} caption={t('uptime target on voice')} />
        <Stat value={t('190+')} caption={t('destinations reachable')} />
        <Stat value={t('0')} caption={t('platform fees, on any plan')} />
      </div>
    </Scene>
  )
}

/* ── Scene 11 · pricing ────────────────────────────────────────────────── */

/** Volume discount bands, matching the application's pricing page. */
const TIERS = [
  { from: 0, to: 25_000, discount: 0, label: 'List' },
  { from: 25_000, to: 100_000, discount: 8, label: 'Tier 2' },
  { from: 100_000, to: 250_000, discount: 14, label: 'Tier 3' },
  { from: 250_000, to: Infinity, discount: 21, label: 'Tier 4' },
]
const BASE_RATE = 0.0231

/**
 * Pricing as a calculator, not a pair of plans.
 *
 * Two cards side by side is the most skipped composition on the internet, and it
 * hides the only thing a buyer wants: their number. A slider that resolves to a
 * per-minute rate and a monthly figure answers the question directly, and the
 * tier ladder underneath shows there is nothing to negotiate.
 */
export function PricingScene() {
  const { t } = useI18n()
  const [minutes, setMinutes] = React.useState(40_000)

  const tier = TIERS.find((x) => minutes >= x.from && minutes < x.to) ?? TIERS[0]
  const rate = BASE_RATE * (1 - tier.discount / 100)
  const monthly = rate * minutes
  const next = TIERS.find((x) => x.discount > tier.discount)

  return (
    <Scene id="pricing" ground="grid" measure="full" edge="fade-y">
      <div className="grid gap-16 lg:grid-cols-[26rem_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">{t('10 — What it costs')}</p>
            <Title size="lg" className="mt-6">
              {t('Per second. Published. Yours to check.')}
            </Title>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              {t(
                'No platform fee, no minimum, and no plan you have to be talked into. Discounts arrive on their own as volume grows.',
              )}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link to="/welcome">
                  {t('Start free')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/pricing">{t('See every rate')}</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        {/* The calculator. Floating, not carded. */}
        <Reveal delay={0.08}>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-10 -bottom-6 h-20 rounded-[50%] bg-ink/[0.08] blur-3xl"
            />
            <div className="glass relative overflow-hidden rounded-[28px] px-6 py-8 shadow-xl dark:ring-1 dark:ring-white/[0.07] sm:px-9 sm:py-10">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">{t('Your blended rate')}</p>
                  <p className="display mt-3 text-5xl text-ink sm:text-6xl">
                    {money(rate, 'USD', { precise: true })}
                  </p>
                  <p className="mt-2 text-sm text-ink-subtle">{t('per minute, all destinations')}</p>
                </div>
                <div className="text-end">
                  <p className="eyebrow">{t('At this volume')}</p>
                  <p className="display mt-3 text-2xl text-ink">{money(monthly)}</p>
                  <p className="mt-2 text-sm text-ink-subtle">{t('a month')}</p>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="volume" className="text-base text-ink">
                    {t('Outbound minutes a month')}
                  </label>
                  <span className="display text-lg tabular-nums text-ink">
                    {minutes.toLocaleString('en-US')}
                  </span>
                </div>
                <input
                  id="volume"
                  type="range"
                  min={1000}
                  max={400_000}
                  step={1000}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className={cn(
                    'mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3',
                    'accent-[hsl(var(--brand))]',
                    '[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none',
                    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand',
                    '[&::-webkit-slider-thumb]:shadow-md',
                  )}
                />
              </div>

              {/* The ladder. Shows where you are and what is next, which is the
                  honest version of "contact us for volume pricing". */}
              <div className="mt-9 grid grid-cols-4 gap-2 border-t border-line-soft pt-7">
                {TIERS.map((x) => {
                  const here = x === tier
                  return (
                    <div
                      key={x.label}
                      className={cn(
                        'rounded-xl px-2.5 py-3 transition-colors duration-300',
                        here ? 'bg-brand-softer ring-1 ring-brand/35' : 'bg-surface-2',
                      )}
                    >
                      <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                        {t(x.label)}
                      </p>
                      <p
                        className={cn(
                          'display mt-1.5 text-base tabular-nums',
                          here ? 'text-brand-ink' : 'text-ink',
                        )}
                      >
                        {x.discount === 0 ? t('base') : `−${x.discount}%`}
                      </p>
                    </div>
                  )
                })}
              </div>

              <p className="mt-6 text-sm leading-relaxed text-ink-subtle">
                {next
                  ? t('{n} minutes unlocks the next tier automatically.', {
                      n: next.from.toLocaleString('en-US'),
                    })
                  : t('You are on the best published rate. Talk to us about a committed plan.')}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Questions, folded away. A short list, and only the ones that actually
          stop a signup. */}
      <div className="mx-auto mt-28 max-w-[46rem]">
        <Reveal>
          <Accordion type="single" collapsible>
            <AccordionItem value="fast" title={t('How fast is a number really?')}>
              {t(
                'Local geographic numbers activate within seconds of checkout and you can place a test call immediately. National, mobile and toll-free ranges are regulated and need a verified business first — about three minutes to submit, usually reviewed inside six hours.',
              )}
            </AccordionItem>
            <AccordionItem value="kyc" title={t('Why does verification exist at all?')}>
              {t(
                'Phone numbers are a regulated national resource. In Egypt the NTRA holds the licensed carrier responsible for who uses each number. One check unlocks every range, permanently.',
              )}
            </AccordionItem>
            <AccordionItem value="wallet" title={t('What happens when the wallet runs out?')}>
              {t(
                'Calls stop. That is the design — a prepaid balance cannot become a surprise invoice. Set an auto-recharge threshold and a monthly spend limit and it will not happen unattended.',
              )}
            </AccordionItem>
            <AccordionItem value="zoie" title={t('Do I have to use Zoie?')}>
              {t(
                'No. It is one of four things a number can point at, alongside a SIP trunk, a webhook and plain forwarding. It is a separate product on its own domain, and Zoetel works identically if you never open it.',
              )}
            </AccordionItem>
            <AccordionItem value="lock" title={t('Is there a contract?')}>
              {t(
                'Not on pay as you go. Release a number and it returns to the carrier pool immediately; close the account and nothing is owed beyond usage already drawn. Volume plans have terms, which is the point of them.',
              )}
            </AccordionItem>
          </Accordion>
        </Reveal>
      </div>
    </Scene>
  )
}

/* ── Scene 12 · the invitation ─────────────────────────────────────────── */

/**
 * The last frame. Full-bleed onyx with the top edge lifted into a shallow arc,
 * so the page's final scene arrives as a horizon rather than as another panel.
 * Onyx is the product's surface for permanent structure — the nav rail, the
 * wallet — which makes closing on it read as arriving at the thing itself.
 */
export function ClosingScene() {
  const { t } = useI18n()

  return (
    <Scene ground="onyx" measure="tall" edge="curve" bleed className="overflow-hidden">
      <img
        src="/sip.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 size-full select-none object-cover opacity-[0.1] mix-blend-screen"
      />
      <Glow x="50%" y="0%" size="60rem" opacity={0.32} />

      <div className="relative mx-auto w-full max-w-[var(--page-max)] px-6 text-center sm:px-8">
        <Title as="h2" size="xl" balance={false} className="mx-auto max-w-[48rem] !text-white">
          <LineWipe>{t('Your first number')}</LineWipe>
          <LineWipe delay={0.08}>
            <span className="text-white/50">{t('is four seconds away.')}</span>
          </LineWipe>
        </Title>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-[32rem] text-lg leading-relaxed text-white/60">
            {t('No sales call, no procurement cycle. Create an account and start building.')}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Button size="xl" className="bg-white text-onyx shadow-none hover:bg-white/90" asChild>
              <Link to="/welcome">
                {t('Start free')}
                <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="ghost"
              className="text-white/80 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link to="/pricing">{t('Talk to sales')}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </Scene>
  )
}
