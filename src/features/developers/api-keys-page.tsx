import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  BookOpen,
  CircleCheck,
  Copy,
  EllipsisVertical,
  Eye,
  EyeOff,
  Key,
  Plus,
  RotateCcw,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from 'lucide-react'
import { Hero, HERO_ART_SIP } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Modal, ConfirmDialog } from '@/components/ui/dialog'
import { Alert, EmptyState } from '@/components/ui/feedback'
import { StatusDot } from '@/components/ui/status'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { CodeBlock, CopyButton, Mono } from '@/components/ui/misc'
import { ChipGroup } from '@/components/ui/inputs-special'
import { Segmented } from '@/components/ui/toggle'
import { Sparkline } from '@/components/charts/bar-chart'
import { DevNav } from './dev-nav'
import { useApp } from '@/store/app'
import { compactNum, dateShort, relativeTime } from '@/lib/format'
import { copyText, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { ApiKey } from '@/lib/types'
import { usageSeries } from '@/lib/data/seed'

const SCOPES = [
  { value: 'full', label: 'Full access', hint: 'Every endpoint' },
  { value: 'voice', label: 'Voice only', hint: 'Calls and streams' },
  { value: 'numbers', label: 'Numbers only', hint: 'Search and order' },
  { value: 'read', label: 'Read only', hint: 'No mutations' },
]

export default function ApiKeysPage() {
  const [params, setParams] = useSearchParams()
  const apiKeys = useApp((s) => s.apiKeys)
  const createApiKey = useApp((s) => s.createApiKey)
  const revokeApiKey = useApp((s) => s.revokeApiKey)

  const [createOpen, setCreateOpen] = React.useState(params.get('new') === '1')
  const [created, setCreated] = React.useState<ApiKey | null>(null)
  const [revoking, setRevoking] = React.useState<ApiKey | null>(null)
  const [revealed, setRevealed] = React.useState<string[]>([])
  const [name, setName] = React.useState('')
  const [scope, setScope] = React.useState<ApiKey['scope']>('full')
  const [env, setEnv] = React.useState<ApiKey['environment']>('live')
  const series = React.useMemo(() => usageSeries(14), [])

  React.useEffect(() => {
    if (params.get('new') === '1') {
      setCreateOpen(true)
      setParams(new URLSearchParams(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const active = apiKeys.filter((k) => k.status === 'active')
  const totalRequests = apiKeys.reduce((s, k) => s + k.requests7d, 0)

  const submit = () => {
    const key = createApiKey(name.trim() || 'Untitled key', scope, env)
    setCreateOpen(false)
    setCreated(key)
    setName('')
    setScope('full')
  }

  return (
    <>
      <Hero
        backdropImage={HERO_ART_SIP}
        mood="code"
        size="md"
        title="Developers"
        lede="Authenticate every request with a bearer token. Keys are scoped, revocable, and never shown twice."
        actions={
          <>
            <Button variant="primary" icon={<Plus />} onClick={() => setCreateOpen(true)}>
              Create key
            </Button>
            <Button variant="ghost" icon={<BookOpen />} asChild>
              <a href="https://developers.zoetel.com" target="_blank" rel="noreferrer">
                API reference
              </a>
            </Button>
          </>
        }
      >
        <DevNav />
      </Hero>

      {apiKeys.length > 0 && (
        <Section index={0} className="mb-5">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">Requests, last 7 days</p>
              <p className="display mt-2.5 text-[1.75rem] font-semibold tabular-nums leading-none text-ink">
                {compactNum(totalRequests)}
              </p>
              <Link
                to="/developers/logs"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:underline"
              >
                Inspect the log
              </Link>
            </div>
            <Sparkline
              values={series.map((d) => d.apiRequests)}
              width={320}
              height={48}
              className="w-full shrink-0 sm:w-80"
            />
          </div>
        </Section>
      )}

      {apiKeys.length === 0 ? (
        <Section className="pt-4">
          <EmptyState
            illustration={
              <div className="relative mb-7 grid size-24 place-items-center">
                <span className="bg-brand/8 absolute inset-0 rounded-[32px]" />
                <span className="bg-brand/12 absolute inset-4 rounded-3xl" />
                <Key className="relative size-8 text-brand" />
              </div>
            }
            title="No API keys yet"
            description="A key lets your code do everything this interface can — search numbers, place calls, stream audio, read usage. Create one per service so you can rotate a single credential without touching the rest."
            action={
              <Button variant="primary" size="lg" icon={<Plus />} onClick={() => setCreateOpen(true)}>
                Generate your first key
              </Button>
            }
            secondaryAction={
              <Button variant="ghost" size="lg" asChild>
                <a href="https://developers.zoetel.com/quickstart" target="_blank" rel="noreferrer">
                  Read the quickstart
                </a>
              </Button>
            }
          />
        </Section>
      ) : (
        <div className="space-y-5">
          <Section eyebrow="Credentials" title="Your keys" index={0}>
            <ul className="divide-y divide-line-soft">
              {apiKeys.map((k, i) => (
                <motion.li
                  key={k.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
                  className={cn('flex items-center gap-4 py-4', k.status === 'revoked' && 'opacity-55')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-medium text-ink">{k.name}</p>
                      <Badge tone={k.environment === 'live' ? 'brand' : 'outline'} size="sm">
                        {k.environment}
                      </Badge>
                      {k.status === 'revoked' ? (
                        <Badge tone="danger" size="sm">
                          Revoked
                        </Badge>
                      ) : (
                        <StatusDot tone="success" />
                      )}
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5">
                      <code className="min-w-0 truncate font-mono text-[11.5px] text-ink-subtle">
                        {revealed.includes(k.id) ? k.token : `${k.token.slice(0, 12)}${'•'.repeat(8)}`}
                      </code>
                      <button
                        onClick={() =>
                          setRevealed((v) => (v.includes(k.id) ? v.filter((x) => x !== k.id) : [...v, k.id]))
                        }
                        className="shrink-0 text-ink-faint transition-colors hover:text-ink"
                        aria-label={revealed.includes(k.id) ? 'Hide key' : 'Reveal key'}
                      >
                        {revealed.includes(k.id) ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      </button>
                      <CopyButton value={k.token} />
                    </div>
                  </div>

                  <Badge tone="outline" size="sm" className="hidden shrink-0 sm:inline-flex">
                    {SCOPES.find((s) => s.value === k.scope)?.label ?? k.scope}
                  </Badge>

                  <div className="hidden w-28 shrink-0 items-center justify-end gap-2.5 md:flex">
                    {k.requests7d > 0 && (
                      <Sparkline
                        values={series.slice(-10).map((d) => d.apiRequests)}
                        width={44}
                        height={18}
                        fill={false}
                        tone="ink"
                        className="opacity-50"
                      />
                    )}
                    <span className="text-sm tabular-nums text-ink">
                      {k.requests7d ? compactNum(k.requests7d) : '—'}
                    </span>
                  </div>

                  <span className="hidden w-24 shrink-0 text-right text-xs tabular-nums text-ink-faint lg:block">
                    {k.lastUsedAt ? relativeTime(k.lastUsedAt) : 'never used'}
                  </span>

                  <Menu>
                    <MenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-ink-faint"
                        aria-label={`Actions for ${k.name}`}
                      >
                        <EllipsisVertical />
                      </Button>
                    </MenuTrigger>
                    <MenuContent>
                      <MenuItem
                        onSelect={async () => {
                          await copyText(k.token)
                          toast.success('Key copied to clipboard')
                        }}
                      >
                        <Copy />
                        Copy key
                      </MenuItem>
                      <MenuItem disabled={k.status === 'revoked'}>
                        <RotateCcw />
                        Rotate key
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem destructive disabled={k.status === 'revoked'} onSelect={() => setRevoking(k)}>
                        <TriangleAlert />
                        Revoke key
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </motion.li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-faint">
              Created {apiKeys[0] ? dateShort(apiKeys[0].createdAt) : ''} onward · requests shown for the last 7
              days
            </p>
          </Section>

          <Section
            eyebrow="Get going"
            title="Your first call"
            lede="Everything you need in one request."
            divided
            index={1}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <CodeBlock
                filename="place-a-call.sh"
                code={`curl -X POST https://api.zoetel.com/v2/calls \\
  -H "Authorization: Bearer ${active[0]?.token.slice(0, 18) ?? 'ztl_live_xxx'}…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+201115540982",
    "from": "+20224618890",
    "connection_id": "sip_prod_edge",
    "webhook_url": "https://api.yourapp.com/voice"
  }'`}
              />
              <CodeBlock
                filename="stream-audio.ts"
                code={`import Zoetel from '@zoetel/node'

const zoetel = new Zoetel({ apiKey: process.env.ZOETEL_API_KEY })

const call = await zoetel.calls.create({
  to: '+201115540982',
  from: '+20224618890',
  connectionId: 'sip_prod_edge',
  media: { stream: 'wss://agent.yourapp.com/audio', codec: 'opus' },
})

await zoetel.calls.answer(call.id)`}
              />
            </div>
          </Section>

          <Section eyebrow="Guardrails" title="Limits and hygiene" divided index={2}>
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="eyebrow mb-3 flex items-center gap-1.5">
                  <Activity className="size-3" />
                  Rate limits, per key
                </p>
                <dl className="divide-y divide-line-soft">
                  {[
                    { label: 'REST requests', value: '1,000 / min' },
                    { label: 'Call creation', value: '100 / sec' },
                    { label: 'Concurrent streams', value: '500' },
                    { label: 'Webhook retries', value: '5 over 1 hour' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-base text-ink-muted">{l.label}</dt>
                      <dd className="tabular-nums text-ink">{l.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                  Exceeding a limit returns 429 with a <Mono>Retry-After</Mono> header. Limits are raised on
                  request for volume plans.
                </p>
              </div>
              <div>
                <p className="eyebrow mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="size-3" />
                  Keeping keys safe
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Store keys in a secret manager, never in source control',
                    'One key per service, so you can rotate independently',
                    'Prefer read-only scopes for analytics and reporting jobs',
                    'Revoke immediately if a key appears in a log or a commit',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-base leading-relaxed text-ink-muted">
                      <CircleCheck className="mt-1 size-3.5 shrink-0 text-success" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <p className="eyebrow mb-2.5 flex items-center gap-1.5">
                    <Terminal className="size-3" />
                    SDKs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['@zoetel/node', 'zoetel-python', 'zoetel-go', 'Zoetel.NET'].map((s) => (
                      <a
                        key={s}
                        href="https://developers.zoetel.com/sdks"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-veil-strong px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors hover:text-ink"
                      >
                        {s}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create an API key"
        description="Scope it as tightly as the job allows — you can always create another."
        icon={<Key />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={name.trim().length < 2}>
              Create key
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Name" required description="Name it after the service that will use it.">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Billing worker"
              autoFocus
              inputSize="lg"
            />
          </Field>
          <Field label="Environment">
            <Segmented
              value={env}
              onChange={(v: string) => setEnv(v as ApiKey['environment'])}
              options={[
                { value: 'live', label: 'Live' },
                { value: 'test', label: 'Test' },
              ]}
            />
            <p className="mt-1.5 text-xs text-ink-subtle">
              {env === 'live'
                ? 'Live keys place real calls and spend from your wallet.'
                : 'Test keys simulate calls end to end without spending or dialling out.'}
            </p>
          </Field>
          <Field label="Scope">
            <ChipGroup
              multiple={false}
              value={[scope]}
              onChange={(v) => v[0] && setScope(v[0] as ApiKey['scope'])}
              options={SCOPES.map((s) => ({ value: s.value, label: s.label }))}
            />
            <p className="mt-1.5 text-xs text-ink-subtle">{SCOPES.find((s) => s.value === scope)?.hint}</p>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!created}
        onOpenChange={(v) => !v && setCreated(null)}
        title="Your new API key"
        description="This is the only time the full key is shown. Copy it into your secret manager now."
        icon={<CircleCheck />}
        tone="success"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setCreated(null)}>
            I've saved it
          </Button>
        }
      >
        {created && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-2xl bg-veil-strong p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] text-ink">{created.token}</code>
              <CopyButton value={created.token} showLabel size="sm" variant="secondary" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{created.environment}</Badge>
              <Badge tone="outline">{SCOPES.find((s) => s.value === created.scope)?.label}</Badge>
              <Badge tone="outline">{created.name}</Badge>
            </div>
            <Alert tone="warning" compact>
              We store only a hash of this key. If you lose it you'll need to create a new one — there's no
              recovery.
            </Alert>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!revoking}
        onOpenChange={(v) => !v && setRevoking(null)}
        title={`Revoke ${revoking?.name}?`}
        description="Requests using this key start failing with 401 immediately. Calls already in flight continue to completion."
        confirmLabel="Revoke key"
        destructive
        icon={<TriangleAlert />}
        onConfirm={() => {
          if (revoking) revokeApiKey(revoking.id)
          setRevoking(null)
          toast.success('Key revoked')
        }}
      />
    </>
  )
}
