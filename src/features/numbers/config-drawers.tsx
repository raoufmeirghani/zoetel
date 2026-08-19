import * as React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Network, PhoneForwarded, Settings2, Siren, UserRound, Webhook } from 'lucide-react'
import { Drawer } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/feedback'
import { Switch } from '@/components/ui/toggle'
import { NumberInput } from '@/components/ui/inputs-special'
import { formatE164 } from '@/lib/format'
import type { ConfigSection } from '@/components/canvas/config-tabs'
import { DestinationPicker, type DestinationId } from '@/components/shared/destination-picker'
import { ZoieHandoff } from '@/components/shared/zoie-handoff'
import { useApp } from '@/store/app'
import { toast } from '@/components/ui/toast'
import type { OwnedNumber } from '@/lib/types'
import { cn } from '@/lib/utils'

const WHEN_LABEL: Record<'always' | 'unanswered' | 'unreachable', string> = {
  always: 'always',
  unanswered: 'when unanswered',
  unreachable: 'when unreachable',
}

/**
 * Every setting for a number, as tab sections with their forms already built.
 *
 * Form state is initialised from the number and never reset, so callers must
 * mount the consumer with `key={number.id}` — remounting on identity change is
 * simpler than reconciling drafts against incoming props.
 */
export function useNumberConfigSections(number: OwnedNumber): ConfigSection[] {
  const connections = useApp((s) => s.connections)
  const updateNumber = useApp((s) => s.updateNumber)

  const [connectionId, setConnectionId] = React.useState(number.connectionId ?? 'none')
  const [webhookUrl, setWebhookUrl] = React.useState(number.webhookUrl ?? '')
  const [failover, setFailover] = React.useState(number.webhookFailover ?? '')
  const [callerIdName, setCallerIdName] = React.useState(number.callerIdName ?? '')
  const [address, setAddress] = React.useState(number.emergencyAddress ?? '')

  // Routing starts with the destination question rather than a SIP dropdown, so
  // "an AI agent answers it" is as reachable as "my PBX answers it".
  const [dest, setDest] = React.useState<DestinationId | undefined>(
    number.connectionId ? 'sip' : number.webhookUrl ? 'webhook' : number.forwardTo ? 'forward' : undefined,
  )
  const [forwardTo, setForwardTo] = React.useState(number.forwardTo ?? '')
  const [forwardOn, setForwardOn] = React.useState(!!number.forwardTo)
  const [forwardWhen, setForwardWhen] = React.useState<'always' | 'unanswered' | 'unreachable'>(
    number.forwardWhen ?? 'unanswered',
  )
  const [forwardTimeout, setForwardTimeout] = React.useState(number.forwardTimeout ?? 25)
  const [forwardFallback, setForwardFallback] = React.useState<'voicemail' | 'busy' | 'hangup'>(
    number.forwardFallback ?? 'voicemail',
  )

  const save = (patch: Partial<OwnedNumber>, message: string) => {
    updateNumber(number.id, patch)
    toast.success(message, { description: 'New calls use this immediately.' })
  }

  const connection = connections.find((c) => c.id === number.connectionId)

  return [
    {
      id: 'routing',
      icon: Network,
      label: 'Routing',
      title: 'Where should calls go?',
      description: 'Inbound calls are delivered to a SIP trunk, a webhook, or both.',
      hint: 'Nothing rings until this is set.',
      summary: connection
        ? `${connection.name}${number.webhookUrl ? ` · webhook to ${new URL(number.webhookUrl).host}` : ''}`
        : number.webhookUrl
          ? `Webhook to ${new URL(number.webhookUrl).host}`
          : number.forwardTo
            ? `Forwarding to ${formatE164(number.forwardTo)}`
            : undefined,
      state: connection || number.webhookUrl || number.forwardTo ? 'set' : 'required',
      body: (
        <div className="space-y-8">
          <DestinationPicker value={dest} exclude={['later']} onSelect={setDest} />

          {dest === 'sip' && (
            <div className="space-y-6">
              <div className="rule" />
              <Field
                label="SIP connection"
                description="The trunk that receives the call. This is the fastest path for a PBX or softswitch."
              >
                <Select value={connectionId} onValueChange={setConnectionId}>
                  <SelectTrigger size="lg">
                    <SelectValue placeholder="Not routed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Don't route — reject inbound calls</SelectItem>
                    {connections.map((c) => (
                      <SelectItem key={c.id} value={c.id} hint={c.region}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {connections.length === 0 && (
                <Alert tone="brand" compact icon={<Network />}>
                  <div className="space-y-2">
                    <p>You don't have a SIP connection yet. Create one and it'll appear here.</p>
                    <Button size="xs" variant="secondary" asChild>
                      <Link to="/sip?new=1">Create a connection</Link>
                    </Button>
                  </div>
                </Alert>
              )}
            </div>
          )}

          {dest === 'zoie' && <ZoieHandoff number={number.e164} />}

          {dest === 'forward' && (
            <div className="space-y-6">
              <div className="rule" />
              <Field
                label="Forward to"
                description="Calls are bridged to this number. Your Zoetel number stays the caller ID the recipient sees."
              >
                <Input
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  placeholder="+20 100 000 0000"
                  leading={<PhoneForwarded />}
                  inputSize="lg"
                  className="font-mono"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Ring for" description="How long to try before falling back.">
                  <NumberInput
                    value={forwardTimeout}
                    onChange={setForwardTimeout}
                    min={5}
                    max={120}
                    step={5}
                    suffix="sec"
                  />
                </Field>
                <Field label="If nobody answers" description="What the caller hears instead.">
                  <Select
                    value={forwardFallback}
                    onValueChange={(v) => setForwardFallback(v as typeof forwardFallback)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail" hint="Recorded and emailed">
                        Send to voicemail
                      </SelectItem>
                      <SelectItem value="busy" hint="Caller hears engaged tone">
                        Return busy
                      </SelectItem>
                      <SelectItem value="hangup" hint="Call simply ends">
                        Hang up
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Alert tone="brand" compact>
                Forwarded minutes are billed twice — once inbound to your Zoetel number, once outbound to the
                destination. A SIP connection or an AI agent avoids the second leg.
              </Alert>
            </div>
          )}

          {dest === 'webhook' && (
            <div className="space-y-6">
              <div className="rule" />
              <Field
                label="Voice webhook"
                description="We POST call events here so your app can answer, play audio or bridge. Must reply within 3 seconds."
              >
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.yourapp.com/voice"
                  leading={<Webhook />}
                  inputSize="lg"
                />
              </Field>
              <Field
                label="Failover webhook"
                hint="Optional"
                description="Used only after the primary fails twice."
              >
                <Input
                  value={failover}
                  onChange={(e) => setFailover(e.target.value)}
                  placeholder="https://api-eu.yourapp.com/voice"
                  leading={<Webhook />}
                />
              </Field>
            </div>
          )}
        </div>
      ),
      // Saving commits the chosen destination and clears the others, so a number
      // can never claim to be routed two ways at once.
      onSave:
        dest === 'sip' || dest === 'webhook' || dest === 'forward'
          ? () =>
              save(
                {
                  connectionId: dest === 'sip' && connectionId !== 'none' ? connectionId : undefined,
                  webhookUrl: dest === 'webhook' ? webhookUrl || undefined : undefined,
                  webhookFailover: dest === 'webhook' ? failover || undefined : undefined,
                  // Choosing forwarding here means "forward everything"; the
                  // Forwarding tab is where the conditional modes live.
                  forwardTo: dest === 'forward' ? forwardTo || undefined : number.forwardTo,
                  forwardWhen: dest === 'forward' ? 'always' : number.forwardWhen,
                  forwardTimeout: dest === 'forward' ? forwardTimeout : number.forwardTimeout,
                  forwardFallback: dest === 'forward' ? forwardFallback : number.forwardFallback,
                },
                'Routing saved',
              )
          : undefined,
    },
    {
      id: 'forwarding',
      icon: PhoneForwarded,
      label: 'Forwarding',
      title: 'Forward calls to another number',
      description:
        'Send calls on to a mobile or landline — either instead of your routing, or as a safety net behind it.',
      hint: 'Off. Calls follow your routing only.',
      summary: number.forwardTo
        ? `${formatE164(number.forwardTo)} · ${WHEN_LABEL[number.forwardWhen ?? 'always']}`
        : undefined,
      state: number.forwardTo ? 'set' : 'unset',
      body: (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-base font-medium text-ink">Forward inbound calls</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-subtle">
                Your Zoetel number stays the caller ID the recipient sees.
              </p>
            </div>
            <Switch checked={forwardOn} onCheckedChange={setForwardOn} aria-label="Forward inbound calls" />
          </div>

          {forwardOn && (
            <>
              <div className="rule" />

              <Field label="Forward to">
                <Input
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  placeholder="+20 100 000 0000"
                  leading={<PhoneForwarded />}
                  inputSize="lg"
                  className="font-mono"
                />
              </Field>

              <Field
                label="When"
                description="'Always' replaces your routing. The other two only fire when your primary destination doesn't take the call."
              >
                <Select value={forwardWhen} onValueChange={(v) => setForwardWhen(v as typeof forwardWhen)}>
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always" hint="Instead of routing">
                      Always forward
                    </SelectItem>
                    <SelectItem value="unanswered" hint="Safety net behind routing">
                      Only when nobody answers
                    </SelectItem>
                    <SelectItem value="unreachable" hint="Trunk down or unregistered">
                      Only when the destination is unreachable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Ring for" description="How long to try before falling back.">
                  <NumberInput
                    value={forwardTimeout}
                    onChange={setForwardTimeout}
                    min={5}
                    max={120}
                    step={5}
                    suffix="sec"
                  />
                </Field>
                <Field label="If nobody answers" description="What the caller hears instead.">
                  <Select
                    value={forwardFallback}
                    onValueChange={(v) => setForwardFallback(v as typeof forwardFallback)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail" hint="Recorded and emailed">
                        Send to voicemail
                      </SelectItem>
                      <SelectItem value="busy" hint="Caller hears engaged tone">
                        Return busy
                      </SelectItem>
                      <SelectItem value="hangup" hint="Call simply ends">
                        Hang up
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Alert tone="brand" compact>
                Forwarded minutes are billed twice — once inbound to your Zoetel number, once outbound to the
                destination. A SIP connection or an AI agent avoids the second leg.
              </Alert>
            </>
          )}
        </div>
      ),
      onSave: () =>
        save(
          forwardOn && forwardTo
            ? {
                forwardTo,
                forwardWhen,
                forwardTimeout,
                forwardFallback,
              }
            : { forwardTo: undefined, forwardWhen: undefined },
          forwardOn && forwardTo ? 'Forwarding saved' : 'Forwarding turned off',
        ),
    },
    {
      id: 'callerId',
      icon: UserRound,
      label: 'Caller ID',
      title: 'How should you appear?',
      description: 'Caller ID is what the person you are calling sees before they answer.',
      hint: 'The name people see when you call them.',
      summary: number.callerIdName,
      state: number.callerIdName ? 'set' : 'unset',
      body: (
        <div className="space-y-6">
          <Field
            label="Caller ID name (CNAM)"
            hint={`${callerIdName.length}/15`}
            description="Up to 15 characters. Shown wherever the receiving carrier supports CNAM lookup."
          >
            <Input
              value={callerIdName}
              onChange={(e) => setCallerIdName(e.target.value.slice(0, 15))}
              placeholder="Acme Retail"
              inputSize="lg"
            />
          </Field>

          <div className="rounded-3xl bg-veil p-5">
            <p className="eyebrow mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-ink/5 text-lg">📱</span>
              <div className="min-w-0">
                <p className="truncate text-md font-medium text-ink">{callerIdName || 'Unknown caller'}</p>
                <p className="truncate text-sm tabular-nums text-ink-subtle">{number.e164}</p>
              </div>
            </div>
          </div>

          <Alert tone="brand" compact>
            Names that look like a person rather than a brand get answered less often on business lines. Use the
            trading name your customers recognise.
          </Alert>
        </div>
      ),
      onSave: () =>
        save({ callerIdName: callerIdName || undefined, cnamEnabled: !!callerIdName }, 'Caller ID saved'),
    },
    {
      id: 'emergency',
      icon: MapPin,
      label: 'Emergency',
      title: 'Where is this number located?',
      description: 'Emergency services need a physical address to dispatch to.',
      hint: 'Required before this number can dial 122 or 123.',
      summary: number.emergencyAddress,
      state: number.emergencyAddress ? 'set' : 'required',
      body: (
        <div className="space-y-6">
          <Field
            label="Registered service address"
            description="The building where this number is actually used. NTRA requires it before 122 or 123 can be dialled."
          >
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 Road 90, New Cairo, Cairo"
              leading={<MapPin />}
              inputSize="lg"
            />
          </Field>
          {!address && (
            <Alert tone="warning" compact icon={<Siren />}>
              Without an address, calls to emergency services from this number are rejected outright rather than
              mis-routed. It is the one setting worth doing today.
            </Alert>
          )}
        </div>
      ),
      onSave: () => save({ emergencyAddress: address || undefined }, 'Emergency address saved'),
    },
    {
      id: 'features',
      icon: Settings2,
      label: 'Features',
      title: 'Optional features',
      description:
        'Everything here is off by default, applies the moment you flip it, and is safe to change later.',
      hint: 'Recording, CNAM lookup and messaging.',
      summary:
        [
          number.recordingEnabled && 'Recording on',
          number.cnamEnabled && 'CNAM on',
          number.smsEnabled && 'SMS on',
        ]
          .filter(Boolean)
          .join(' · ') || undefined,
      state: number.recordingEnabled || number.cnamEnabled || number.smsEnabled ? 'set' : 'unset',
      body: (
        <div className="divide-y divide-line-soft">
          <FeatureRow
            label="Call recording"
            description="Stored 30 days, encrypted at rest. Check local consent rules before enabling."
            checked={number.recordingEnabled}
            onChange={(v) => updateNumber(number.id, { recordingEnabled: v })}
          />
          <FeatureRow
            label="CNAM lookup on inbound"
            description="Resolve the caller's registered name where the originating carrier publishes it."
            checked={number.cnamEnabled}
            onChange={(v) => updateNumber(number.id, { cnamEnabled: v })}
          />
          {number.capabilities.includes('sms') && (
            <FeatureRow
              label="SMS"
              description="Send and receive messages on this number."
              checked={number.smsEnabled}
              onChange={(v) => updateNumber(number.id, { smsEnabled: v })}
            />
          )}
        </div>
      ),
    },
  ]
}

/**
 * Renaming is the one number setting that isn't part of the settings surface —
 * it's an identity edit reached from the title, so it keeps its own small sheet.
 */
export function RenameNumberDrawer({
  open,
  number,
  onClose,
}: {
  open: boolean
  number: OwnedNumber
  onClose: () => void
}) {
  const updateNumber = useApp((s) => s.updateNumber)
  const [label, setLabel] = React.useState(number.label ?? '')

  React.useEffect(() => {
    if (open) setLabel(number.label ?? '')
  }, [open, number.label])

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Name this number"
      description="A label your team will recognise faster than eleven digits."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              updateNumber(number.id, { label: label || undefined })
              toast.success('Label saved')
              onClose()
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-6 pt-1">
        <Field label="Label" description="Internal only — customers never see it.">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Support line — Cairo"
            inputSize="lg"
            autoFocus
          />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {['Support line', 'Sales', 'AI agent', 'Hotline', 'Branch office'].map((s) => (
            <button
              key={s}
              onClick={() => setLabel(s)}
              className="rounded-lg bg-veil-strong px-2.5 py-1 text-sm text-ink-muted transition-colors hover:bg-line-soft hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  )
}

function FeatureRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className={cn('flex items-start justify-between gap-5 py-4')}>
      <div className="min-w-0">
        <p className="text-base font-medium text-ink">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  )
}
