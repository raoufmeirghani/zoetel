import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CircleCheck,
  EllipsisVertical,
  FingerprintPattern,
  Key,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Send,
  Smartphone,
  Trash2,
  TriangleAlert,
  UserPlus,
} from 'lucide-react'
import { Hero, HERO_ART_OVERVIEW } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Modal, ConfirmDialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/feedback'
import { StatusBadge, StatusDot } from '@/components/ui/status'
import { ChipTabs } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/toggle'
import { SearchInput } from '@/components/ui/inputs-special'
import { useApp } from '@/store/app'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Member, Role } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

const ROLES: { value: Role; label: string; blurb: string; can: string[] }[] = [
  {
    value: 'owner',
    label: 'Owner',
    blurb: 'Full control, including billing and deleting the workspace.',
    can: ['Everything an admin can do', 'Manage billing and plans', 'Transfer or delete the workspace'],
  },
  {
    value: 'admin',
    label: 'Admin',
    blurb: 'Manage numbers, connections and team — but not billing.',
    can: ['Buy and configure numbers', 'Create SIP connections and API keys', 'Invite and remove members'],
  },
  {
    value: 'developer',
    label: 'Developer',
    blurb: 'Build and ship. No purchasing or team changes.',
    can: ['Create API keys and webhooks', 'Configure existing numbers', 'Read usage and logs'],
  },
  {
    value: 'billing',
    label: 'Billing',
    blurb: 'Finance access only — invoices, wallet and payment methods.',
    can: ['View and download invoices', 'Top up the wallet', 'Manage payment methods'],
  },
  {
    value: 'viewer',
    label: 'Viewer',
    blurb: 'Read-only across the workspace.',
    can: ['View numbers, connections and usage', 'No configuration changes', 'No access to secrets'],
  },
]

const CATEGORY_TONE = {
  auth: 'info',
  numbers: 'brand',
  billing: 'success',
  sip: 'warning',
  team: 'neutral',
  api: 'danger',
} as const

type Tab = 'members' | 'roles' | 'security' | 'audit'

