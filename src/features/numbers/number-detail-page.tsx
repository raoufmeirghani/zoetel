import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Network, Phone, PhoneCall, ShieldCheck, Tag, Trash2, TriangleAlert } from 'lucide-react'
import { Hero } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { ConfigTabs } from '@/components/canvas/config-tabs'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/feedback'
import { ConfirmDialog } from '@/components/ui/dialog'
import { CopyButton, Mono } from '@/components/ui/misc'
import { StatusDot } from '@/components/ui/status'
import { Timeline } from '@/components/ui/timeline'
import { CapabilityPills, CountryFlag } from '@/components/shared/capability-pills'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { RenameNumberDrawer, useNumberConfigSections } from './config-drawers'
import { NUMBER_TYPE_META, countryByCode } from '@/lib/data/countries'
import { dateShort, duration, formatE164, money, num, relativeTime } from '@/lib/format'
import { useApp } from '@/store/app'
import type { OwnedNumber } from '@/lib/types'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export default function NumberDetailPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const number = useApp((s) => s.numbers.find((n) => n.id === id))
  const connections = useApp((s) => s.connections)
  const releaseNumber = useApp((s) => s.releaseNumber)
  const calls = useApp((s) => s.calls)
  const currency = useApp((s) => s.workspace.currency)
  const kycStage = useApp((s) => s.verification.stage)

  const [renaming, setRenaming] = React.useState(false)
  const [releasing, setReleasing] = React.useState(false)

  if (!number) {
    return (
      <>
        <Hero
          mood="quiet"
          size="sm"
          title={t('Number not found')}
          lede={t('It may have been released, or the link is stale.')}
        />
        <Section className="pt-4">
          <EmptyState
            icon={<Phone />}
            title={t("That number isn't in this workspace")}
            action={
              <Button variant="primary" asChild>
                <Link to="/numbers">Back to phone numbers</Link>
              </Button>
            }
          />
        </Section>
      </>
    )
  }

  const meta = countryByCode(number.country)
  const connection = connections.find((c) => c.id === number.connectionId)
  const numberCalls = calls.filter((c) => c.from === number.e164 || c.to === number.e164).slice(0, 5)

  return (
    <>
      <Hero
        size="md"
        breadcrumbs={[{ label: t('Phone numbers'), href: '/numbers' }, { label: formatE164(number.e164) }]}
        eyebrow={
          <>
            <StatusDot
              tone={
                number.status === 'active' ? 'success' : number.status === 'suspended' ? 'danger' : 'warning'
              }
              pulse={number.status === 'active'}
            />
            <span className="eyebrow">
              {number.status === 'active' ? 'Live' : number.status.replace(/_/g, ' ')}
            </span>
            <span className="text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="eyebrow">
              {NUMBER_TYPE_META[number.type].label} · {number.city}
            </span>
          </>
        }
        title={number.label ?? formatE164(number.e164)}
        lede={
          number.label
            ? undefined
            : `A ${NUMBER_TYPE_META[number.type].label.toLowerCase()} number in ${number.city}, ${meta.name}.`
        }
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-veil px-3.5 py-2">
              <span className="font-mono text-md tabular-nums text-ink">{formatE164(number.e164)}</span>
              <CopyButton value={number.e164} size="icon-xs" />
            </span>
            <CarrierAvatar carrier={number.carrier} size="sm" showName />
            <CapabilityPills capabilities={number.capabilities} />
            <Button variant="ghost" size="sm" onClick={() => setRenaming(true)} icon={<Tag />}>
              {number.label ? t('Rename') : t('Add a label')}
            </Button>
          </>
        }
      />

      {number.status === 'pending_verification' && (
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-warning-soft p-5 sm:flex-row sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/60 text-warning dark:bg-white/10">
            <TriangleAlert className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-warning-ink">Reserved for you, but not yet routable</p>
            <p className="mt-1 text-sm leading-relaxed text-warning-ink/85">
              {meta.name}'s regulator requires an approved entity for{' '}
              {NUMBER_TYPE_META[number.type].label.toLowerCase()} ranges. We're holding it and you aren't billed
              until it activates.
            </p>
          </div>
          <Button size="sm" variant="primary" asChild className="shrink-0">
            <Link to="/verification">Complete verification</Link>
          </Button>
        </div>
      )}

      <div className="space-y-5">
        {/* ── Configuration, as tabs with the form already open ── */}
        <NumberConfigSection key={number.id} number={number} />

        {/* ── Facts ────────────────────────────────────── */}
        <Section eyebrow={t('Details')} title={t('About this number')} divided index={1}>
          <dl className="grid gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label={t('Carrier')}>
              <CarrierAvatar carrier={number.carrier} size="xs" showName />
            </Fact>
            <Fact label={t('Type')}>{NUMBER_TYPE_META[number.type].label}</Fact>
            <Fact label={t('Country')}>
              <CountryFlag code={number.country} showName />
            </Fact>
            <Fact label={t('Region')}>{number.region}</Fact>
            <Fact label={t('Purchased')}>{dateShort(number.purchasedAt)}</Fact>
            <Fact label={t('Monthly')}>{money(number.monthly, currency)}</Fact>
            <Fact label={t('Compliance')}>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5',
                  number.compliance === 'approved' ? 'text-success-ink' : 'text-ink',
                )}
              >
                {number.compliance === 'approved' && <ShieldCheck className="size-3.5" />}
                {number.compliance === 'not_required'
                  ? 'No documents needed'
                  : number.compliance === 'approved'
                    ? 'Cleared'
                    : kycStage === 'in_review'
                      ? 'In review'
                      : 'Documents needed'}
              </span>
            </Fact>
            <Fact label={t('Resource ID')} wide>
              <Mono copy>{number.id}</Mono>
            </Fact>
          </dl>
        </Section>

        {/* ── Usage lives on its own page ──────────────── */}
        <Section
          eyebrow={t('Traffic')}
          title={t("How it's being used")}
          href="/analytics"
          hrefLabel="Full usage & quality"
          divided
          index={2}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:divide-x sm:divide-line lg:grid-cols-4">
            {[
              { label: t('Minutes'), value: num(number.usage.minutes), meta: 'this month' },
              { label: t('Calls'), value: num(number.usage.calls), meta: 'this month' },
              {
                label: t('Messages'),
                value: number.capabilities.includes('sms') ? num(number.usage.messages) : '—',
                meta: number.capabilities.includes('sms') ? 'this month' : 'not SMS-capable',
              },
              { label: t('Spend'), value: money(number.usage.spend, currency), meta: 'this month' },
            ].map((f, i) => (
              <div key={f.label} className={cn('min-w-0 sm:px-6', i === 0 && 'sm:ps-0', 'lg:first:ps-0')}>
                <p className="eyebrow">{f.label}</p>
                <p className="display mt-2.5 text-2xl font-semibold tabular-nums text-ink">{f.value}</p>
                <p className="mt-1.5 text-sm text-ink-subtle">{f.meta}</p>
              </div>
            ))}
          </div>

          {numberCalls.length > 0 && (
            <ul className="mt-8 divide-y divide-line-soft">
              {numberCalls.map((c) => (
                <li key={c.id} className="flex items-center gap-4 py-3">
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-xl',
                      c.status === 'completed'
                        ? 'bg-success-soft text-success'
                        : 'bg-warning-soft text-warning',
                    )}
                  >
                    <PhoneCall className={cn('size-3.5', c.direction === 'inbound' && 'rotate-180')} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm tabular-nums text-ink">
                      {formatE164(c.direction === 'outbound' ? c.to : c.from)}
                    </p>
                    <p className="text-xs capitalize text-ink-subtle">
                      {c.direction} · {c.connection}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-ink-muted">{duration(c.seconds)}</span>
                  <span
                    className={cn(
                      'hidden w-14 shrink-0 text-end text-sm tabular-nums sm:block',
                      c.mos >= 4 ? 'text-success-ink' : 'text-warning-ink',
                    )}
                  >
                    {c.mos.toFixed(2)}
                  </span>
                  <span className="hidden w-24 shrink-0 text-end text-xs tabular-nums text-ink-faint md:block">
                    {relativeTime(c.startedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ── History ──────────────────────────────────── */}
        <Section eyebrow={t('History')} title={t('What happened to this number')} divided index={3}>
          <Timeline
            dense
            entries={[
              {
                id: 't1',
                title: t('Purchased'),
                detail: `${money(number.monthly + number.setup, currency)} charged to the wallet`,
                at: number.purchasedAt,
                tone: 'brand',
                icon: <Phone />,
              },
              ...(connection
                ? [
                    {
                      id: 't2',
                      title: `Routed to ${connection.name}`,
                      at: new Date(new Date(number.purchasedAt).getTime() + 3_600_000).toISOString(),
                      tone: 'neutral' as const,
                      icon: <Network />,
                    },
                  ]
                : []),
              ...(number.compliance === 'approved'
                ? [
                    {
                      id: 't3',
                      title: t('Compliance cleared'),
                      detail: t('Range authorisation on file'),
                      at: new Date(new Date(number.purchasedAt).getTime() + 86_400_000).toISOString(),
                      tone: 'success' as const,
                      icon: <ShieldCheck />,
                    },
                  ]
                : []),
              ...(number.usage.calls > 0
                ? [
                    {
                      id: 't4',
                      title: t('First call completed'),
                      detail: 'Inbound from +20 111 554 0982',
                      at: new Date(new Date(number.purchasedAt).getTime() + 90_000_000).toISOString(),
                      tone: 'info' as const,
                      icon: <PhoneCall />,
                    },
                  ]
                : []),
            ]}
          />
        </Section>

        {/* ── Danger zone, deliberately understated ────── */}
        <Section divided index={4}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">Releasing</p>
              <p className="mt-2 max-w-lg text-base leading-relaxed text-ink-muted">
                Giving the number back to the carrier is immediate and permanent. Routing, caller ID and
                compliance records go with it.
              </p>
            </div>
            <Button
              variant="destructive-quiet"
              size="sm"
              icon={<Trash2 />}
              onClick={() => setReleasing(true)}
              className="shrink-0"
            >
              {t('Release this number')}
            </Button>
          </div>
        </Section>
      </div>

      {number && <RenameNumberDrawer open={renaming} number={number} onClose={() => setRenaming(false)} />}

      <ConfirmDialog
        open={releasing}
        onOpenChange={setReleasing}
        title={t('Release {number}?', { number: formatE164(number.e164) })}
        description={t('It returns to the carrier pool immediately and cannot be recovered.')}
        confirmLabel={t('Release number')}
        destructive
        icon={<Trash2 />}
        onConfirm={() => {
          releaseNumber(number.id)
          toast.success('Number released')
          navigate('/numbers')
        }}
      />

      {connection && (
        <div className="sr-only">
          Routed to {connection.name}, {connection.region}
        </div>
      )}
    </>
  )
}

function Fact({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-2 lg:col-span-1')}>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 truncate text-base text-ink">{children}</dd>
    </div>
  )
}

/**
 * Its own component so the settings hook can run with a guaranteed number, and
 * so drafts reset when the caller remounts it on a different record.
 */
function NumberConfigSection({ number }: { number: OwnedNumber }) {
  const { t } = useI18n()
  const sections = useNumberConfigSections(number)
  const outstanding = sections.filter((s) => s.state === 'required').length

  return (
    <Section
      eyebrow={outstanding ? `${outstanding} still to set` : 'All configured'}
      title={t('Configuration')}
      lede="Everything is on this screen — pick a heading to edit it."
      action={
        outstanding > 0 ? (
          <Button variant="primary" size="sm" asChild>
            <Link to={`/numbers/${number.id}/setup`}>
              {t('Guided setup')}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        ) : undefined
      }
      index={0}
    >
      <ConfigTabs sections={sections} layoutId="number-config" />
    </Section>
  )
}
