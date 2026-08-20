import * as React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, CircleCheck, Download, Funnel, RefreshCw, Search, TriangleAlert } from 'lucide-react'
import { Hero, HERO_ART_SIP } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/feedback'
import { DataTable, type Column } from '@/components/ui/table'
import { SearchInput } from '@/components/ui/inputs-special'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CodeBlock, DetailRow, Mono, Separator } from '@/components/ui/misc'
import { Segmented } from '@/components/ui/toggle'
import { BarChart } from '@/components/charts/bar-chart'
import { Progress } from '@/components/ui/progress'
import { DevNav } from './dev-nav'
import { useApp } from '@/store/app'
import { dateTime, num, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { RequestLog } from '@/lib/types'
import { seedRequestLogs } from '@/lib/data/seed'
import { useI18n } from '@/lib/i18n'

const METHOD_TONE = {
  GET: 'info',
  POST: 'success',
  PATCH: 'warning',
  DELETE: 'danger',
} as const

function statusTone(status: number) {
  if (status < 300) return 'success'
  if (status < 400) return 'info'
  if (status < 500) return 'warning'
  return 'danger'
}

export default function LogsPage() {
  const { t } = useI18n()
  const storeLogs = useApp((s) => s.requestLogs)
  const [logs, setLogs] = React.useState(storeLogs)
  const [q, setQ] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('any')
  const [methodFilter, setMethodFilter] = React.useState('any')
  const [range, setRange] = React.useState('1h')
  const [selected, setSelected] = React.useState<RequestLog | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)

  const filtered = React.useMemo(
    () =>
      logs.filter((l) => {
        if (q && !l.path.toLowerCase().includes(q.toLowerCase()) && !l.ip.includes(q)) return false
        if (methodFilter !== 'any' && l.method !== methodFilter) return false
        if (statusFilter === '2xx' && l.status >= 300) return false
        if (statusFilter === '4xx' && (l.status < 400 || l.status >= 500)) return false
        if (statusFilter === '5xx' && l.status < 500) return false
        return true
      }),
    [logs, q, methodFilter, statusFilter],
  )

  const errorRate = logs.length ? (logs.filter((l) => l.status >= 400).length / logs.length) * 100 : 0
  const p50 = [...logs].sort((a, b) => a.latencyMs - b.latencyMs)[Math.floor(logs.length / 2)]?.latencyMs ?? 0
  const p99 =
    [...logs].sort((a, b) => a.latencyMs - b.latencyMs)[Math.floor(logs.length * 0.99)]?.latencyMs ?? 0

  const histogram = React.useMemo(() => {
    const buckets = ['<25', '25–50', '50–100', '100–200', '200–500', '500+']
    const counts = new Array(6).fill(0)
    logs.forEach((l) => {
      const i =
        l.latencyMs < 25
          ? 0
          : l.latencyMs < 50
            ? 1
            : l.latencyMs < 100
              ? 2
              : l.latencyMs < 200
                ? 3
                : l.latencyMs < 500
                  ? 4
                  : 5
      counts[i]++
    })
    return buckets.map((label, i) => ({ label, value: counts[i] }))
  }, [logs])

  const refresh = async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 500))
    setLogs(seedRequestLogs())
    setRefreshing(false)
  }

  const columns: Column<RequestLog>[] = [
    {
      id: 'method',
      header: t('Method'),
      width: '10%',
      cell: (r) => (
        <Badge tone={METHOD_TONE[r.method]} size="sm" className="font-mono">
          {r.method}
        </Badge>
      ),
    },
    {
      id: 'path',
      header: t('Path'),
      headerClassName: 'w-full sm:w-[36%]',
      cell: (r) => <span className="truncate font-mono text-[12.5px] text-ink">{r.path}</span>,
    },
    {
      id: 'status',
      header: t('Status'),
      width: '12%',
      cell: (r) => (
        <Badge tone={statusTone(r.status)} size="sm" className="font-mono tabular-nums">
          {r.status}
        </Badge>
      ),
    },
    {
      id: 'latency',
      header: t('Latency'),
      align: 'right',
      width: '12%',
      hideBelow: 'sm',
      sortable: true,
      sortValue: (r) => r.latencyMs,
      cell: (r) => (
        <span className={cn('text-sm tabular-nums', r.latencyMs > 200 ? 'text-warning-ink' : 'text-ink')}>
          {r.latencyMs} ms
        </span>
      ),
    },
    {
      id: 'key',
      header: t('API key'),
      width: '16%',
      hideBelow: '2xl',
      cell: (r) => <span className="truncate text-sm text-ink-muted">{r.keyName}</span>,
    },
    {
      id: 'at',
      header: t('When'),
      align: 'right',
      width: '14%',
      hideBelow: 'sm',
      cell: (r) => <span className="text-xs tabular-nums text-ink-faint">{relativeTime(r.at)}</span>,
    },
  ]

  return (
    <>
      <Hero
        backdropImage={HERO_ART_SIP}
        mood="code"
        size="md"
        title={t('Request logs')}
        lede={t(
          'Every API call your keys made, with status, latency and the full request body. Retained for 30 days.',
        )}
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw />} loading={refreshing} onClick={refresh}>
              {t('Refresh')}
            </Button>
            <Button variant="ghost" icon={<Download />} onClick={() => toast.success('Export queued')}>
              {t('Export')}
            </Button>
          </>
        }
      >
        <DevNav />
      </Hero>

      <Section index={0}>
        <div className="grid grid-cols-2 gap-y-7 sm:divide-x sm:divide-line lg:grid-cols-4">
          {[
            { label: t('Requests'), value: num(logs.length * 1284), hint: t('Last hour') },
            {
              label: t('Error rate'),
              value: `${errorRate.toFixed(1)}%`,
              hint: t('Target < 1%'),
              bad: errorRate > 1,
            },
            { label: t('p50 latency'), value: `${p50} ms`, hint: t('Median') },
            { label: t('p99 latency'), value: `${p99} ms`, hint: t('Slowest 1%') },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: i * 0.05 }}
              className={cn('min-w-0 sm:px-6', i === 0 && 'sm:ps-0', 'lg:first:ps-0')}
            >
              <p className="eyebrow">{s.label}</p>
              <p
                className={cn(
                  'display mt-2.5 text-2xl font-semibold tabular-nums sm:text-3xl',
                  s.bad ? 'text-danger-ink' : 'text-ink',
                )}
              >
                {s.value}
              </p>
              <p className="mt-1.5 text-sm text-ink-subtle">{s.hint}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-10">
        <Section className="lg:col-span-2" eyebrow={t('Live')} title={t('Requests')} index={1}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={t('Search paths or IPs…')}
              size="sm"
              className="w-full sm:max-w-56"
            />
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger size="sm" className="w-auto min-w-[6.5rem]">
                <span className="flex items-center gap-1.5">
                  <Funnel className="size-3.5 text-ink-faint" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('Any method')}</SelectItem>
                <SelectItem value="GET">{'GET'}</SelectItem>
                <SelectItem value="POST">{'POST'}</SelectItem>
                <SelectItem value="PATCH">{'PATCH'}</SelectItem>
                <SelectItem value="DELETE">{'DELETE'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-auto min-w-[6.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('Any status')}</SelectItem>
                <SelectItem value="2xx">2xx success</SelectItem>
                <SelectItem value="4xx">4xx client error</SelectItem>
                <SelectItem value="5xx">5xx server error</SelectItem>
              </SelectContent>
            </Select>
            <div className="ms-auto">
              <Segmented
                size="sm"
                value={range}
                onChange={setRange}
                options={[
                  { value: '1h', label: '1h' },
                  { value: '24h', label: '24h' },
                  { value: '7d', label: '7d' },
                ]}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            compact
            onRowClick={setSelected}
            animateRows={false}
            empty={
              <EmptyState
                compact
                icon={<Search />}
                title={t('No requests match those filters')}
                description={t('Widen the time range or clear the filters. Logs are retained for 30 days.')}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQ('')
                      setMethodFilter('any')
                      setStatusFilter('any')
                    }}
                  >
                    {t('Clear filters')}
                  </Button>
                }
              />
            }
          />
        </Section>

        <div className="space-y-5">
          <Section eyebrow={t('All requests in range')} title={t('Latency')} index={2}>
            <BarChart data={histogram} height={160} formatValue={(n) => `${n} reqs`} />
          </Section>

          <Section eyebrow={t('By request volume')} title={t('Top endpoints')} index={3}>
            <ul className="space-y-3">
              {[
                { p: 'POST /v2/calls', v: 62 },
                { p: 'GET /v2/available_phone_numbers', v: 21 },
                { p: 'POST /v2/messages', v: 11 },
                { p: 'GET /v2/balance', v: 6 },
              ].map((e) => (
                <li key={e.p}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-mono text-[12px] text-ink">{e.p}</span>
                    <span className="shrink-0 tabular-nums text-ink-muted">{e.v}%</span>
                  </div>
                  <Progress value={e.v} size="xs" />
                </li>
              ))}
            </ul>
          </Section>

          <Section eyebrow={t('Stuck on an error?')} title={t('Debugging a 4xx')} index={4}>
            <p className="text-base leading-relaxed text-ink-muted">
              Every error response includes a <Mono>request_id</Mono>. Quote it to support and we can trace the
              request end to end — including exactly what the carrier returned.
            </p>
          </Section>
        </div>
      </div>

      <Drawer
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        title={selected ? `${selected.method} ${selected.path}` : ''}
        description={selected ? dateTime(selected.at) : ''}
        width="max-w-xl"
      >
        {selected && (
          <div className="space-y-5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(selected.status)} size="lg" className="font-mono tabular-nums">
                {selected.status}
              </Badge>
              <Badge tone="outline" size="lg" className="tabular-nums">
                {selected.latencyMs} ms
              </Badge>
              {selected.status < 400 ? (
                <Badge tone="success" size="lg">
                  <CircleCheck />
                  {t('Succeeded')}
                </Badge>
              ) : (
                <Badge tone="danger" size="lg">
                  <TriangleAlert />
                  {t('Failed')}
                </Badge>
              )}
            </div>

            <dl className="divide-y divide-line">
              <DetailRow label={t('Request ID')}>
                <Mono copy>{`req_${selected.id.replace('req_', '')}8k2m`}</Mono>
              </DetailRow>
              <DetailRow label={t('API key')}>{selected.keyName}</DetailRow>
              <DetailRow label={t('Source IP')}>
                <span className="tabular-nums">{selected.ip}</span>
              </DetailRow>
              <DetailRow label={t('Region')}>eg-cai-1</DetailRow>
              <DetailRow label={t('Timestamp')}>{dateTime(selected.at)}</DetailRow>
            </dl>

            <Separator label={t('Request')} />
            <CodeBlock
              filename="request.json"
              code={
                selected.method === 'POST'
                  ? `{
  "to": "+201115540982",
  "from": "+20224618890",
  "connection_id": "sip_prod_edge",
  "webhook_url": "https://api.acme.eg/voice/inbound",
  "timeout_secs": 30
}`
                  : '// GET request — no body'
              }
            />

            <Separator label={t('Response')} />
            <CodeBlock
              filename="response.json"
              code={
                selected.status >= 500
                  ? `{
  "errors": [
    {
      "code": "internal_error",
      "title": "Upstream carrier timeout",
      "detail": "The carrier did not respond within 5000ms. Safe to retry."
    }
  ]
}`
                  : selected.status >= 400
                    ? `{
  "errors": [
    {
      "code": "invalid_parameter",
      "title": "from must be a number you own",
      "source": { "pointer": "/from" }
    }
  ]
}`
                    : `{
  "data": {
    "call_control_id": "cc_8821x",
    "call_leg_id": "leg_44a2f",
    "state": "queued",
    "created_at": "${selected.at}"
  }
}`
              }
            />

            {selected.status >= 400 && (
              <div className="rounded-2xl bg-warning-soft p-4">
                <p className="text-base font-semibold text-warning-ink">How to fix this</p>
                <p className="mt-1 text-sm leading-relaxed text-warning-ink/85">
                  {selected.status >= 500
                    ? 'This was our side. Retry with the same idempotency key — you will not be double-charged. If it persists for more than a minute, our status page will show it.'
                    : 'The caller ID must be a number on this workspace, in E.164 format. Check the number is active and not held for verification.'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  trailing={<ChevronRight className="size-3.5" />}
                >
                  {t('Open the error reference')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}