export default function TeamPage() {
  const { t } = useI18n()
  const members = useApp((s) => s.members)
  const audit = useApp((s) => s.audit)
  const inviteMember = useApp((s) => s.inviteMember)
  const updateMember = useApp((s) => s.updateMember)
  const removeMember = useApp((s) => s.removeMember)

  const [tab, setTab] = React.useState<Tab>('members')
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<Role>('developer')
  const [q, setQ] = React.useState('')
  const [requireTwoFactor, setRequireTwoFactor] = React.useState(false)

  const withoutTwoFactor = members.filter((m) => m.status === 'active' && !m.twoFactor)
  const filtered = members.filter(
    (m) =>
      !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.email.toLowerCase().includes(q.toLowerCase()),
  )
  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)

  const invite = () => {
    inviteMember(email.trim(), role)
    setInviteOpen(false)
    setEmail('')
    toast.success('Invitation sent', { description: `${email} will receive an email shortly.` })
  }

  return (
    <>
      <Hero
        backdropImage={HERO_ART_OVERVIEW}
        mood="quiet"
        size="md"
        title={t('Team')}
        lede={t('Invite the people who need access, with the narrowest role that lets them do their job.')}
        actions={
          <Button variant="primary" icon={<UserPlus />} onClick={() => setInviteOpen(true)}>
            {t('Invite member')}
          </Button>
        }
      >
        <ChipTabs
          value={tab}
          onValueChange={setTab}
          layoutId="team-tabs"
          items={[
            { value: 'members', label: t('Members'), count: members.length },
            { value: 'roles', label: t('Roles') },
            { value: 'security', label: t('Security') },
            { value: 'audit', label: t('Audit log'), count: audit.length },
          ]}
        />
      </Hero>

      {tab === 'members' && (
        <Section index={0} className="mb-5">
          <div className="grid grid-cols-3 gap-y-7 sm:divide-x sm:divide-line-soft">
            {[
              {
                label: t('Active'),
                value: String(members.filter((m) => m.status === 'active').length),
              },
              {
                label: t('Invited'),
                value: String(members.filter((m) => m.status === 'invited').length),
              },
              {
                label: t('With 2FA'),
                value: `${members.filter((m) => m.twoFactor).length}/${members.filter((m) => m.status === 'active').length}`,
                tone: withoutTwoFactor.length ? ('warning' as const) : ('success' as const),
              },
            ].map((f, i) => (
              <div key={f.label} className={cn('min-w-0 sm:px-6', i === 0 && 'sm:ps-0', 'sm:last:pe-0')}>
                <p className="eyebrow">{t(f.label)}</p>
                <p
                  className={cn(
                    'display mt-2.5 text-[1.75rem] font-semibold tabular-nums leading-none',
                    f.tone === 'warning'
                      ? 'text-warning-ink'
                      : f.tone === 'success'
                        ? 'text-success-ink'
                        : 'text-ink',
                  )}
                >
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {withoutTwoFactor.length > 0 && tab === 'members' && (
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-warning-soft p-5 sm:flex-row sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/60 text-warning dark:bg-white/10">
            <TriangleAlert className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-warning-ink">
              {withoutTwoFactor.length} teammate{withoutTwoFactor.length === 1 ? '' : 's'} can sign in with a
              password alone
            </p>
            <p className="mt-1 text-sm leading-relaxed text-warning-ink/85">
              {withoutTwoFactor.map((m) => m.name).join(', ')} — one leaked password is all it takes to place
              calls on your wallet.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="shrink-0"
            onClick={() => {
              setRequireTwoFactor(true)
              setTab('security')
              toast.success('Two-factor authentication is now required')
            }}
          >
            {t('Require 2FA')}
          </Button>
        </div>
      )}

      {/* ── Members ────────────────────────────────────── */}
      {tab === 'members' && (
        <Section
          eyebrow={t('Who has access')}
          title={t('Members')}
          action={
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={t('Search members…')}
              size="sm"
              className="w-52"
            />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState
              compact
              icon={<Mail />}
              title={t('Nobody matches that')}
              description={t('Try a different name or email.')}
              action={
                <Button variant="secondary" onClick={() => setQ('')}>
                  {t('Clear search')}
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {filtered.map((m, i) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
                  className="flex items-center gap-4 py-4"
                >
                  <Avatar
                    name={m.name}
                    hue={m.hue}
                    size="lg"
                    status={m.status === 'active' ? 'online' : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-medium text-ink">{m.name}</p>
                      {m.status !== 'active' && <StatusBadge status={m.status} size="sm" />}
                      {!m.twoFactor && m.status === 'active' && (
                        <Badge tone="warning" size="sm">
                          {t('No 2FA')}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-subtle">{m.email}</p>
                  </div>

                  <div className="hidden w-36 shrink-0 md:block">
                    {m.role === 'owner' ? (
                      <Badge tone="brand">Owner</Badge>
                    ) : (
                      <Select value={m.role} onValueChange={(v) => updateMember(m.id, { role: v as Role })}>
                        <SelectTrigger
                          size="sm"
                          className="w-auto min-w-[7.5rem] border-0 bg-transparent shadow-none hover:bg-veil-strong"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-64">
                          {ROLES.filter((x) => x.value !== 'owner').map((x) => (
                            <SelectItem key={x.value} value={x.value}>
                              {t(x.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <span className="hidden w-28 shrink-0 text-end text-xs tabular-nums text-ink-faint lg:block">
                    {m.lastActiveAt ? relativeTime(m.lastActiveAt) : 'never signed in'}
                  </span>

                  <Menu>
                    <MenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-ink-faint"
                        aria-label={t('Actions for {name}', { name: m.name })}
                      >
                        <EllipsisVertical />
                      </Button>
                    </MenuTrigger>
                    <MenuContent>
                      {m.status === 'invited' && (
                        <MenuItem onSelect={() => toast.success('Invitation resent', { description: m.email })}>
                          <Send />
                          {t('Resend invitation')}
                        </MenuItem>
                      )}
                      <MenuLabel>Change role</MenuLabel>
                      <MenuRadioGroup
                        value={m.role}
                        onValueChange={(v) => updateMember(m.id, { role: v as Role })}
                      >
                        {ROLES.filter((x) => x.value !== 'owner').map((x) => (
                          <MenuRadioItem key={x.value} value={x.value} disabled={m.role === 'owner'}>
                            {t(x.label)}
                          </MenuRadioItem>
                        ))}
                      </MenuRadioGroup>
                      <MenuSeparator />
                      <MenuItem
                        disabled={m.role === 'owner'}
                        onSelect={() => {
                          updateMember(m.id, { status: m.status === 'suspended' ? 'active' : 'suspended' })
                          toast.success(m.status === 'suspended' ? 'Access restored' : 'Member suspended')
                        }}
                      >
                        <Lock />
                        {m.status === 'suspended' ? t('Restore access') : t('Suspend access')}
                      </MenuItem>
                      <MenuItem destructive disabled={m.role === 'owner'} onSelect={() => setRemoving(m)}>
                        <Trash2 />
                        {t('Remove from workspace')}
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </motion.li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* ── Roles ──────────────────────────────────────── */}
      {tab === 'roles' && (
        <Section
          eyebrow={t('Permissions')}
          title={t('What each role can do')}
          lede="Pick the narrowest role that lets someone do their job. You can change it any time."
        >
          <div className="divide-y divide-line-soft">
            {ROLES.map((r, i) => (
              <motion.div
                key={r.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="grid gap-4 py-6 sm:grid-cols-[14rem_1fr]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-medium text-ink">{t(r.label)}</h3>
                    <Badge tone="outline" size="sm" className="tabular-nums">
                      {members.filter((m) => m.role === r.value).length}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">{r.blurb}</p>
                </div>
                <ul className="space-y-2">
                  {r.can.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-base leading-relaxed text-ink-muted">
                      <CircleCheck className="mt-1 size-3.5 shrink-0 text-success" />
                      {c}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            <div className="grid gap-4 py-6 sm:grid-cols-[14rem_1fr]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-md font-medium text-ink">Custom roles</h3>
                  <Badge tone="brand" size="sm">
                    {t('Volume plan')}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">
                  Define exactly which resources and actions a role can touch.
                </p>
              </div>
              <div>
                <p className="text-base leading-relaxed text-ink-muted">
                  Scope a role down to individual numbers and connections — useful when a BPO partner handles
                  one line and nothing else. Available on volume and enterprise plans.
                </p>
                <Button variant="secondary" size="sm" className="mt-4">
                  {t('Talk to sales')}
                </Button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Security ───────────────────────────────────── */}
      {tab === 'security' && (
        <div className="space-y-5">
          <Section eyebrow={t('Workspace policy')} title={t('Security')} index={0}>
            <div className="divide-y divide-line-soft">
              <PolicyRow
                label={t('Require two-factor authentication')}
                description={t('Members without 2FA are prompted to enrol at their next sign-in.')}
                checked={requireTwoFactor}
                onChange={(v) => {
                  setRequireTwoFactor(v)
                  toast.success(v ? '2FA is now required' : '2FA requirement removed')
                }}
              />
              <PolicyRow
                label={t('Restrict API keys to admins')}
                description={t("Developers keep using existing keys, but can't create new ones.")}
                checked={false}
                onChange={() => {}}
              />
              <PolicyRow
                label={t('Require approval for purchases')}
                description={t('Numbers over $10 a month need an owner or admin to approve.')}
                checked
                onChange={() => {}}
              />
              <PolicyRow
                label={t('Sign out idle sessions after 12 hours')}
                description={t('Shorter is safer; 12 hours covers a working day.')}
                checked
                onChange={() => {}}
              />
            </div>
          </Section>

          <Section
            eyebrow={t('Sessions')}
            title={t("Where you're signed in")}
            lede="Sign out anything you don't recognise."
            divided
            index={1}
          >
            <ul className="divide-y divide-line-soft">
              {[
                {
                  device: 'MacBook Pro · Chrome',
                  where: 'Cairo, Egypt',
                  ip: '41.33.87.12',
                  current: true,
                  at: 'now',
                  icon: Monitor,
                },
                {
                  device: 'iPhone 16 · Safari',
                  where: 'Cairo, Egypt',
                  ip: '156.160.4.88',
                  current: false,
                  at: '2 hours ago',
                  icon: Smartphone,
                },
                {
                  device: 'Windows · Edge',
                  where: 'Alexandria, Egypt',
                  ip: '156.160.4.201',
                  current: false,
                  at: '3 days ago',
                  icon: Monitor,
                },
              ].map((s) => (
                <li key={s.ip} className="flex items-center gap-4 py-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-veil-strong text-ink-muted">
                    <s.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base text-ink">{s.device}</p>
                      {s.current && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success-ink">
                          <StatusDot tone="success" />
                          {t('This device')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs tabular-nums text-ink-subtle">
                      {s.where} · {s.ip} · {s.at}
                    </p>
                  </div>
                  {!s.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-ink-muted hover:text-danger"
                      icon={<LogOut />}
                      onClick={() => toast.success('Session revoked')}
                    >
                      {t('Revoke')}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Button
              variant="destructive-quiet"
              size="sm"
              className="mt-5"
              onClick={() => toast.success('All other sessions signed out')}
            >
              {t('Sign out all other devices')}
            </Button>
          </Section>

          <Section eyebrow={t('Your account')} title={t('Sign-in methods')} divided index={2}>
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-3 rounded-2xl bg-success-soft p-4">
                  <FingerprintPattern className="size-5 shrink-0 text-success" />
                  <div className="min-w-0">
                    <p className="text-base font-medium text-success-ink">Authenticator app</p>
                    <p className="text-xs text-success-ink/80">Enrolled 64 days ago</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm">
                    {t('Add a passkey')}
                  </Button>
                  <Button variant="ghost" size="sm">
                    {t('View recovery codes')}
                  </Button>
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2.5 flex items-center gap-1.5">
                  <Key className="size-3" />
                  {t('Single sign-on')}
                  <Badge tone="brand" size="sm" className="ms-1">
                    {t('Enterprise')}
                  </Badge>
                </p>
                <p className="text-base leading-relaxed text-ink-muted">
                  Connect Okta, Entra ID or any SAML 2.0 provider. Members are provisioned and de-provisioned
                  automatically via SCIM, and role mapping comes from your directory groups.
                </p>
                <Button variant="secondary" size="sm" className="mt-4">
                  {t('Request SSO setup')}
                </Button>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Audit ──────────────────────────────────────── */}
      {tab === 'audit' && (
        <Section
          eyebrow={t('Retained 12 months')}
          title={t('Audit log')}
          lede="Every configuration change, with actor, IP and timestamp."
          action={
            <Button variant="ghost" size="sm" onClick={() => toast.success('Audit export queued')}>
              {t('Export')}
            </Button>
          }
        >
          <ul className="divide-y divide-line-soft">
            {audit.map((e) => (
              <li key={e.id} className="flex items-center gap-4 py-3.5">
                {e.actor === 'System' ? (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-veil-strong text-ink-muted">
                    <Activity className="size-3.5" />
                  </span>
                ) : (
                  <Avatar
                    name={e.actor}
                    hue={members.find((m) => m.name === e.actor)?.hue ?? 249}
                    size="md"
                    className="shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base text-ink">
                    <span className="font-medium">{e.actor}</span> — {e.action}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-subtle">{e.target}</p>
                </div>
                <Badge
                  tone={CATEGORY_TONE[e.category]}
                  size="sm"
                  className="hidden shrink-0 capitalize sm:inline-flex"
                >
                  {e.category}
                </Badge>
                <span className="hidden w-28 shrink-0 text-end font-mono text-xs tabular-nums text-ink-faint md:block">
                  {e.ip}
                </span>
                <span className="w-24 shrink-0 text-end text-xs tabular-nums text-ink-faint">
                  {relativeTime(e.at)}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title={t('Invite a team member')}
        description={t("They'll get an email with a link that expires in 7 days.")}
        icon={<UserPlus />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" onClick={invite} disabled={!validEmail}>
              {t('Send invitation')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field
            label={t('Email address')}
            required
            error={email && !validEmail ? 'Enter a valid email address' : undefined}
          >
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={'name@company.com'}
              type="email"
              autoFocus
              inputSize="lg"
              leading={<Mail />}
              aria-invalid={!!email && !validEmail}
            />
          </Field>
          <Field label={t('Role')} description={ROLES.find((r) => r.value === role)?.blurb}>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger size="lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.filter((r) => r.value !== 'owner').map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {t(r.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="rounded-2xl bg-veil-strong p-4">
            <p className="eyebrow">A {ROLES.find((r) => r.value === role)?.label} can</p>
            <ul className="mt-2.5 space-y-1.5">
              {ROLES.find((r) => r.value === role)?.can.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
                  <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(v) => !v && setRemoving(null)}
        title={t('Remove {name}?', { name: removing?.name ?? '' })}
        description={t(
          'They lose access immediately and all their sessions are signed out. API keys they created keep working — revoke those separately if needed.',
        )}
        confirmLabel={t('Remove member')}
        destructive
        icon={<Trash2 />}
        onConfirm={() => {
          if (removing) removeMember(removing.id)
          setRemoving(null)
          toast.success('Member removed')
        }}
      >
        {removing && (
          <div className="flex items-center gap-3 rounded-2xl bg-veil-strong p-3.5">
            <Avatar name={removing.name} hue={removing.hue} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-ink">{removing.name}</p>
              <p className="truncate text-xs capitalize text-ink-subtle">
                {removing.role} ·{' '}
                {removing.lastActiveAt ? `active ${relativeTime(removing.lastActiveAt)}` : 'never signed in'}
              </p>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}

function PolicyRow({
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
    <div className="flex items-start justify-between gap-5 py-4">
      <div className="min-w-0">
        <p className="text-base font-medium text-ink">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  )
}
