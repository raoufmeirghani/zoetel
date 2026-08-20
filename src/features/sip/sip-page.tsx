import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  AudioLines,
  Cable,
  Check,
  Clock,
  Gauge,
  Globe,
  HeartPulse,
  Lock,
  Plus,
  Server,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Hero, HERO_ART_SIP } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { SipPanel } from './sip-panel'
import { DestinationPicker } from '@/components/shared/destination-picker'
import { openZoie, useZoieContext } from '@/lib/zoie'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Drawer } from '@/components/ui/dialog'
import { Alert } from '@/components/ui/feedback'
import { StatusDot } from '@/components/ui/status'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NumberInput, ChipGroup } from '@/components/ui/inputs-special'
import { Switch } from '@/components/ui/toggle'
import { Mono } from '@/components/ui/misc'
import { useApp } from '@/store/app'
import { money, num, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { SipAuthMode, SipConnection, SipTransport } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

const AUTH_MODES: { value: SipAuthMode; label: string; blurb: string; icon: React.ElementType }[] = [
  {
    value: 'credential',
    label: 'Credentials',
    blurb: 'Username and password. Works from anywhere — best for softphones and dynamic IPs.',
    icon: Lock,
  },
  {
    value: 'ip',
    label: 'IP allow-list',
    blurb: 'Authenticate by source IP. The standard for PBXs and carriers with static addresses.',
    icon: Server,
  },
  {
    value: 'fqdn',
    label: 'FQDN',
    blurb: 'Authenticate a hostname with automatic DNS refresh. Ideal for cloud-hosted stacks.',
    icon: Globe,
  },
]

const REGIONS = ['Cairo (eg-cai-1)', 'Alexandria (eg-alx-1)', 'Dubai (ae-dxb-1)', 'Frankfurt (eu-fra-1)']

/**
 * The raw status enum spelled as an English word, so it has a dictionary key.
 * Rendering `c.status` directly worked in English by accident of naming.
 */
const STATUS_WORD: Record<string, string> = {
  active: 'Active',
  degraded: 'Degraded',
  offline: 'Offline',
  provisioning: 'Provisioning',
}

export default function SipPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const connections = useApp((s) => s.connections)
  const createConnection = useApp((s) => s.createConnection)
  const currency = useApp((s) => s.workspace.currency)

  const zoie = useZoieContext()
  const [createOpen, setCreateOpen] = React.useState(params.get('new') === '1')

  // The open trunk lives in the URL, so a panel is linkable and Back closes it.
  const openId = params.get('c')
  const openConn = connections.find((c) => c.id === openId)
  const openPanel = (id: string) => setParams({ c: id }, { replace: false })
  const closePanel = () => setParams({}, { replace: true })

  React.useEffect(() => {
    if (params.get('new') === '1') {
      setCreateOpen(true)
      setParams(new URLSearchParams(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const totalChannels = connections.reduce((s, c) => s + c.channelLimit, 0)
  const usedChannels = connections.reduce((s, c) => s + c.concurrentCalls, 0)
  const unhealthy = connections.filter((c) => c.status === 'degraded' || c.status === 'offline')
  const totalMinutes = connections.reduce((s, c) => s + c.stats.minutes, 0)

  if (connections.length === 0) {
    return (
      <>
        <Hero
          mood="ledger"
          backdropImage={HERO_ART_SIP}
          title={t('SIP connections')}
          lede={t('A SIP connection is the tunnel between your voice stack and the carrier network.')}
          actions={
            <Button size="lg" variant="primary" icon={<Plus />} onClick={() => setCreateOpen(true)}>
              {t('Create your first connection')}
            </Button>
          }
        />
        {/* Ask how calls should arrive before handing anyone a SIP form — most
            people who land here don't actually need a trunk. */}
        <Section className="pt-4">
          <div className="mx-auto max-w-2xl">
            <DestinationPicker
              question="How would you like to receive calls?"
              lede="SIP is one answer, and the right one if you already run a PBX. It isn't the only one."
              exclude={['forward']}
              onSelect={(id) => {
                if (id === 'zoie') {
                  openZoie('voice-agent', zoie)
                  return
                }
                if (id === 'sip') {
                  setCreateOpen(true)
                  return
                }
                if (id === 'webhook') {
                  navigate('/numbers')
                  return
                }
              }}
            />
            <p className="mt-6 text-center text-sm text-ink-faint">
              A SIP connection is the tunnel between your voice stack and the carrier network — we hand you
              credentials and a hostname you can register against in under a minute.{' '}
              <a
                href="https://developers.zoetel.com/sip"
                target="_blank"
                rel="noreferrer"
                className="text-brand-ink hover:underline"
              >
                {t('Read the SIP guide')}
              </a>
            </p>
          </div>
        </Section>
        <CreateConnectionDrawer
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(c) => navigate(`/sip/${c.id}`)}
          regions={REGIONS}
          create={createConnection}
        />
      </>
    )
  }

  return (
    <>
      <Hero
        mood="ledger"
        backdropImage={HERO_ART_SIP}
        title={t('SIP connections')}
        lede={t('{used} of {total} channels in use across {n} connections.', {
          used: usedChannels,
          total: num(totalChannels),
          n: connections.length,
        })}
        actions={
          <Button variant="primary" icon={<Plus />} onClick={() => setCreateOpen(true)}>
            {t('New connection')}
          </Button>
        }
      />

      <div className="space-y-5">
        {/* A problem outranks the numbers that revealed it, so it leads. */}
        {unhealthy.length > 0 && (
          <Alert
            tone="warning"
            title={
              unhealthy.length === 1
                ? t('One connection needs attention')
                : t('{n} connections need attention', { n: unhealthy.length })
            }
          >
            {unhealthy.map((c) => c.name).join(', ')} —{' '}
            {unhealthy[0].status === 'offline'
              ? t('no SIP registration received recently.')
              : t('packet loss above the 0.5% quality threshold.')}
          </Alert>
        )}

        {/* ── Capacity at a glance ─────────────────────── */}
        <Section index={0}>
          <div className="grid gap-y-7 sm:grid-cols-2 sm:divide-x sm:divide-line lg:grid-cols-4">
            <Figure
              icon={Gauge}
              label={t('Channels in use')}
              value={`${usedChannels} / ${num(totalChannels)}`}
              meta={t('{rate} per channel/mo', { rate: money(0.025, currency, { precise: true }) })}
              first
            />
            <Figure
              icon={HeartPulse}
              label={t('Healthy')}
              value={`${connections.length - unhealthy.length} / ${connections.length}`}
              meta={unhealthy.length ? t('{n} need attention', { n: unhealthy.length }) : t('All registered')}
              tone={unhealthy.length ? 'warning' : 'success'}
            />
            <Figure
              icon={Clock}
              label={t('Minutes this month')}
              value={num(totalMinutes)}
              meta={t('Across all trunks')}
            />
            <Figure
              icon={AudioLines}
              label={t('Best quality')}
              value={Math.max(...connections.map((c) => c.health.mos)).toFixed(2)}
              meta={t('MOS, higher is better')}
              tone="success"
            />
          </div>
        </Section>

        {/* ── The connections ──────────────────────────── */}
        <Section
          eyebrow={t('Your trunks')}
          title={t('Connections')}
          divided
          index={1}
          className={cn(
            'transition-[padding] duration-300 ease-out',
            openConn && 'lg:pe-[calc(var(--panel-w)+2rem)]',
          )}
        >
          {/* Column labels once, rather than repeated on every row. */}
          <div
            className={cn(
              'hidden items-center gap-6 border-b border-line pb-2.5 lg:flex lg:gap-8',
              openConn && 'lg:hidden',
            )}
          >
            <span className="eyebrow flex-1">{t('Connection')}</span>
            <span className="eyebrow w-[5.5rem] shrink-0">{t('Channels')}</span>
            <span className="eyebrow w-10 shrink-0">{t('MOS')}</span>
            <span className="eyebrow w-12 shrink-0">{t('ASR')}</span>
            <span className="eyebrow w-16 shrink-0">{t('Latency')}</span>
            <span className="w-4 shrink-0" aria-hidden />
          </div>
          <ul className="divide-y divide-line-soft">
            {connections.map((c, i) => {
              const load = (c.concurrentCalls / c.channelLimit) * 100
              return (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, delay: Math.min(i * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => openPanel(c.id)}
                    aria-expanded={c.id === openId}
                    className={cn(
                      'group -mx-3 flex w-[calc(100%+1.5rem)] flex-col gap-4 rounded-2xl px-3 py-5 text-start transition-colors lg:flex-row lg:items-center lg:gap-6',
                      c.id === openId ? 'bg-veil-strong' : 'hover:bg-veil',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-2xl',
                        c.status === 'active'
                          ? 'bg-success-soft text-success'
                          : c.status === 'degraded'
                            ? 'bg-warning-soft text-warning'
                            : c.status === 'provisioning'
                              ? 'bg-info-soft text-info'
                              : 'bg-veil-strong text-ink-faint',
                      )}
                    >
                      <Cable className="size-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <p className="truncate text-md font-medium text-ink">{c.name}</p>
                        <StatusDot
                          tone={
                            c.status === 'active'
                              ? 'success'
                              : c.status === 'degraded'
                                ? 'warning'
                                : c.status === 'provisioning'
                                  ? 'info'
                                  : 'danger'
                          }
                          pulse={c.status === 'provisioning'}
                        />
                        <span className="text-xs capitalize text-ink-subtle">{t(STATUS_WORD[c.status])}</span>
                        {c.srtp && (
                          <Badge tone="outline" size="sm">
                            <ShieldCheck />
                            {t('SRTP')}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-subtle">
                        <span className="capitalize">
                          {t(AUTH_MODES.find((a) => a.value === c.authMode)?.label ?? '')}
                        </span>
                        <span className="text-ink-faint/60" aria-hidden>
                          ·
                        </span>
                        <span>{c.region}</span>
                        <span className="text-ink-faint/60" aria-hidden>
                          ·
                        </span>
                        <span className="uppercase">{c.transport}</span>
                        <span className="text-ink-faint/60" aria-hidden>
                          ·
                        </span>
                        <span>{t('created {when}', { when: relativeTime(c.createdAt) })}</span>
                      </p>
                    </div>

                    {/* Health, inline instead of a nested metrics grid */}
                    <div className="flex shrink-0 items-center gap-6 text-sm tabular-nums lg:gap-8">
                      <span className="w-[5.5rem] shrink-0">
                        <span className="text-ink">
                          {c.concurrentCalls}
                          <span className="text-ink-faint">/{c.channelLimit}</span>
                        </span>
                        <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-veil-strong">
                          <span
                            className={cn('block h-full rounded-full', load > 85 ? 'bg-warning' : 'bg-brand')}
                            style={{ width: `${Math.min(load, 100)}%` }}
                          />
                        </span>
                      </span>
                      <span
                        className={cn(
                          'hidden w-10 shrink-0 sm:block',
                          openConn && 'sm:hidden',
                          c.health.mos === 0
                            ? 'text-ink-faint'
                            : c.health.mos > 4
                              ? 'text-success-ink'
                              : 'text-warning-ink',
                        )}
                      >
                        {c.health.mos > 0 ? c.health.mos.toFixed(2) : '—'}
                      </span>
                      <span
                        className={cn(
                          'hidden w-12 shrink-0 md:block',
                          openConn && 'md:hidden',
                          c.health.asr === 0
                            ? 'text-ink-faint'
                            : c.health.asr > 65
                              ? 'text-success-ink'
                              : 'text-warning-ink',
                        )}
                      >
                        {c.health.asr > 0 ? `${c.health.asr.toFixed(1)}%` : '—'}
                      </span>
                      <span className={cn('hidden w-16 shrink-0 text-ink lg:block', openConn && 'lg:hidden')}>
                        {c.health.latencyMs > 0 ? `${c.health.latencyMs} ms` : '—'}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </Section>

        {/* ── Endpoints, as a quiet closing note ───────── */}
        <Section eyebrow={t('Connect from anywhere')} title={t('Edge endpoints')} divided index={2}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-lg text-base leading-relaxed text-ink-muted">
              Point your PBX at whichever edge is closest to your users. Both hostnames are anycast, resolve to
              the same connection, and fail over automatically.
            </p>
            <div className="flex flex-wrap gap-2">
              <Mono copy>sip.eg.zoetel.net:5061</Mono>
              <Mono copy>sip.eu.zoetel.net:5061</Mono>
            </div>
          </div>
        </Section>
      </div>

      <SipPanel conn={openConn} onClose={closePanel} />

      <CreateConnectionDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(c) => navigate(`/sip/${c.id}`)}
        regions={REGIONS}
        create={createConnection}
      />
    </>
  )
}

function Figure({
  icon: Icon,
  label,
  value,
  meta,
  tone,
  first,
}: {
  icon: LucideIcon
  label: string
  value: string
  meta: string
  tone?: 'success' | 'warning'
  first?: boolean
}) {
  return (
    <div className={cn('min-w-0 sm:px-6', first && 'sm:ps-0', 'lg:first:ps-0')}>
      {/* The icon labels the metric alongside the eyebrow rather than sitting in
          a tinted chip — a plate per figure would out-shout the numbers. */}
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 shrink-0 text-ink-faint" />
        <p className="eyebrow truncate">{label}</p>
      </div>
      <p
        className={cn(
          'display mt-2.5 truncate text-2xl font-semibold tabular-nums sm:text-3xl',
          tone === 'warning' ? 'text-warning-ink' : 'text-ink',
        )}
      >
        {value}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-subtle">
        {tone && <StatusDot tone={tone} />}
        <span className="truncate">{meta}</span>
      </p>
    </div>
  )
}

function CreateConnectionDrawer({
  open,
  onOpenChange,
  onCreated,
  regions,
  create,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (c: SipConnection) => void
  regions: string[]
  create: (c: Partial<SipConnection> & { name: string }) => SipConnection
}) {
  const { t } = useI18n()
  const [name, setName] = React.useState('')
  const [authMode, setAuthMode] = React.useState<SipAuthMode>('credential')
  const [transport, setTransport] = React.useState<SipTransport>('tls')
  const [srtp, setSrtp] = React.useState(true)
  const [region, setRegion] = React.useState(regions[0])
  const [channels, setChannels] = React.useState(50)
  const [fqdn, setFqdn] = React.useState('')
  const [ip, setIp] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [advanced, setAdvanced] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setName('')
    setAuthMode('credential')
    setTransport('tls')
    setSrtp(true)
    setChannels(50)
    setFqdn('')
    setIp('')
    setAdvanced(false)
  }, [open])

  const valid =
    name.trim().length > 1 &&
    (authMode !== 'fqdn' || fqdn.includes('.')) &&
    (authMode !== 'ip' || ip.length > 6)

  const submit = async () => {
    setSubmitting(true)
    const conn = create({
      name: name.trim(),
      authMode,
      transport,
      srtp,
      region,
      channelLimit: channels,
      fqdn: authMode === 'fqdn' ? fqdn : undefined,
      allowedIps: authMode === 'ip' ? [{ ip, port: 5060, label: t('Primary') }] : [],
    })
    setSubmitting(false)
    onOpenChange(false)
    toast.success('Connection created', { description: t('Provisioning takes a few seconds.') })
    onCreated(conn)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('New SIP connection')}
      description={t('Two decisions now; everything else has a sensible default you can change later.')}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('Cancel')}
          </Button>
          <Button variant="primary" disabled={!valid} loading={submitting} onClick={submit}>
            {t('Create connection')}
          </Button>
        </>
      }
    >
      <div className="space-y-7 pt-1">
        <Field label={t('Name')} required description={t('Shown in routing menus and logs.')}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('e.g. Production Edge')}
            autoFocus
            inputSize="lg"
          />
        </Field>

        <Field label={t("How should we verify it's you?")}>
          <div className="space-y-2">
            {AUTH_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setAuthMode(m.value)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl p-3.5 text-start transition-colors',
                  authMode === m.value
                    ? 'bg-brand-softer ring-1 ring-brand/40'
                    : 'bg-veil hover:bg-veil-strong',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-xl',
                    authMode === m.value ? 'bg-brand text-brand-fg' : 'bg-surface text-ink-muted',
                  )}
                >
                  <m.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-ink">{t(m.label)}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-ink-subtle">{m.blurb}</span>
                </span>
                {authMode === m.value && <Check className="size-4 shrink-0 text-brand" />}
              </button>
            ))}
          </div>
        </Field>

        {authMode === 'fqdn' && (
          <Field label={t('Hostname')} required description={t('We resolve this every 60 seconds.')}>
            <Input value={fqdn} onChange={(e) => setFqdn(e.target.value)} placeholder={'pbx.yourcompany.com'} />
          </Field>
        )}
        {authMode === 'ip' && (
          <Field
            label={t('Allowed IP address')}
            required
            description={t('Add more addresses after creating the connection.')}
          >
            <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="41.33.87.12" />
          </Field>
        )}

        <div className="rule" />

        <button
          onClick={() => setAdvanced((v) => !v)}
          className="flex w-full items-center justify-between text-start"
          aria-expanded={advanced}
        >
          <span>
            <span className="block text-base font-medium text-ink">Transport, encryption and capacity</span>
            <span className="mt-0.5 block text-sm text-ink-subtle">
              TLS with SRTP, {channels} channels, {region.split(' ')[0]}. Sensible for most setups.
            </span>
          </span>
          <span className="ms-4 shrink-0 text-sm font-medium text-brand-ink">
            {advanced ? t('Hide') : t('Change')}
          </span>
        </button>

        {advanced && (
          <div className="space-y-6">
            <Field
              label={t('Transport')}
              description={t('TLS is strongly recommended for anything carrying real traffic.')}
            >
              <ChipGroup
                multiple={false}
                value={[transport]}
                onChange={(v) => v[0] && setTransport(v[0] as SipTransport)}
                options={[
                  { value: 'tls', label: t('TLS') },
                  { value: 'tcp', label: t('TCP') },
                  { value: 'udp', label: t('UDP') },
                ]}
              />
            </Field>
            <div className="flex items-start justify-between gap-5 rounded-2xl bg-veil p-4">
              <div>
                <p className="text-base font-medium text-ink">Encrypt media (SRTP)</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-subtle">
                  Encrypts the audio itself, not just signalling. Adds under 1 ms.
                </p>
              </div>
              <Switch checked={srtp} onCheckedChange={setSrtp} aria-label={t('Encrypt media')} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('Edge region')}>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t('Channel limit')} description={t('Maximum simultaneous calls.')}>
                <NumberInput value={channels} onChange={setChannels} min={1} max={2000} step={10} suffix="ch" />
              </Field>
            </div>
          </div>
        )}

        <Alert tone="brand" compact icon={<TriangleAlert />}>
          Credentials are shown once, right after creation. Store them in your secret manager — we only keep a
          hash.
        </Alert>
      </div>
    </Drawer>
  )
}
