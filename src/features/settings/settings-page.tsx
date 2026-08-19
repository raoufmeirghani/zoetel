import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bell,
  Building2,
  CircleCheck,
  Globe,
  Monitor,
  Moon,
  RotateCcw,
  Save,
  Sun,
  TriangleAlert,
  User,
} from 'lucide-react'
import { Hero, HERO_ART_OVERVIEW } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChipTabs } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/toggle'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Avatar } from '@/components/ui/avatar'
import { Mono } from '@/components/ui/misc'
import { PhoneInput } from '@/components/ui/inputs-special'
import { COUNTRIES, TIMEZONES } from '@/lib/data/countries'
import { useApp, type Theme } from '@/store/app'
import { dateShort, money } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Currency } from '@/lib/types'

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EGP', label: 'Egyptian Pound (EGP)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
]

const NOTIFICATION_GROUPS = [
  {
    label: 'Account & compliance',
    items: [
      {
        id: 'kyc',
        label: 'Verification status changes',
        desc: 'Approved, rejected, or more documents needed',
        email: true,
        inApp: true,
      },
      {
        id: 'compliance',
        label: 'Regulatory document requests',
        desc: 'When a carrier asks for extra paperwork',
        email: true,
        inApp: true,
      },
    ],
  },
  {
    label: 'Billing',
    items: [
      {
        id: 'low',
        label: 'Low wallet balance',
        desc: 'When the balance drops below your threshold',
        email: true,
        inApp: true,
      },
      {
        id: 'payment',
        label: 'Payment failures',
        desc: 'Failed top-ups and auto-recharge retries',
        email: true,
        inApp: true,
      },
      {
        id: 'invoice',
        label: 'New invoices',
        desc: 'Issued at the end of each billing period',
        email: true,
        inApp: false,
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        id: 'numbers',
        label: 'Number purchases and releases',
        desc: 'Any change to your inventory',
        email: false,
        inApp: true,
      },
      {
        id: 'sip',
        label: 'SIP connection health',
        desc: 'Degraded quality or a lost registration',
        email: true,
        inApp: true,
      },
      {
        id: 'webhook',
        label: 'Webhook failures',
        desc: 'Endpoints returning errors repeatedly',
        email: false,
        inApp: true,
      },
    ],
  },
]

type Tab = 'workspace' | 'profile' | 'appearance' | 'notifications'

