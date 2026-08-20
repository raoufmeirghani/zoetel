import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Download, MessageSquare, PhoneCall, Search, Signal, TrendingUp } from 'lucide-react'
import { Hero, HERO_ART_USAGE } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChipTabs } from '@/components/ui/tabs'
import { Segmented } from '@/components/ui/toggle'
import { StatusBadge, StatusDot } from '@/components/ui/status'
import { EmptyState } from '@/components/ui/feedback'
import { SearchInput } from '@/components/ui/inputs-special'
import { AreaChart } from '@/components/charts/area-chart'
import { BarChart, DonutChart } from '@/components/charts/bar-chart'
import { Progress } from '@/components/ui/progress'
import { Tooltip } from '@/components/ui/tooltip'
import { useApp } from '@/store/app'
import { seedConcurrency, usageSeries } from '@/lib/data/seed'
import { compactNum, duration, formatE164, money, num, relativeTime, timeOnly } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { useI18n } from '@/lib/i18n'

type Range = '7' | '30' | '90'
type Tab = 'overview' | 'calls' | 'messages' | 'quality'

export default function AnalyticsPage() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const currency = useApp((s) => s.workspace.currency)
  const calls = useApp((s) => s.calls)
  const messages = useApp((s) => s.messages)
  const numbers = useApp((s) => s.numbers)
  const connections = useApp((s) => s.connections)

  const [tab, setTab] = React.useState<Tab>((params.get('tab') as Tab) ?? 'overview')
  const [range, setRange] = React.useState<Range>('30')
  const [callSearch, setCallSearch] = React.useState('')
  const [direction, setDirection] = React.useState<'all' | 'inbound' | 'outbound'>('all')

  React.useEffect(() => {
    if (params.get('tab')) {
      setTab(params.get('tab') as Tab)
      setParams(new URLSearchParams(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const all = React.useMemo(() => usageSeries(90), [])
  const concurrency = React.useMemo(() => seedConcurrency(), [])
  const series = all.slice(-Number(range))
  const prev = all.slice(-Number(range) * 2, -Number(range))

  const sum = (k: 'minutes' | 'calls' | 'spend' | 'messages', arr = series) => arr.reduce((s, d) => s + d[k], 0)
  const delta = (k: 'minutes' | 'calls' | 'spend' | 'messages') => {
    const a = sum(k, prev)
    return a > 0 ? ((sum(k) - a) / a) * 100 : 0
  }

  const completed = calls.filter((c) => c.status === 'completed')
  const asr = calls.length ? (completed.length / calls.length) * 100 : 0
  const avgMos = completed.length ? completed.reduce((s, c) => s + c.mos, 0) / completed.length : 0
  const acd = completed.length ? completed.reduce((s, c) => s + c.seconds, 0) / completed.length : 0

  const filteredCalls = calls.filter((c) => {
    if (direction !== 'all' && c.direction !== direction) return false
    if (!callSearch) return true
    const n = callSearch.replace(/\D/g, '')
    return (
      (n && (c.from.includes(n) || c.to.includes(n))) ||
      c.connection.toLowerCase().includes(callSearch.toLowerCase())
    )
  })

  const hourOfDay = React.useMemo(() => {
    const buckets = new Array(12).fill(0)
    concurrency.forEach((c, i) => {
      buckets[Math.floor(i / 4)] += c.value
    })
    return buckets.map((v, i) => ({
      label: `${(i * 2).toString().padStart(2, '0')}`,
      value: Math.round(v / 4),
    }))
  }, [concurrency])

  const dispositions = [
    {
      label: t('Completed'),
      value: calls.filter((c) => c.status === 'completed').length,
      color: 'hsl(var(--success))',
    },
    {
      label: t('No answer'),
      value: calls.filter((c) => c.status === 'no_answer').length,
      color: 'hsl(var(--warning))',
    },
    { label: t('Busy'), value: calls.filter((c) => c.status === 'busy').length, color: 'hsl(var(--info))' },
    {
      label: t('Failed'),
      value: calls.filter((c) => c.status === 'failed').length,
      color: 'hsl(var(--danger))',
    },
  ].filter((d) => d.value > 0)

  return (
    <>
      <Hero
        mood="code"
        size="md"
        backdropImage={HERO_ART_USAGE}
        title={t('Usage')}
        lede={t('Minutes, spend and call quality across every number and connection.')}
        actions={
          <>
            <Segmented
              value={range}
              onChange={setRange}
              options={[
                { value: '7', label: t('7 days') },
                { value: '30', label: t('30 days') },
                { value: '90', label: t('90 days') },
              ]}
            />
            <Button variant="ghost" icon={<Download />} onClick={() => toast.success('Report queued')}>
              {t('Export')}
            </Button>
          </>
        }
      >
        <ChipTabs
          value={tab}
          onValueChange={setTab}
          layoutId="usage-tabs"
          items={[
            { value: 'overview', label: t('Overview') },
            { value: 'calls', label: t('Calls'), count: calls.length },
            { value: 'messages', label: t('Messages'), count: messages.length },
            { value: 'quality', label: t('Quality') },
          ]}
        />
      </Hero>

      {tab === 'overview' && (
        <div className="space-y-5">
          <Section index={0}>
            <div className="grid grid-cols-2 gap-y-7 sm:divide-x sm:divide-line lg:grid-cols-4">
              {[
                { label: t('Minutes'), value: num(sum('minutes')), d: delta('minutes') },
                { label: t('Calls'), value: num(sum('calls')), d: delta('calls') },
                { label: t('Messages'), value: num(sum('messages')), d: delta('messages') },
                { label: t('Spend'), value: money(sum('spend'), currency), d: delta('spend'), invert: true },
              ].map((f, i) => (
                <div key={f.label} className={cn('min-w-0 sm:px-6', i === 0 && 'sm:ps-0', 'lg:first:ps-0')}>
                  <p className="eyebrow">{f.label}</p>
                  <p className="display mt-2.5 truncate text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
                    {f.value}
                  </p>
                  <p
                    className={cn(
                      'mt-2 flex items-center gap-1 text-sm tabular-nums',
                      (f.invert ? f.d < 0 : f.d > 0) ? 'text-success-ink' : 'text-danger-ink',
                    )}
                  >
                    <TrendingUp className={cn('size-3.5', f.d < 0 && 'rotate-180')} />
                    {Math.abs(f.d).toFixed(1)}%
                    <span className="text-ink-faint">{t('vs previous {n}d', { n: range })}</span>
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section eyebrow={t('Last {n} days', { n: range })} title={t('Minutes and spend')} divided index={1}>
            <div className="-mx-2">
              <AreaChart
                key={range}
                data={series.map((d) => ({ label: d.label, value: d.minutes, secondary: d.spend * 20 }))}
                height={260}
                tone="brand"
                formatValue={(n) => `${num(n)} min`}
                formatSecondary={(n) => money(n / 20, currency)}
                ariaLabel={t('Minutes and spend over the last {n} days', { n: range })}
              />
            </div>
            <div className="mt-4 flex items-center gap-5 text-xs text-ink-subtle">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-brand" />
                {t('Minutes')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-5 border-t border-dashed border-ink/40" />
                {t('Spend')}
              </span>
            </div>
          </Section>

          <Section eyebrow={t('Recent sample')} title={t('How calls end')} divided index={2}>
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex items-center gap-7">
                <DonutChart
                  segments={dispositions}
                  size={124}
                  thickness={13}
                  center={
                    <>
                      <span className="text-[10px] uppercase tracking-wider text-ink-faint">ASR</span>
                      <span className="text-sm font-semibold tabular-nums text-ink">{asr.toFixed(0)}%</span>
                    </>
                  }
                />
                <ul className="min-w-0 flex-1 space-y-2.5">
                  {dispositions.map((d) => (
                    <li key={d.label} className="flex items-center gap-2.5 text-sm">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="min-w-0 flex-1 truncate text-ink-muted">{d.label}</span>
                      <span className="shrink-0 tabular-nums text-ink">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-1 flex items-center gap-1.5">
                  <Signal className="size-3" />
                  Busiest hours
                </p>
                <BarChart data={hourOfDay} height={150} formatValue={(n) => `${n} concurrent`} />
                <p className="mt-1 text-sm text-ink-subtle">
                  Peaks between 13:00 and 15:00. Size channel limits for{' '}
                  {num(Math.max(...hourOfDay.map((h) => h.value)))} concurrent calls.
                </p>
              </div>
            </div>
          </Section>

          <Section eyebrow={t('Leaders')} title={t('Where the traffic is')} divided index={3}>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Ranked
                title="Numbers"
                items={[...numbers]
                  .sort((a, b) => b.usage.minutes - a.usage.minutes)
                  .slice(0, 5)
                  .map((n) => ({
                    label: n.label ?? formatE164(n.e164),
                    value: n.usage.minutes,
                    sub: `${money(n.usage.spend, currency)} · ${num(n.usage.calls)} calls`,
                  }))}
              />
              <Ranked
                title="Connections"
                tone="info"
                items={[...connections]
                  .sort((a, b) => b.stats.minutes - a.stats.minutes)
                  .slice(0, 5)
                  .map((c) => ({
                    label: c.name,
                    value: c.stats.minutes,
                    sub: `${num(c.stats.calls)} calls · ${money(c.stats.spend, currency)}`,
                  }))}
              />
              <Ranked
                title="Destinations"
                tone="success"
                items={[
                  { label: t('Egypt — mobile'), value: 18420, sub: '62% of traffic' },
                  { label: t('Egypt — landline'), value: 9120, sub: '24% of traffic' },
                  { label: t('UAE — mobile'), value: 1240, sub: '8% of traffic' },
                  { label: t('Saudi Arabia — mobile'), value: 880, sub: '4% of traffic' },
                  { label: t('United Kingdom'), value: 420, sub: '2% of traffic' },
                ]}
              />
            </div>
          </Section>
        </div>
      )}

      {tab === 'calls' && (
        <Section
          eyebrow={t('{shown} of {total}', { shown: num(filteredCalls.length), total: num(calls.length) })}
          title={t('Call log')}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                size="sm"
                value={direction}
                onChange={setDirection}
                options={[
                  { value: 'all', label: t('All') },
                  { value: 'inbound', label: t('In') },
                  { value: 'outbound', label: t('Out') },
                ]}
              />
              <SearchInput
                value={callSearch}
                onChange={setCallSearch}
                placeholder={t('Number or connection…')}
                size="sm"
                className="w-48"
              />
            </div>
          }
        >
          {filteredCalls.length === 0 ? (
            <EmptyState
              compact
              icon={<Search />}
              title={t('No calls match that')}
              description={t('Try a different number, or switch the direction filter.')}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCallSearch('')
                    setDirection('all')
                  }}
                >
                  {t('Clear filters')}
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {filteredCalls.map((c) => (
                <li key={c.id} className="flex items-center gap-4 py-3.5">
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-xl',
                      c.status === 'completed'
                        ? 'bg-success-soft text-success'
                        : c.status === 'failed'
                          ? 'bg-danger-soft text-danger'
                          : 'bg-warning-soft text-warning',
                    )}
                  >
                    <PhoneCall className={cn('size-3.5', c.direction === 'inbound' && 'rotate-180')} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm tabular-nums text-ink">{formatE164(c.to)}</p>
                    <p className="truncate text-xs text-ink-subtle">
                      {c.direction === 'inbound' ? 'from' : 'via'} {formatE164(c.from)} · {c.connection}
                    </p>
                  </div>
                  {c.status !== 'completed' && <StatusBadge status={c.status} size="sm" />}
                  <span className="w-14 shrink-0 text-end text-sm tabular-nums text-ink">
                    {duration(c.seconds)}
                  </span>
                  <Tooltip
                    content={c.mos >= 4 ? t('Indistinguishable from a landline') : t('Audible degradation')}
                  >
                    <span
                      className={cn(
                        'hidden w-12 shrink-0 cursor-help text-end text-sm tabular-nums sm:block',
                        c.mos >= 4 ? 'text-success-ink' : 'text-warning-ink',
                      )}
                    >
                      {c.mos.toFixed(2)}
                    </span>
                  </Tooltip>
                  <span className="hidden w-16 shrink-0 text-end text-sm tabular-nums text-ink-muted md:block">
                    {money(c.cost, currency, { precise: true })}
                  </span>
                  <span className="hidden w-24 shrink-0 text-end text-xs tabular-nums text-ink-faint lg:block">
                    {relativeTime(c.startedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {tab === 'messages' && (
        <Section
          eyebrow={t('SMS and MMS')}
          title={t('Message log')}
          action={
            <Badge tone="outline">{numbers.filter((n) => n.smsEnabled).length} SMS-enabled numbers</Badge>
          }
        >
          {messages.length === 0 ? (
            <EmptyState
              compact
              icon={<MessageSquare />}
              title={t('No messages yet')}
              description={t(
                'Enable SMS on a mobile or local number, then send your first message with one API call.',
              )}
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {messages.map((m) => (
                <li key={m.id} className="flex items-center gap-4 py-3.5">
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-xl',
                      m.status === 'delivered'
                        ? 'bg-success-soft text-success'
                        : 'bg-warning-soft text-warning',
                    )}
                  >
                    <MessageSquare className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm tabular-nums text-ink">
                      {formatE164(m.direction === 'outbound' ? m.to : m.from)}
                    </p>
                    <p className="truncate text-xs text-ink-subtle">{m.body}</p>
                  </div>
                  <Badge tone="outline" size="sm" className="hidden capitalize sm:inline-flex">
                    {m.direction}
                  </Badge>
                  {m.status !== 'delivered' && <StatusBadge status={m.status} size="sm" />}
                  <span className="hidden w-10 shrink-0 text-end text-sm tabular-nums text-ink md:block">
                    {m.segments}
                  </span>
                  <span className="w-16 shrink-0 text-end text-sm tabular-nums text-ink-muted">
                    {money(m.cost, currency, { precise: true })}
                  </span>
                  <span className="hidden w-24 shrink-0 text-end text-xs tabular-nums text-ink-faint lg:block">
                    {relativeTime(m.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {tab === 'quality' && (
        <div className="space-y-5">
          <Section index={0}>
            <div className="grid grid-cols-2 gap-y-7 sm:divide-x sm:divide-line lg:grid-cols-4">
              {[
                {
                  label: t('ASR'),
                  value: `${asr.toFixed(1)}%`,
                  target: 'Target ≥ 65%',
                  good: asr >= 65,
                  pct: asr,
                },
                {
                  label: t('Average MOS'),
                  value: avgMos.toFixed(2),
                  target: 'Target ≥ 4.0',
                  good: avgMos >= 4,
                  pct: (avgMos / 5) * 100,
                },
                {
                  label: t('ACD'),
                  value: duration(acd),
                  target: 'Average call duration',
                  good: true,
                  pct: Math.min((acd / 300) * 100, 100),
                },
                { label: t('PDD'), value: '1.8 s', target: 'Post-dial delay', good: true, pct: 72 },
              ].map((m, i) => (
                <div key={m.label} className={cn('min-w-0 sm:px-6', i === 0 && 'sm:ps-0', 'lg:first:ps-0')}>
                  <div className="flex items-center gap-1.5">
                    <p className="eyebrow">{m.label}</p>
                    <StatusDot tone={m.good ? 'success' : 'warning'} />
                  </div>
                  <p
                    className={cn(
                      'display mt-2.5 text-2xl font-semibold tabular-nums sm:text-3xl',
                      m.good ? 'text-ink' : 'text-warning-ink',
                    )}
                  >
                    {m.value}
                  </p>
                  <Progress value={m.pct} size="xs" className="mt-3" tone={m.good ? 'success' : 'warning'} />
                  <p className="mt-1.5 text-xs text-ink-faint">{m.target}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section eyebrow={t('Last 24 hours')} title={t('Concurrent calls')} divided index={1}>
            <div className="-mx-2">
              <AreaChart
                data={concurrency.map((c) => ({ label: timeOnly(c.at), value: c.value }))}
                height={240}
                tone="success"
                formatValue={(n) => `${n} concurrent`}
                ariaLabel={t('Concurrent calls over the last 24 hours')}
              />
            </div>
          </Section>

          <Section eyebrow={t('By connection')} title={t('Where quality varies')} divided index={2}>
            <div className="grid gap-10 lg:grid-cols-2">
              <ul className="space-y-5">
                {connections
                  .filter((c) => c.health.mos > 0)
                  .map((c) => (
                    <li key={c.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-ink">{c.name}</span>
                        <span
                          className={cn(
                            'shrink-0 tabular-nums',
                            c.health.mos >= 4 ? 'text-success-ink' : 'text-warning-ink',
                          )}
                        >
                          {t('MOS {n}', { n: c.health.mos.toFixed(2) })}
                        </span>
                      </div>
                      <Progress
                        value={(c.health.mos / 5) * 100}
                        size="xs"
                        tone={c.health.mos >= 4 ? 'success' : 'warning'}
                      />
                    </li>
                  ))}
              </ul>
              <div>
                <p className="eyebrow mb-3 flex items-center gap-1.5">
                  <Activity className="size-3" />
                  {t('Reading these numbers')}
                </p>
                <dl className="divide-y divide-line-soft">
                  {[
                    { t: 'MOS', d: '1–5 perceived audio quality' },
                    { t: 'ASR', d: 'Answered ÷ attempted' },
                    { t: 'ACD', d: 'Mean length of answered calls' },
                    { t: 'PDD', d: 'Dial to first ringback' },
                  ].map((x) => (
                    <div key={x.t} className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-sm font-medium text-ink">{x.t}</dt>
                      <dd className="text-end text-sm text-ink-subtle">{x.d}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-ink-subtle">
                  A low ASR with a healthy MOS usually means list quality, not network quality. A low MOS points
                  at the network path — start with the connection's packet loss and jitter.
                </p>
              </div>
            </div>
          </Section>
        </div>
      )}

      <p className="mt-14 text-center text-xs text-ink-faint">
        Usage aggregates every 60 seconds. Billing figures are final; quality metrics are sampled.
      </p>
    </>
  )
}

function Ranked({
  title,
  items,
  tone = 'brand',
}: {
  title: string
  items: { label: string; value: number; sub?: string }[]
  tone?: 'brand' | 'info' | 'success'
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const bg = { brand: 'bg-brand/80', info: 'bg-info/80', success: 'bg-success/80' }
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-3.5">
        {items.map((it, i) => (
          <li key={it.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink">{it.label}</span>
              <span className="shrink-0 tabular-nums text-ink-muted">{compactNum(it.value)} min</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-veil-strong">
              <motion.div
                className={cn('h-full rounded-full', bg[tone])}
                initial={{ width: 0 }}
                animate={{ width: `${(it.value / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {it.sub && <p className="mt-1 text-xs text-ink-faint">{it.sub}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
