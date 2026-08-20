import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { Hero, HERO_ART_OVERVIEW } from '@/components/canvas/hero'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { TopUpDialog } from '@/features/billing/top-up-dialog'
import { useApp, selConcurrentCalls } from '@/store/app'
import { useJourney, type AttentionItem, type Stage } from '@/lib/journey'
import { openZoie, useZoieContext } from '@/lib/zoie'
import { seedConcurrency, usageSeries } from '@/lib/data/seed'
import { isolateForeign, money, num, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

/**
 * The overview is a hub, not a report and not a wall of cards: it welcomes you,
 * shows what is still outstanding, and gives the headline numbers — all on one
 * continuous surface under the harbour artwork, so it reads as a place you pass
 * through on the way somewhere rather than a set of separate objects.
 */
export default function DashboardPage() {
  const { t } = useI18n()
  const profile = useApp((s) => s.profile)
  const workspace = useApp((s) => s.workspace)
  const numbers = useApp((s) => s.numbers)
  const connections = useApp((s) => s.connections)
  const activity = useApp((s) => s.activity)
  const balance = useApp((s) => s.balance)
  const concurrent = useApp(selConcurrentCalls)
  const markZoieHandoff = useApp((s) => s.markZoieHandoff)
  const currency = workspace.currency
  const zoie = useZoieContext()
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  const journey = useJourney()
  const concurrency = React.useMemo(() => seedConcurrency(), [])
  const series = React.useMemo(() => usageSeries(14), [])

  const activeNumbers = numbers.filter((n) => n.status === 'active').length
  const healthyTrunks = connections.filter((c) => c.status === 'active').length
  const unhealthy = connections.length - healthyTrunks
  const spend14 = series.reduce((sum, d) => sum + d.spend, 0)
  const runway = Math.max(0, Math.floor(balance / 18.4))
  const peak = Math.max(...concurrency.map((c) => c.value))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('Good morning') : hour < 18 ? t('Good afternoon') : t('Good evening')
  const firstName = profile.name.split(' ')[0]

  const pending = journey.stages.filter((s) => !s.done)
  const doneCount = journey.stages.length - pending.length
  const todo = pending.length + journey.attention.length

  return (
    <>
      <Hero
        backdropImage={HERO_ART_OVERVIEW}
        size="lg"
        eyebrow={
          <>
            <StatusDot
              tone={journey.allClear ? 'success' : unhealthy ? 'warning' : 'brand'}
              pulse={journey.allClear}
            />
            <span className="eyebrow">{workspace.name}</span>
            <span className="text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="eyebrow">
              {journey.allClear
                ? t('All systems normal')
                : unhealthy
                  ? t('{n} degraded', { n: unhealthy })
                  : t('Setting up')}
            </span>
          </>
        }
        title={
          <>
            {greeting}, {firstName}
          </>
        }
        lede={
          todo
            ? t('{n} waiting on you. {calls} calls are connected right now.', {
                n: t(todo === 1 ? 'One thing is' : '{n} things are', { n: todo }),
                calls: num(concurrent),
              })
            : t('Everything is running. {calls} calls are connected right now.', { calls: num(concurrent) })
        }
      />

      <div className="-mt-4 space-y-5 pb-4">
        {/* ── What's left ─────────────────────────────────────────────────
            The hub's reason to exist: orient, then route onward. A numbered run
            of steps directly on the canvas, so the sequence reads as one path
            instead of a set of separate tiles. */}
        {todo > 0 && (
          <section className="glass rounded-[28px] px-6 py-6 sm:px-7">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="headline text-xl text-ink">{t("What's left")}</h2>
              {doneCount > 0 && (
                <p className="text-sm tabular-nums text-ink-faint">
                  {t('{done} of {total} steps done', { done: doneCount, total: journey.stages.length })}
                </p>
              )}
            </div>

            <ol className="mt-6 divide-y divide-line-soft">
              {pending.map((stage, i) => (
                <StepRow
                  key={stage.id}
                  n={doneCount + i + 1}
                  stage={stage}
                  first={i === 0}
                  onZoie={() => {
                    if (stage.zoie) {
                      openZoie(stage.zoie, zoie)
                      markZoieHandoff()
                    }
                  }}
                />
              ))}
              {journey.attention.map((item, i) => (
                <ProblemRow key={item.id} item={item} delay={(pending.length + i) * 0.05} />
              ))}
            </ol>
          </section>
        )}

        {/* ── Metrics: inline figures on one sheet of glass. ──────────────── */}
        <section className="glass rounded-[28px] px-6 py-6 sm:px-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="headline text-xl text-ink">{t('Where things stand')}</h2>
            <Link
              to="/analytics"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {t('Usage & quality')}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line-soft">
            <Figure
              first
              label={t('Live calls')}
              value={num(concurrent)}
              meta={t('peak {n} in 24h', { n: num(peak) })}
              tone="success"
              href="/analytics"
            />
            <Figure
              label={t('Numbers')}
              value={`${activeNumbers}${numbers.length > activeNumbers ? `/${numbers.length}` : ''}`}
              meta={
                numbers.length > activeNumbers
                  ? t('{n} held', { n: numbers.length - activeNumbers })
                  : t('all routable')
              }
              tone={numbers.length > activeNumbers ? 'warning' : 'success'}
              href="/numbers"
            />
            <Figure
              label={t('Trunks')}
              value={`${healthyTrunks}/${connections.length}`}
              meta={unhealthy ? t('{n} unhealthy', { n: unhealthy }) : t('all registered')}
              tone={unhealthy ? 'warning' : 'success'}
              href="/sip"
            />
            <Figure
              label={t('Wallet')}
              value={money(balance, currency, { compact: true })}
              meta={t('{n} days of runway', { n: runway })}
              href="/billing"
              action={
                <Button size="xs" variant="secondary" icon={<Plus />} onClick={() => setTopUpOpen(true)}>
                  {t('Add funds')}
                </Button>
              }
            />
            <Figure
              label={t('Spend, 14d')}
              value={money(spend14, currency, { compact: true })}
              meta={t('drawn from your wallet')}
              href="/billing"
            />
          </div>
        </section>

        {/* ── A quiet tail: what changed, and the ways onward. ────────────── */}
        <section className="glass rounded-[28px] px-6 py-6 sm:px-7">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_16rem]">
            <div>
              <h2 className="headline text-xl text-ink">{t('What changed')}</h2>
              <ul className="mt-6 space-y-4">
                {activity.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-baseline gap-3">
                    <span
                      className={cn(
                        'mt-1.5 size-1.5 shrink-0 rounded-full',
                        a.kind === 'billing'
                          ? 'bg-success'
                          : a.kind === 'sip'
                            ? 'bg-warning'
                            : a.kind === 'verification'
                              ? 'bg-brand'
                              : 'bg-line-strong',
                      )}
                      aria-hidden
                    />
                    <p className="min-w-0 flex-1 text-sm leading-relaxed">
                      <span className="font-medium text-ink">{a.actor}</span>{' '}
                      <span className="text-ink-muted">{isolateForeign(a.action)}</span>
                      {a.detail && <span className="text-ink-faint"> · {isolateForeign(a.detail)}</span>}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-ink-faint">{relativeTime(a.at)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">{t('Go deeper')}</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  { to: '/analytics', label: t('Usage & quality') },
                  { to: '/analytics?tab=calls', label: t('Call log') },
                  { to: '/developers', label: t('API keys & webhooks') },
                  { to: '/team', label: t('Team & audit log') },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="group inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                      <ArrowRight className="size-3 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </>
  )
}

/**
 * One step on the path. Only the first outstanding step gets the filled marker
 * and a solid button — that is enough to say "start here" without wrapping it in
 * a banner.
 */
function StepRow({ n, stage, first, onZoie }: { n: number; stage: Stage; first: boolean; onZoie: () => void }) {
  const { t } = useI18n()
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min((n - 1) * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group -mx-2 flex flex-col gap-3 rounded-2xl px-2 py-4 transition-colors hover:bg-veil sm:flex-row sm:items-center sm:gap-5"
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums',
          first ? 'bg-brand text-brand-fg' : 'bg-veil-strong text-ink-faint',
        )}
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className={cn('text-md text-ink', first && 'font-medium')}>{t(stage.action)}</p>
          {stage.waiting && <span className="eyebrow text-info-ink">{t('with us')}</span>}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{t(stage.why)}</p>
      </div>
      <div className="shrink-0">
        {stage.zoie ? (
          <Button size="sm" variant={first ? 'primary' : 'ghost'} onClick={onZoie}>
            {t(stage.cta)}
            <ArrowUpRight className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant={first ? 'primary' : 'ghost'} asChild>
            <Link to={stage.to}>
              {t(stage.cta)}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </motion.li>
  )
}

const PROBLEM_TONE = {
  critical: { chip: 'bg-danger-soft text-danger', text: 'text-danger-ink' },
  warning: { chip: 'bg-warning-soft text-warning', text: 'text-warning-ink' },
  info: { chip: 'bg-info-soft text-info', text: 'text-ink' },
} as const

/** A problem shares the run with the steps — it is also just something to do. */
function ProblemRow({ item, delay }: { item: AttentionItem; delay: number }) {
  const { t } = useI18n()
  const tone = PROBLEM_TONE[item.severity]
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min(delay, 0.35), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={item.to}
        className="group -mx-2 flex flex-col gap-3 rounded-2xl px-2 py-4 transition-colors hover:bg-veil sm:flex-row sm:items-center sm:gap-5"
      >
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', tone.chip)}>
          <item.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-md', tone.text)}>{t(item.title)}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{t(item.detail)}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors group-hover:text-brand-ink">
          {t(item.cta)}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.li>
  )
}

function Figure({
  label,
  value,
  meta,
  tone,
  href,
  action,
  first,
}: {
  label: string
  value: string
  meta: string
  tone?: 'success' | 'warning' | 'danger'
  href: string
  action?: React.ReactNode
  first?: boolean
}) {
  return (
    <div className={cn('min-w-0 lg:px-6', first && 'lg:ps-0')}>
      <Link to={href} className="group block min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="eyebrow truncate">{label}</p>
          <ArrowUpRight className="size-3 shrink-0 text-ink-faint opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <p
          className={cn(
            'display mt-2.5 truncate text-[1.875rem] font-semibold tabular-nums leading-none',
            tone === 'warning' ? 'text-warning-ink' : tone === 'danger' ? 'text-danger-ink' : 'text-ink',
          )}
        >
          {value}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-subtle">
          {tone && <StatusDot tone={tone} />}
          <span className="truncate">{meta}</span>
        </p>
      </Link>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