export default function SettingsPage() {
  const [params, setParams] = useSearchParams()
  const workspace = useApp((s) => s.workspace)
  const profile = useApp((s) => s.profile)
  const updateWorkspace = useApp((s) => s.updateWorkspace)
  const updateProfile = useApp((s) => s.updateProfile)
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  const restartDemo = useApp((s) => s.restartDemo)
  const balance = useApp((s) => s.balance)
  const numbers = useApp((s) => s.numbers)

  const [tab, setTab] = React.useState<Tab>((params.get('tab') as Tab) ?? 'workspace')
  const [resetOpen, setResetOpen] = React.useState(false)
  const [prefs, setPrefs] = React.useState<Record<string, { email: boolean; inApp: boolean }>>(() =>
    Object.fromEntries(
      NOTIFICATION_GROUPS.flatMap((g) => g.items).map((i) => [i.id, { email: i.email, inApp: i.inApp }]),
    ),
  )

  const [ws, setWs] = React.useState({
    name: workspace.name,
    businessName: workspace.businessName,
    country: workspace.country,
    timezone: workspace.timezone,
    currency: workspace.currency,
  })
  const [prof, setProf] = React.useState({ name: profile.name, email: profile.email, country: profile.country })
  const [phone, setPhone] = React.useState('10 2883 4471')

  React.useEffect(() => {
    if (params.get('tab')) {
      setTab(params.get('tab') as Tab)
      setParams(new URLSearchParams(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const wsDirty =
    ws.name !== workspace.name ||
    ws.businessName !== workspace.businessName ||
    ws.country !== workspace.country ||
    ws.timezone !== workspace.timezone ||
    ws.currency !== workspace.currency
  const profDirty =
    prof.name !== profile.name || prof.email !== profile.email || prof.country !== profile.country

  return (
    <>
      <Hero
        backdropImage={HERO_ART_OVERVIEW}
        mood="quiet"
        size="md"
        title="Settings"
        lede="Workspace, profile, appearance and what we send you."
        actions={
          wsDirty && tab === 'workspace' ? (
            <Button
              variant="primary"
              icon={<Save />}
              onClick={() => {
                updateWorkspace(ws)
                toast.success('Workspace updated')
              }}
            >
              Save changes
            </Button>
          ) : profDirty && tab === 'profile' ? (
            <Button
              variant="primary"
              icon={<Save />}
              onClick={() => {
                updateProfile(prof)
                toast.success('Profile updated')
              }}
            >
              Save changes
            </Button>
          ) : undefined
        }
      >
        <ChipTabs
          value={tab}
          onValueChange={setTab}
          layoutId="settings-tabs"
          className="pb-1"
          items={[
            { value: 'workspace', label: 'Workspace', icon: <Building2 /> },
            { value: 'profile', label: 'Profile', icon: <User /> },
            { value: 'appearance', label: 'Appearance', icon: <Sun /> },
            { value: 'notifications', label: 'Notifications', icon: <Bell /> },
          ]}
        />
      </Hero>

      {/* ── Workspace ──────────────────────────────────── */}
      {tab === 'workspace' && (
        <div className="space-y-5">
          <Section eyebrow="Identity" title="General" index={0}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Workspace name" description="Shown in the sidebar and on invoices.">
                <Input
                  value={ws.name}
                  onChange={(e) => setWs({ ...ws, name: e.target.value })}
                  inputSize="lg"
                />
              </Field>
              <Field label="Legal business name" description="Must match your commercial registration.">
                <Input
                  value={ws.businessName}
                  onChange={(e) => setWs({ ...ws, businessName: e.target.value })}
                  inputSize="lg"
                />
              </Field>
            </div>
          </Section>

          <Section
            eyebrow="Locale"
            title="Country, time and money"
            lede="Affects rates, tax treatment and how dates are shown."
            divided
            index={1}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Country" description="Determines the regulator and default rate table.">
                <Select value={ws.country} onValueChange={(v) => setWs({ ...ws, country: v })}>
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.filter((c) => c.live).map((c) => (
                      <SelectItem key={c.code} value={c.code} hint={c.dial}>
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Timezone" description="Used for reports and scheduled exports.">
                <Select value={ws.timezone} onValueChange={(v) => setWs({ ...ws, timezone: v })}>
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Display currency"
                description="Balances are converted for display; billing stays in USD."
              >
                <Select value={ws.currency} onValueChange={(v) => setWs({ ...ws, currency: v as Currency })}>
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {ws.currency !== 'USD' && (
              <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-ink-subtle">
                <Globe className="mt-0.5 size-3.5 shrink-0 text-brand" />
                Amounts are converted at the mid-market rate for display. Your wallet and invoices remain
                denominated in USD unless you ask us to switch to local invoicing.
              </p>
            )}
          </Section>

          <Section eyebrow="Facts" title="This workspace" divided index={2}>
            <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
              <dl className="grid gap-y-4 sm:grid-cols-2">
                <Fact label="Workspace ID">
                  <Mono copy>{workspace.id}</Mono>
                </Fact>
                <Fact label="Created">{dateShort(workspace.createdAt)}</Fact>
                <Fact label="Plan">
                  <Badge tone={workspace.plan === 'volume' ? 'brand' : 'outline'}>
                    {workspace.plan === 'payg' ? 'Pay as you go' : 'Volume'}
                  </Badge>
                </Fact>
                <Fact label="Numbers">{numbers.length}</Fact>
                <Fact label="Balance">{money(balance, ws.currency)}</Fact>
                <Fact label="Data residency">Egypt (eg-cai-1)</Fact>
              </dl>
              <p className="text-sm leading-relaxed text-ink-subtle lg:border-l lg:border-line-soft lg:pl-8">
                Call metadata and recordings for Egyptian numbers stay on infrastructure inside Egypt.
                Enterprise agreements can pin every region explicitly.
              </p>
            </div>
          </Section>

          <Section divided index={3}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="eyebrow">Starting over</p>
                <p className="mt-2 max-w-lg text-base leading-relaxed text-ink-muted">
                  Resetting restores every number, connection, transaction, key and verification state to the
                  original sample data. Your theme preference is kept.
                </p>
              </div>
              <Button
                variant="destructive-quiet"
                size="sm"
                icon={<RotateCcw />}
                onClick={() => setResetOpen(true)}
                className="shrink-0"
              >
                Reset workspace data
              </Button>
            </div>
          </Section>
        </div>
      )}

      {/* ── Profile ────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="space-y-5">
          <Section eyebrow="You" title="Your details" index={0}>
            <div className="flex items-center gap-5">
              <Avatar name={prof.name} hue={profile.avatarHue} size="xl" />
              <div>
                <Button variant="secondary" size="sm">
                  Upload a photo
                </Button>
                <p className="mt-2 text-xs text-ink-faint">JPG or PNG, up to 2 MB.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  value={prof.name}
                  onChange={(e) => setProf({ ...prof, name: e.target.value })}
                  inputSize="lg"
                />
              </Field>
              <Field label="Email address" description="Used for sign-in and every notification.">
                <Input
                  type="email"
                  value={prof.email}
                  onChange={(e) => setProf({ ...prof, email: e.target.value })}
                  inputSize="lg"
                />
              </Field>
              <Field label="Mobile number" description="For verification codes and urgent alerts.">
                <PhoneInput
                  country={prof.country}
                  onCountryChange={(c) => setProf({ ...prof, country: c })}
                  value={phone}
                  onChange={setPhone}
                />
              </Field>
              <Field label="Country of residence">
                <Select value={prof.country} onValueChange={(v) => setProf({ ...prof, country: v })}>
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section eyebrow="Access" title="Password" lede="Last changed 64 days ago." divided index={1}>
            <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
              <Field label="New password">
                <Input type="password" placeholder="••••••••••••" inputSize="lg" />
              </Field>
              <Field label="Confirm new password">
                <Input type="password" placeholder="••••••••••••" inputSize="lg" />
              </Field>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={() => toast.success('Password updated')}
            >
              Update password
            </Button>
          </Section>

          <Section eyebrow="Faster" title="Keyboard shortcuts" divided index={2}>
            <dl className="grid max-w-xl gap-y-2.5 sm:grid-cols-2">
              {[
                { k: '⌘K', l: 'Open the command palette' },
                { k: 'B', l: 'Buy a phone number' },
                { k: 'G', l: 'Go to…' },
                { k: 'Esc', l: 'Close any overlay' },
              ].map((s) => (
                <div key={s.k} className="flex items-center justify-between gap-4 pr-6">
                  <dt className="text-base text-ink-muted">{s.l}</dt>
                  <dd>
                    <kbd className="inline-flex h-5 min-w-6 items-center justify-center rounded-[5px] bg-veil-strong px-1.5 font-sans text-[11px] font-medium text-ink-subtle">
                      {s.k}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        </div>
      )}

      {/* ── Appearance ─────────────────────────────────── */}
      {tab === 'appearance' && (
        <div className="space-y-5">
          <Section eyebrow="Applies to this browser" title="Theme" index={0}>
            <div className="grid gap-4 sm:grid-cols-3 lg:max-w-3xl">
              {[
                { value: 'light' as Theme, label: 'Light', icon: Sun },
                { value: 'dark' as Theme, label: 'Dark', icon: Moon },
                { value: 'system' as Theme, label: 'System', icon: Monitor },
              ].map((t) => {
                const active = theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'group flex flex-col gap-3 rounded-3xl p-3 text-left transition-colors',
                      active ? 'bg-brand-softer ring-1 ring-brand/40' : 'bg-veil hover:bg-veil-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'relative flex h-24 w-full overflow-hidden rounded-2xl',
                        t.value === 'light' && 'bg-[hsl(240_20%_98%)]',
                        t.value === 'dark' && 'bg-[hsl(240_10%_6%)]',
                        t.value === 'system' &&
                          'bg-gradient-to-r from-[hsl(240_20%_98%)] from-50% to-[hsl(240_10%_6%)] to-50%',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute left-2 top-2 h-[calc(100%-1rem)] w-6 rounded-xl',
                          t.value === 'dark' ? 'bg-white/10' : 'bg-black/[0.06]',
                        )}
                      />
                      <span
                        className={cn(
                          'absolute left-10 top-3 h-2.5 w-20 rounded-full',
                          t.value === 'dark' ? 'bg-white/15' : 'bg-black/10',
                        )}
                      />
                      <span
                        className={cn(
                          'absolute left-10 top-8 h-11 w-[calc(100%-3rem)] rounded-xl',
                          t.value === 'dark' ? 'bg-white/[0.07]' : 'bg-white shadow-sm',
                        )}
                      />
                    </span>
                    <span className="flex items-center gap-2">
                      <t.icon className={cn('size-4', active ? 'text-brand' : 'text-ink-faint')} />
                      <span className="text-base font-medium text-ink">{t.label}</span>
                      {active && <CircleCheck className="ml-auto size-4 text-brand" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </Section>

          <Section eyebrow="Fine-tuning" title="Interface" divided index={1}>
            <div className="max-w-2xl divide-y divide-line-soft">
              <ToggleRow
                label="Reduce motion"
                description="Follows your system preference automatically; this forces it on."
                checked={false}
                onChange={() => {}}
              />
              <ToggleRow
                label="Compact lists"
                description="Tighter row height for denser scanning."
                checked={false}
                onChange={() => {}}
              />
              <ToggleRow
                label="Show resource IDs inline"
                description="Surface IDs next to every resource name."
                checked
                onChange={() => {}}
              />
            </div>
          </Section>

          <Section eyebrow="For the curious" title="About this design" divided index={2}>
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
              Every colour here is a token, so dark mode is a palette swap rather than a second design. Metrics
              use tabular figures so digits don't shift as numbers update, headlines are set in Geist so they
              read engineered rather than decorative, and motion is only ever used to show where something came
              from.
            </p>
          </Section>
        </div>
      )}

      {/* ── Notifications ──────────────────────────────── */}
      {tab === 'notifications' && (
        <div className="space-y-5">
          {NOTIFICATION_GROUPS.map((g, gi) => (
            <Section
              key={g.label}
              eyebrow={gi === 0 ? 'What we send you' : undefined}
              title={g.label}
              divided={gi > 0}
              index={gi}
            >
              <div className="max-w-3xl">
                <div className="mb-1 flex items-center justify-end gap-6 pr-1">
                  <span className="eyebrow w-10 text-center">Email</span>
                  <span className="eyebrow w-10 text-center">In-app</span>
                </div>
                <ul className="divide-y divide-line-soft">
                  {g.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-ink">{item.label}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-subtle">{item.desc}</p>
                      </div>
                      <span className="flex w-10 shrink-0 justify-center">
                        <Switch
                          size="sm"
                          checked={prefs[item.id].email}
                          onCheckedChange={(v) =>
                            setPrefs((p) => ({ ...p, [item.id]: { ...p[item.id], email: v } }))
                          }
                          aria-label={`${item.label} email`}
                        />
                      </span>
                      <span className="flex w-10 shrink-0 justify-center">
                        <Switch
                          size="sm"
                          checked={prefs[item.id].inApp}
                          onCheckedChange={(v) =>
                            setPrefs((p) => ({ ...p, [item.id]: { ...p[item.id], inApp: v } }))
                          }
                          aria-label={`${item.label} in-app`}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ))}

          <Section divided index={3}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="eyebrow flex items-center gap-1.5">
                  <TriangleAlert className="size-3" />
                  Always sent
                </p>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  Payment failures and verification rejections are emailed even with notifications off — they
                  can suspend your service if ignored. Everything else is yours to silence.
                </p>
                <p className="mt-3 text-sm text-ink-subtle">
                  Delivered to {profile.email} · daily digest at 09:00 {workspace.timezone.replace(/_/g, ' ')}
                </p>
              </div>
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={() => toast.success('Test notification sent')}
              >
                Send a test notification
              </Button>
            </div>
          </Section>
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset workspace data?"
        description="Every number, SIP connection, transaction, API key and verification state returns to the original sample data. Your theme preference is kept."
        confirmLabel="Reset everything"
        destructive
        icon={<RotateCcw />}
        onConfirm={() => {
          restartDemo()
          setResetOpen(false)
          toast.success('Workspace reset', { description: 'Sample data restored.' })
        }}
      />
    </>
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

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-4">
      <div className="min-w-0">
        <p className="text-base font-medium text-ink">{label}</p>
        {description && <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  )
}
