import * as React from 'react'
import { motion } from 'framer-motion'
import {
  CircleCheck,
  EllipsisVertical,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Webhook,
} from 'lucide-react'
import { Hero, HERO_ART_SIP } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Modal, ConfirmDialog } from '@/components/ui/dialog'
import { Alert, EmptyState } from '@/components/ui/feedback'
import { StatusDot } from '@/components/ui/status'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { CodeBlock, CopyButton, Mono } from '@/components/ui/misc'
import { ChipGroup } from '@/components/ui/inputs-special'
import { Progress } from '@/components/ui/progress'
import { DevNav } from './dev-nav'
import { useApp } from '@/store/app'
import { compactNum, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { WebhookEndpoint } from '@/lib/types'

const EVENT_GROUPS = [
  {
    label: 'Call lifecycle',
    events: ['call.initiated', 'call.answered', 'call.hangup', 'call.bridged', 'call.recording.saved'],
  },
  {
    label: 'Media & DTMF',
    events: ['call.dtmf.received', 'call.machine.detection.ended', 'streaming.started', 'streaming.stopped'],
  },
  { label: 'Messaging', events: ['message.received', 'message.sent', 'message.finalized'] },
  { label: 'Account', events: ['number.purchased', 'number.released', 'verification.updated', 'balance.low'] },
]

const ALL_EVENTS = EVENT_GROUPS.flatMap((g) => g.events)

export default function WebhooksPage() {
  const webhooks = useApp((s) => s.webhooks)
  const createWebhook = useApp((s) => s.createWebhook)
  const updateWebhook = useApp((s) => s.updateWebhook)
  const deleteWebhook = useApp((s) => s.deleteWebhook)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState<WebhookEndpoint | null>(null)
  const [url, setUrl] = React.useState('')
  const [events, setEvents] = React.useState<string[]>(['call.initiated', 'call.answered', 'call.hangup'])

  const failing = webhooks.filter((w) => w.status === 'failing')
  const totalDeliveries = webhooks.reduce((s, w) => s + w.deliveries24h, 0)
  const validUrl = /^https:\/\/.+\..+/.test(url.trim())

  const submit = () => {
    createWebhook(url.trim(), events)
    setCreateOpen(false)
    setUrl('')
    toast.success('Endpoint created', { description: 'We sent a test event to verify reachability.' })
  }

  return (
    <>
      <Hero
        backdropImage={HERO_ART_SIP}
        mood="code"
        size="md"
        title="Webhooks"
        lede="We POST every event to your endpoints, signed and retried, so you can build reactive voice without polling."
        actions={
          <Button variant="primary" icon={<Plus />} onClick={() => setCreateOpen(true)}>
            Add endpoint
          </Button>
        }
      >
        <DevNav />
      </Hero>

      {/* Delivery health belongs in the page, not floating in the header — a
          fixed-width card up there left a hole beside the title. */}
      {webhooks.length > 0 && (
        <Section index={0} className="mb-5">
          <div className="grid grid-cols-2 gap-y-7 sm:grid-cols-4 sm:divide-x sm:divide-line-soft">
            <div className="min-w-0 sm:pr-6">
              <p className="eyebrow">Deliveries, 24h</p>
              <p className="display mt-2.5 text-[1.75rem] font-semibold tabular-nums leading-none text-ink">
                {compactNum(totalDeliveries)}
              </p>
            </div>
            {[
              { code: '2xx', pct: 99.4, tone: 'success' as const },
              { code: '4xx', pct: 0.3, tone: 'warning' as const },
              { code: '5xx', pct: 0.3, tone: 'danger' as const },
            ].map((r) => (
              <div key={r.code} className="min-w-0 sm:px-6 sm:last:pr-0">
                <p className="eyebrow font-mono">{r.code}</p>
                <p className="display mt-2.5 text-[1.75rem] font-semibold tabular-nums leading-none text-ink">
                  {r.pct}%
                </p>
                <Progress value={r.pct} size="xs" tone={r.tone} className="mt-3" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {failing.length > 0 && (
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-danger-soft p-5 sm:flex-row sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/60 text-danger dark:bg-white/10">
            <TriangleAlert className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-danger-ink">
              {failing.length} endpoint{failing.length === 1 ? '' : 's'} failing
            </p>
            <p className="mt-1 text-sm leading-relaxed text-danger-ink/85">
              {failing[0].url} returned 5xx for {(100 - failing[0].successRate).toFixed(1)}% of deliveries. We
              keep retrying with backoff for one hour, then drop the event and record it in the log.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<RotateCcw />}
            onClick={() => toast.success('Retrying queued deliveries')}
            className="shrink-0"
          >
            Retry queued
          </Button>
        </div>
      )}

      {webhooks.length === 0 ? (
        <Section className="pt-4">
          <EmptyState
            illustration={
              <div className="relative mb-7 grid size-24 place-items-center">
                <span className="bg-brand/8 absolute inset-0 rounded-[32px]" />
                <span className="bg-brand/12 absolute inset-4 rounded-3xl" />
                <Webhook className="relative size-8 text-brand" />
              </div>
            }
            title="No endpoints yet"
            description="Webhooks are how your app learns that a call was answered, a digit was pressed, or a message arrived — in real time, without polling. Add one HTTPS endpoint and pick the events you care about."
            action={
              <Button variant="primary" size="lg" icon={<Plus />} onClick={() => setCreateOpen(true)}>
                Add your first endpoint
              </Button>
            }
          />
        </Section>
      ) : (
        <div className="space-y-5">
          <Section eyebrow="Listening" title="Your endpoints" index={0}>
            <ul className="divide-y divide-line-soft">
              {webhooks.map((w, i) => (
                <motion.li
                  key={w.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: Math.min(i * 0.05, 0.2) }}
                  className="py-5"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-xl',
                        w.status === 'healthy'
                          ? 'bg-success-soft text-success'
                          : w.status === 'failing'
                            ? 'bg-danger-soft text-danger'
                            : 'bg-veil-strong text-ink-faint',
                      )}
                    >
                      <Webhook className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-mono text-sm font-medium text-ink">{w.url}</p>
                        <StatusDot
                          tone={
                            w.status === 'healthy' ? 'success' : w.status === 'failing' ? 'danger' : 'neutral'
                          }
                        />
                        <span className="text-xs capitalize text-ink-subtle">{w.status}</span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-subtle">
                        <span className="tabular-nums">{compactNum(w.deliveries24h)} deliveries / 24h</span>
                        <span className="text-ink-faint/60" aria-hidden>
                          ·
                        </span>
                        <span className="tabular-nums">{w.successRate.toFixed(2)}% success</span>
                        {w.lastDeliveryAt && (
                          <>
                            <span className="text-ink-faint/60" aria-hidden>
                              ·
                            </span>
                            <span>last {relativeTime(w.lastDeliveryAt)}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Send />}
                        onClick={() =>
                          toast.success('Test event sent', {
                            description: `POST call.initiated → ${new URL(w.url).host}`,
                          })
                        }
                      >
                        Test
                      </Button>
                      <Menu>
                        <MenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-ink-faint"
                            aria-label="Endpoint actions"
                          >
                            <EllipsisVertical />
                          </Button>
                        </MenuTrigger>
                        <MenuContent>
                          <MenuItem
                            onSelect={() => {
                              updateWebhook(w.id, { status: w.status === 'paused' ? 'healthy' : 'paused' })
                              toast.success(w.status === 'paused' ? 'Endpoint resumed' : 'Endpoint paused')
                            }}
                          >
                            {w.status === 'paused' ? <Play /> : <Pause />}
                            {w.status === 'paused' ? 'Resume deliveries' : 'Pause deliveries'}
                          </MenuItem>
                          <MenuItem onSelect={() => toast.success('Signing secret rotated')}>
                            <RotateCcw />
                            Rotate signing secret
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem destructive onSelect={() => setDeleting(w)}>
                            <Trash2 />
                            Delete endpoint
                          </MenuItem>
                        </MenuContent>
                      </Menu>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-start justify-between gap-5 pl-0 sm:pl-12">
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow mb-2">Subscribed events</p>
                      <div className="flex flex-wrap gap-1.5">
                        {w.events.map((e) => (
                          <span
                            key={e}
                            className="rounded-lg bg-veil-strong px-1.5 py-0.5 font-mono text-[11px] text-ink-muted"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="w-full sm:w-40">
                      <p className="eyebrow mb-2">Success rate</p>
                      <Progress
                        value={w.successRate}
                        size="sm"
                        tone={w.successRate > 99 ? 'success' : w.successRate > 90 ? 'warning' : 'danger'}
                      />
                      <p className="mt-1.5 text-xs tabular-nums text-ink-subtle">{w.successRate.toFixed(2)}%</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-faint">
                      <span>Secret</span>
                      <Mono copy>{w.secret}</Mono>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Section>

          <Section
            eyebrow="Security"
            title="Verify our signature"
            lede="Reject anything you can't verify, and reject anything older than five minutes to prevent replay."
            divided
            index={1}
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <CodeBlock
                filename="verify.ts"
                code={`import { createHmac, timingSafeEqual } from 'crypto'

export function verify(req: Request, body: string) {
  const sig = req.headers.get('zoetel-signature')!
  const ts = req.headers.get('zoetel-timestamp')!

  const expected = createHmac('sha256', process.env.WHSEC!)
    .update(\`\${ts}.\${body}\`)
    .digest('hex')

  return timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expected),
  )
}`}
              />
              <div>
                <p className="eyebrow mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="size-3" />
                  Retry policy
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Immediate retry, then 5s, 30s, 5m, 30m',
                    'Six attempts over one hour, then dropped',
                    'Failed payloads stay in the log for 7 days',
                    'Endpoints failing for 24h are paused automatically',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-base leading-relaxed text-ink-muted">
                      <CircleCheck className="mt-1 size-3.5 shrink-0 text-success" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm leading-relaxed text-ink-subtle">
                  Respond 2xx within three seconds and do the real work on a queue. A slow endpoint looks the
                  same to us as a broken one.
                </p>
              </div>
            </div>
          </Section>
        </div>
      )}

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a webhook endpoint"
        description="We'll send a test event immediately to confirm it's reachable."
        icon={<Webhook />}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={!validUrl || events.length === 0}>
              Create endpoint
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field
            label="Endpoint URL"
            required
            error={url && !validUrl ? 'Must be a valid HTTPS URL' : undefined}
            description="HTTPS only. Must respond 2xx within 3 seconds."
          >
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourapp.com/webhooks/zoetel"
              autoFocus
              inputSize="lg"
              aria-invalid={!!url && !validUrl}
            />
          </Field>

          <Field label="Events" hint={`${events.length} selected`} required>
            <div className="space-y-3">
              {EVENT_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="eyebrow mb-1.5">{g.label}</p>
                  <ChipGroup
                    size="sm"
                    options={g.events.map((e) => ({ value: e, label: e }))}
                    value={events}
                    onChange={setEvents}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="xs" onClick={() => setEvents(ALL_EVENTS)}>
                Select all
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setEvents([])}>
                Clear
              </Button>
            </div>
          </Field>

          <Alert tone="brand" compact>
            Subscribe only to events you handle. Every delivery counts toward the endpoint's success rate, so
            noisy subscriptions make real failures harder to spot.
          </Alert>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete this endpoint?"
        description="Queued deliveries are discarded and we stop sending events immediately."
        confirmLabel="Delete endpoint"
        destructive
        icon={<Trash2 />}
        onConfirm={() => {
          if (deleting) deleteWebhook(deleting.id)
          setDeleting(null)
          toast.success('Endpoint deleted')
        }}
      >
        {deleting && (
          <div className="flex items-center gap-2 rounded-2xl bg-veil-strong p-3">
            <StatusDot tone={deleting.status === 'healthy' ? 'success' : 'danger'} />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{deleting.url}</span>
            <CopyButton value={deleting.url} />
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}
