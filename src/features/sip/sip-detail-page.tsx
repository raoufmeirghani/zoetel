import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, ArrowRight, Network, Phone, ShieldCheck, Terminal, Trash2 } from 'lucide-react'
import { Hero } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { ConfigTabs } from '@/components/canvas/config-tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/feedback'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Mono } from '@/components/ui/misc'
import { StatusDot } from '@/components/ui/status'
import { AreaChart } from '@/components/charts/area-chart'
import { SipRegisterDrawer, useSipConfigSections } from './config-drawers'
import { useApp } from '@/store/app'
import type { SipConnection } from '@/lib/types'
import { formatE164, money, num, relativeTime } from '@/lib/format'
import { usageSeries } from '@/lib/data/seed'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

export default function SipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const conn = useApp((s) => s.connections.find((c) => c.id === id))
  const numbers = useApp((s) => s.numbers)
  const deleteConnection = useApp((s) => s.deleteConnection)
  const currency = useApp((s) => s.workspace.currency)

  const [registering, setRegistering] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const series = React.useMemo(() => usageSeries(14), [])

  if (!conn) {
    return (
      <>
        <Hero
          mood="quiet"
          size="sm"
          title="Connection not found"
          lede="It may have been deleted by a teammate."
        />
        <Section className="pt-4">
          <EmptyState
            icon={<Network />}
            title="That connection no longer exists"
            action={
              <Button variant="primary" asChild>
                <Link to="/sip">Back to SIP connections</Link>
              </Button>
            }
          />
        </Section>
      </>
    )
  }

  const assigned = numbers.filter((n) => n.connectionId === conn.id)
  const health = conn.health
  const hasTraffic = conn.stats.minutes > 0
  const healthScore =
    conn.status === 'offline'
      ? 0
      : Math.round(
          Math.max(
            0,
            Math.min(100, (health.mos / 4.5) * 45 + (health.asr / 90) * 35 + (1 - health.packetLoss / 3) * 20),
          ),
        )

  return (
    <>
      <Hero
        mood="ledger"
        size="md"
        breadcrumbs={[{ label: 'SIP connections', href: '/sip' }, { label: conn.name }]}
        eyebrow={
          <>
            <StatusDot
              tone={
                conn.status === 'active'
                  ? 'success'
                  : conn.status === 'degraded'
                    ? 'warning'
                    : conn.status === 'provisioning'
                      ? 'info'
                      : 'danger'
              }
              pulse={conn.status === 'active' || conn.status === 'provisioning'}
            />
            <span className="eyebrow capitalize">{conn.status}</span>
            <span className="text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="eyebrow">
              {conn.region} · {conn.transport.toUpperCase()}
            </span>
          </>
        }
        title={conn.name}
        lede={`${conn.concurrentCalls} of ${conn.channelLimit} channels in use, carrying ${num(conn.stats.minutes)} minutes this month.`}
        actions={
          <>
            <Button variant="primary" icon={<Terminal />} onClick={() => setRegistering(true)}>
              Register your PBX
            </Button>
            {conn.srtp && (
              <Badge tone="outline" size="lg">
                <ShieldCheck />
                SRTP
              </Badge>
            )}
          </>
        }
      />

      {conn.status === 'degraded' && (
        <div className="mb-10 rounded-3xl bg-warning-soft p-5">
          <p className="text-base font-medium text-warning-ink">Call quality is below target</p>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-warning-ink/85">
            We're seeing {health.packetLoss}% packet loss and {health.jitterMs} ms jitter from your side of the
            trunk. That usually means an over-subscribed uplink or a firewall rewriting RTP. Switching to TLS
            with SRTP and pinning media to the Cairo edge normally resolves it.
          </p>
        </div>
      )}
      {conn.status === 'provisioning' && (
        <div className="mb-10 rounded-3xl bg-info-soft p-5">
          <p className="text-base font-medium text-info-ink">Provisioning on the {conn.region} edge</p>
          <p className="mt-1.5 text-sm leading-relaxed text-info-ink/85">
            This takes a few seconds. Credentials are already available under Authentication.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* ── Health ───────────────────────────────────── */}
        <Section eyebrow="Right now" title="Connection health" index={0}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex shrink-0 items-center gap-4">
              <div className="relative grid size-[68px] place-items-center">
                <svg viewBox="0 0 36 36" className="size-[68px] -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-veil-strong" />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={
                      healthScore > 80
                        ? 'stroke-success'
                        : healthScore > 50
                          ? 'stroke-warning'
                          : 'stroke-danger'
                    }
                    strokeDasharray={97.4}
                    initial={{ strokeDashoffset: 97.4 }}
                    animate={{ strokeDashoffset: 97.4 - (healthScore / 100) * 97.4 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <span className="absolute text-md font-semibold tabular-nums text-ink">{healthScore}</span>
              </div>
              <div className="min-w-0">
                <p className="text-md font-medium text-ink">
                  {healthScore > 80 ? 'Healthy' : healthScore > 50 ? 'Degraded' : 'Not registered'}
                </p>
                <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-ink-subtle">
                  {healthScore > 80
                    ? 'Quality and answer rates are within target.'
                    : healthScore > 50
                      ? 'Below target — start with your uplink.'
                      : 'No SIP registration or OPTIONS ping received.'}
                </p>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-line">
              <Metric
                label="MOS"
                value={health.mos > 0 ? health.mos.toFixed(2) : '—'}
                target="≥ 4.0"
                good={health.mos > 4}
                first
              />
              <Metric
                label="ASR"
                value={health.asr > 0 ? `${health.asr.toFixed(1)}%` : '—'}
                target="≥ 65%"
                good={health.asr > 65}
              />
              <Metric
                label="Jitter"
                value={`${health.jitterMs} ms`}
                target="< 15 ms"
                good={health.jitterMs < 15}
              />
              <Metric
                label="Packet loss"
                value={`${health.packetLoss}%`}
                target="< 0.5%"
                good={health.packetLoss < 0.5}
              />
            </div>
          </div>

          {hasTraffic ? (
            <div className="-mx-2 mt-10">
              <AreaChart
                data={series.map((d) => ({ label: d.label, value: Math.round(d.minutes * 0.6) }))}
                height={180}
                tone="brand"
                formatValue={(n) => `${num(n)} min`}
                ariaLabel="Minutes on this connection over 14 days"
              />
            </div>
          ) : (
            <p className="mt-8 flex items-center gap-2 text-base text-ink-subtle">
              <Activity className="size-4 shrink-0 text-ink-faint" />
              No traffic yet. Register your PBX against the endpoint, then place a test call — minutes and
              quality land here within a minute.
            </p>
          )}
        </Section>

        {/* ── Configuration, as tabs with the form already open ── */}
        <SipConfigSection key={conn.id} conn={conn} />

        {/* ── Numbers ──────────────────────────────────── */}
        <Section
          eyebrow="Routing"
          title={`${assigned.length} ${assigned.length === 1 ? 'number' : 'numbers'} routed here`}
          href="/numbers"
          hrefLabel="Manage numbers"
          divided
          index={2}
        >
          {assigned.length === 0 ? (
            <p className="text-base leading-relaxed text-ink-subtle">
              Nothing points here yet. Assign a number and inbound calls start arriving immediately —{' '}
              <Link to="/numbers" className="font-medium text-brand-ink underline underline-offset-4">
                choose one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {assigned.map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/numbers/${n.id}`}
                    className="group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-veil"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-veil-strong text-ink-muted">
                      <Phone className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-ink">{n.label ?? formatE164(n.e164)}</p>
                      {n.label && (
                        <p className="mt-0.5 truncate font-mono text-xs tabular-nums text-ink-subtle">
                          {formatE164(n.e164)}
                        </p>
                      )}
                    </div>
                    <span className="hidden shrink-0 text-sm tabular-nums text-ink-muted sm:block">
                      {num(n.usage.minutes)} min
                    </span>
                    <StatusDot tone={n.status === 'active' ? 'success' : 'warning'} />
                    <ArrowRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ── Events ───────────────────────────────────── */}
        <Section eyebrow="Signalling" title="Recent SIP events" divided index={3}>
          <ul className="divide-y divide-line-soft">
            {(hasTraffic
              ? [
                  {
                    code: '200 OK',
                    label: 'OPTIONS keep-alive',
                    tone: 'success' as const,
                    at: '40 seconds ago',
                  },
                  {
                    code: '200 OK',
                    label: 'REGISTER from 41.33.87.12',
                    tone: 'success' as const,
                    at: '3 minutes ago',
                  },
                  ...(conn.status === 'degraded'
                    ? [
                        {
                          code: '480 Temporarily Unavailable',
                          label: 'INVITE to +20 111 554 0982',
                          tone: 'warning' as const,
                          at: '9 minutes ago',
                        },
                      ]
                    : []),
                  { code: '200 OK', label: 'INVITE accepted', tone: 'success' as const, at: '12 minutes ago' },
                  ...(conn.status === 'offline'
                    ? [
                        {
                          code: '408 Request Timeout',
                          label: 'OPTIONS keep-alive',
                          tone: 'danger' as const,
                          at: '9 days ago',
                        },
                      ]
                    : []),
                ]
              : [
                  {
                    code: 'No data',
                    label: 'Waiting for the first registration',
                    tone: 'warning' as const,
                    at: 'just now',
                  },
                ]
            ).map((e, i) => (
              <li key={i} className="flex items-center gap-3.5 py-3">
                <Badge tone={e.tone} className="shrink-0 font-mono">
                  {e.code}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-base text-ink">{e.label}</span>
                <span className="shrink-0 text-xs tabular-nums text-ink-faint">{e.at}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Facts + danger ───────────────────────────── */}
        <Section divided index={4}>
          <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
            <dl className="grid flex-1 gap-y-4 sm:grid-cols-2">
              <Fact label="Connection ID">
                <Mono copy>{conn.id}</Mono>
              </Fact>
              <Fact label="Created">{relativeTime(conn.createdAt)}</Fact>
              <Fact label="Calls this month">{num(conn.stats.calls)}</Fact>
              <Fact label="Spend this month">{money(conn.stats.spend, currency)}</Fact>
            </dl>
            <div className="shrink-0 lg:max-w-xs lg:pl-8">
              <p className="eyebrow">Deleting</p>
              <p className="mt-2 text-base leading-relaxed text-ink-muted">
                {conn.concurrentCalls} active {conn.concurrentCalls === 1 ? 'call' : 'calls'} would be dropped
                and {assigned.length} {assigned.length === 1 ? 'number' : 'numbers'} would stop receiving
                traffic.
              </p>
              <Button
                variant="destructive-quiet"
                size="sm"
                icon={<Trash2 />}
                className="mt-4"
                onClick={() => setDeleting(true)}
              >
                Delete connection
              </Button>
            </div>
          </div>
        </Section>
      </div>

      <SipRegisterDrawer open={registering} conn={conn} onClose={() => setRegistering(false)} />

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${conn.name}?`}
        description={`${conn.concurrentCalls} active ${conn.concurrentCalls === 1 ? 'call' : 'calls'} will be dropped and ${assigned.length} ${assigned.length === 1 ? 'number' : 'numbers'} will stop receiving traffic.`}
        confirmLabel="Delete connection"
        destructive
        icon={<Trash2 />}
        onConfirm={() => {
          deleteConnection(conn.id)
          toast.success('Connection deleted')
          navigate('/sip')
        }}
      />
    </>
  )
}

function Metric({
  label,
  value,
  target,
  good,
  first,
}: {
  label: string
  value: string
  target: string
  good: boolean
  first?: boolean
}) {
  return (
    <div className={cn('min-w-0 lg:px-5', first && 'lg:pl-0')}>
      <div className="flex items-center gap-1.5">
        <Tooltip content={`Target ${target}`}>
          <span className="eyebrow cursor-help decoration-dotted underline-offset-4 hover:underline">
            {label}
          </span>
        </Tooltip>
        <StatusDot tone={value === '—' ? 'neutral' : good ? 'success' : 'warning'} />
      </div>
      <p className="display mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-faint">Target {target}</p>
    </div>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 truncate text-base text-ink">{children}</dd>
    </div>
  )
}

/**
 * Own component so the settings hook runs with a guaranteed connection, and so
 * drafts reset when the caller remounts it on a different trunk.
 */
function SipConfigSection({ conn }: { conn: SipConnection }) {
  const sections = useSipConfigSections(conn)
  return (
    <Section
      eyebrow="Configuration"
      title="Settings"
      lede="Everything is on this screen — pick a heading to edit it. Defaults suit a typical production trunk."
      divided
      index={1}
    >
      <ConfigTabs sections={sections} layoutId="sip-config" />
    </Section>
  )
}
