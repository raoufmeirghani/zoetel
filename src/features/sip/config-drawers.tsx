import * as React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Plus,
  RotateCcw,
  Server,
  Sliders,
  Trash2,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ConfigSection } from '@/components/canvas/config-tabs'
import { Drawer } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/feedback'
import { Switch } from '@/components/ui/toggle'
import { ChipGroup, NumberInput } from '@/components/ui/inputs-special'
import { CopyButton, CodeBlock } from '@/components/ui/misc'
import { StatusDot } from '@/components/ui/status'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/store/app'
import { toast } from '@/components/ui/toast'
import { formatE164, money } from '@/lib/format'
import type { SipConnection } from '@/lib/types'

const CODECS = ['OPUS', 'G722', 'PCMA', 'PCMU', 'G729', 'iLBC']

export type SipConfigKey = 'auth' | 'media' | 'inbound' | 'outbound' | 'capacity' | 'register' | null

/** The five keys that are settings, in the order they're presented. */
const SETTING_KEYS = ['auth', 'media', 'inbound', 'outbound', 'capacity'] as const

/**
 * Builds every SIP setting's form once. Drafts initialise from the connection
 * and are never reset, so callers must mount with `key={conn.id}`.
 */
function useSipConfigMeta(conn: SipConnection, onDone?: () => void) {
  const updateConnection = useApp((s) => s.updateConnection)
  const numbers = useApp((s) => s.numbers)
  const currency = useApp((s) => s.workspace.currency)

  const [showSecret, setShowSecret] = React.useState(false)
  const [codecs, setCodecs] = React.useState(conn.inbound.codecs)
  const [dtmf, setDtmf] = React.useState(conn.inbound.dtmfType)
  const [ani, setAni] = React.useState(conn.inbound.ani)
  const [srtp, setSrtp] = React.useState(conn.srtp)
  const [failover, setFailover] = React.useState(conn.inbound.failoverUri ?? '')
  const [callerId, setCallerId] = React.useState(conn.outbound.callerIdOverride ?? 'none')
  const [localization, setLocalization] = React.useState(conn.outbound.localization)
  const [t38, setT38] = React.useState(conn.outbound.t38)
  const [channels, setChannels] = React.useState(conn.channelLimit)
  const [outChannels, setOutChannels] = React.useState(conn.outbound.channelLimit)

  const done = (message: string) => {
    toast.success(message, { description: 'New calls use this immediately.' })
    onDone?.()
  }

  const meta: Record<
    Exclude<SipConfigKey, null>,
    { title: string; description: string; body: React.ReactNode; onSave?: () => void; saveLabel?: string }
  > = {
    auth: {
      title: 'Authentication',
      description:
        conn.authMode === 'credential'
          ? 'Username and password — works from any IP.'
          : conn.authMode === 'ip'
            ? 'Only calls from these addresses are accepted.'
            : 'A hostname we re-resolve every 60 seconds.',
      body: (
        <div className="space-y-6 pt-1">
          {conn.authMode === 'credential' && (
            <>
              <Field label="SIP username">
                <Input readOnly value={conn.username} trailing={<CopyButton value={conn.username ?? ''} />} />
              </Field>
              <Field
                label="SIP password"
                hint={
                  <button
                    onClick={() => setShowSecret((v) => !v)}
                    className="inline-flex items-center gap-1 text-brand-ink hover:underline"
                  >
                    {showSecret ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    {showSecret ? 'Hide' : 'Reveal'}
                  </button>
                }
              >
                <Input
                  readOnly
                  type={showSecret ? 'text' : 'password'}
                  value={conn.password}
                  className="font-mono"
                  trailing={<CopyButton value={conn.password ?? ''} />}
                />
              </Field>
              <Alert tone="warning" compact>
                Rotating the password invalidates existing registrations immediately. Schedule it for a quiet
                window.
              </Alert>
              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw />}
                onClick={() => toast.success('New password generated')}
              >
                Rotate password
              </Button>
            </>
          )}

          {conn.authMode === 'ip' && (
            <>
              <ul className="divide-y divide-line-soft">
                {conn.allowedIps.map((entry) => (
                  <li key={entry.ip} className="flex items-center gap-3 py-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-veil-strong text-ink-muted">
                      <Server className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm tabular-nums text-ink">
                        {entry.ip}:{entry.port}
                      </p>
                      <p className="text-xs text-ink-subtle">{entry.label}</p>
                    </div>
                    <StatusDot tone="success" />
                    <Button variant="ghost" size="icon-xs" className="text-ink-faint hover:text-danger">
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="sm" icon={<Plus />}>
                Add IP address
              </Button>
            </>
          )}

          {conn.authMode === 'fqdn' && (
            <>
              <Field label="Hostname" description="Every A record it resolves to is trusted.">
                <Input readOnly value={conn.fqdn} trailing={<CopyButton value={conn.fqdn ?? ''} />} />
              </Field>
              <div className="rounded-2xl bg-veil p-4">
                <p className="eyebrow mb-2.5">Currently resolving to</p>
                <div className="flex flex-wrap gap-1.5">
                  {['41.33.87.12', '41.33.87.13'].map((ip) => (
                    <Badge key={ip} tone="outline" className="font-mono tabular-nums">
                      <StatusDot tone="success" />
                      {ip}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="rule" />
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-base font-medium text-ink">Encrypt media (SRTP)</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-subtle">
                Encrypts the audio stream itself, not just signalling.
              </p>
            </div>
            <Switch checked={srtp} onCheckedChange={setSrtp} aria-label="Encrypt media" />
          </div>
        </div>
      ),
      onSave: () => {
        updateConnection(conn.id, { srtp, inbound: { ...conn.inbound, encryptedMedia: srtp } })
        done('Authentication saved')
      },
    },
    media: {
      title: 'Media & codecs',
      description: 'What we negotiate when a call is set up.',
      body: (
        <div className="space-y-6 pt-1">
          <Field label="Codecs" description="Ordered by preference. OPUS gives the best quality per kbit.">
            <ChipGroup
              options={CODECS.map((c) => ({ value: c, label: c }))}
              value={codecs}
              onChange={setCodecs}
            />
          </Field>
          <Field label="DTMF signalling" description="How keypad presses reach your stack.">
            <Select value={dtmf} onValueChange={(v) => setDtmf(v as typeof dtmf)}>
              <SelectTrigger size="lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RFC 2833">RFC 2833 (recommended)</SelectItem>
                <SelectItem value="Inband">Inband</SelectItem>
                <SelectItem value="SIP INFO">SIP INFO</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Caller ID format" description="How the calling number is presented to your PBX.">
            <ChipGroup
              multiple={false}
              value={[ani]}
              onChange={(v) => v[0] && setAni(v[0] as typeof ani)}
              options={[
                { value: 'e164', label: '+20 10 1234 5678' },
                { value: 'national', label: '010 1234 5678' },
              ]}
            />
          </Field>
        </div>
      ),
      onSave: () => {
        updateConnection(conn.id, { inbound: { ...conn.inbound, codecs, dtmfType: dtmf, ani } })
        done('Media settings saved')
      },
    },
    inbound: {
      title: 'Inbound failover',
      description: "Where calls go when your primary endpoint doesn't answer.",
      body: (
        <div className="space-y-6 pt-1">
          <Field label="Failover SIP URI" hint="Optional">
            <Input
              value={failover}
              onChange={(e) => setFailover(e.target.value)}
              placeholder="sip:backup.yourcompany.com:5060"
              inputSize="lg"
            />
          </Field>
          <Alert tone="brand" compact>
            We retry the primary twice with a 2-second timeout before failing over. The whole sequence is billed
            as a single call.
          </Alert>
        </div>
      ),
      onSave: () => {
        updateConnection(conn.id, { inbound: { ...conn.inbound, failoverUri: failover || undefined } })
        done('Failover saved')
      },
    },
    outbound: {
      title: 'Outbound calls',
      description: 'How calls leaving this connection are routed and presented.',
      body: (
        <div className="space-y-6 pt-1">
          <Field label="Localisation" description="Determines which carrier route and rate table applies.">
            <Select value={localization} onValueChange={setLocalization}>
              <SelectTrigger size="lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EG">Egypt</SelectItem>
                <SelectItem value="AE">United Arab Emirates</SelectItem>
                <SelectItem value="SA">Saudi Arabia</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Caller ID override"
            description="Must be a number you own on this workspace, or the call is rejected."
          >
            <Select value={callerId} onValueChange={setCallerId}>
              <SelectTrigger size="lg">
                <SelectValue placeholder="Use the number from the INVITE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Use the number from the INVITE</SelectItem>
                {numbers.map((n) => (
                  <SelectItem key={n.id} value={n.e164} hint={n.label}>
                    {formatE164(n.e164)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-base font-medium text-ink">T.38 fax relay</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-subtle">Required for reliable fax over IP.</p>
            </div>
            <Switch checked={t38} onCheckedChange={setT38} aria-label="T.38 fax relay" />
          </div>
          <div className="rule" />
          <div>
            <p className="eyebrow mb-3">Rates from this connection</p>
            <ul className="divide-y divide-line-soft text-sm">
              {[
                { d: 'Egypt — mobile', r: 0.0142 },
                { d: 'Egypt — landline', r: 0.0062 },
                { d: 'UAE — mobile', r: 0.0396 },
              ].map((x) => (
                <li key={x.d} className="flex items-center justify-between py-2.5">
                  <span className="text-ink-muted">{x.d}</span>
                  <span className="tabular-nums text-ink">{money(x.r, currency, { precise: true })}/min</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
      onSave: () => {
        updateConnection(conn.id, {
          outbound: {
            ...conn.outbound,
            localization,
            callerIdOverride: callerId === 'none' ? undefined : callerId,
            t38,
          },
        })
        done('Outbound settings saved')
      },
    },
    capacity: {
      title: 'Capacity',
      description: 'How many calls this connection may carry at once.',
      body: (
        <div className="space-y-6 pt-1">
          <Field label="Total channel limit" description="Simultaneous calls in either direction.">
            <NumberInput value={channels} onChange={setChannels} min={1} max={2000} step={10} suffix="ch" />
          </Field>
          <Field label="Outbound cap" description="Caps outbound independently, so inbound is never starved.">
            <NumberInput
              value={outChannels}
              onChange={setOutChannels}
              min={0}
              max={channels}
              step={10}
              suffix="ch"
            />
          </Field>
          <Alert tone="brand" compact>
            Channels bill at {money(0.025, currency, { precise: true })} each per month and provision instantly.
            Sizing for your busiest hour plus 20% is a good rule of thumb.
          </Alert>
        </div>
      ),
      onSave: () => {
        updateConnection(conn.id, {
          channelLimit: channels,
          outbound: { ...conn.outbound, channelLimit: Math.min(outChannels, channels) },
        })
        done('Capacity saved')
      },
    },
    register: {
      title: 'Register your PBX',
      description: 'Drop this into your SIP configuration and you should see a 200 OK within seconds.',
      body: (
        <div className="space-y-5 pt-1">
          <CodeBlock
            filename="sip.conf"
            code={`[zoetel]
type = friend
host = sip.eg.zoetel.net
port = 5061
transport = tls
${
  conn.authMode === 'credential'
    ? `username = ${conn.username}\nsecret = ••••••••••••`
    : `; authenticated by ${conn.authMode === 'ip' ? 'source IP' : conn.fqdn}`
}
encryption = ${conn.srtp ? 'yes' : 'no'}
disallow = all
allow = ${conn.inbound.codecs.map((c) => c.toLowerCase()).join(',')}
dtmfmode = ${conn.inbound.dtmfType === 'RFC 2833' ? 'rfc2833' : 'inband'}`}
          />
          <div>
            <p className="eyebrow mb-2.5">Endpoints</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton
                value="sip.eg.zoetel.net:5061"
                showLabel
                label="sip.eg.zoetel.net:5061"
                size="sm"
                variant="secondary"
              />
              <CopyButton
                value="sip.eu.zoetel.net:5061"
                showLabel
                label="sip.eu.zoetel.net:5061"
                size="sm"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      ),
    },
  }

  return meta
}

/**
 * Settings as tab sections. `register` is excluded — it's a read-only
 * how-to-connect guide, not a setting, so it keeps its own sheet.
 */
export function useSipConfigSections(conn: SipConnection): ConfigSection[] {
  const meta = useSipConfigMeta(conn)
  const authIcon = conn.authMode === 'credential' ? Lock : conn.authMode === 'ip' ? Server : Globe

  const descriptors: Record<
    (typeof SETTING_KEYS)[number],
    { icon: LucideIcon; label: string; hint: string; summary?: string; state: ConfigSection['state'] }
  > = {
    auth: {
      icon: authIcon,
      label: 'Authentication',
      hint: 'How we verify traffic is really coming from you.',
      summary:
        conn.authMode === 'credential'
          ? `Credentials · ${conn.username}${conn.srtp ? ' · SRTP' : ''}`
          : conn.authMode === 'ip'
            ? `${conn.allowedIps.length} allowed ${conn.allowedIps.length === 1 ? 'address' : 'addresses'}${conn.srtp ? ' · SRTP' : ''}`
            : `${conn.fqdn}${conn.srtp ? ' · SRTP' : ''}`,
      state: 'set',
    },
    media: {
      icon: Waves,
      label: 'Media & codecs',
      hint: 'What we negotiate when a call is set up.',
      summary: `${conn.inbound.codecs.join(', ')} · ${conn.inbound.dtmfType}`,
      state: 'set',
    },
    inbound: {
      icon: ArrowRight,
      label: 'Inbound failover',
      hint: "Where calls go when your primary endpoint doesn't answer.",
      summary: conn.inbound.failoverUri,
      state: conn.inbound.failoverUri ? 'set' : 'unset',
    },
    outbound: {
      icon: ArrowUpRight,
      label: 'Outbound calls',
      hint: 'Route, caller ID and fax handling for calls you place.',
      summary: `${conn.outbound.localization}${conn.outbound.callerIdOverride ? ` · CLI ${formatE164(conn.outbound.callerIdOverride)}` : ''}${conn.outbound.t38 ? ' · T.38' : ''}`,
      state: 'set',
    },
    capacity: {
      icon: Sliders,
      label: 'Capacity',
      hint: 'How many calls this connection may carry at once.',
      summary: `${conn.channelLimit} channels · ${conn.outbound.channelLimit} outbound`,
      state: 'set',
    },
  }

  return SETTING_KEYS.map((key) => ({ id: key, ...descriptors[key], ...meta[key] }))
}

/** The read-only "how do I point my PBX at this" guide. */
export function SipRegisterDrawer({
  open,
  conn,
  onClose,
}: {
  open: boolean
  conn: SipConnection
  onClose: () => void
}) {
  const meta = useSipConfigMeta(conn, onClose)
  const active = meta.register

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={active.title}
      description={active.description}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Done
        </Button>
      }
    >
      {active.body}
    </Drawer>
  )
}
