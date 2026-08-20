import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  EllipsisVertical,
  Network,
  Phone,
  PhoneForwarded,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Webhook,
} from 'lucide-react'
import { Hero, HERO_ART } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { NumberPanel } from './number-panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/feedback'
import { SearchInput } from '@/components/ui/inputs-special'
import { ChipTabs } from '@/components/ui/tabs'
import { StatusDot } from '@/components/ui/status'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { ConfirmDialog } from '@/components/ui/dialog'
import { CapabilityPills, CountryFlag } from '@/components/shared/capability-pills'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { NUMBER_TYPE_META } from '@/lib/data/countries'
import { formatE164, money, num, relativeTime } from '@/lib/format'
import { useApp } from '@/store/app'
import { isRouted, type OwnedNumber } from '@/lib/types'
import { toast } from '@/components/ui/toast'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

type Tab = 'all' | 'active' | 'pending' | 'unrouted'

export default function NumbersPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const numbers = useApp((s) => s.numbers)
  const connections = useApp((s) => s.connections)
  const releaseNumber = useApp((s) => s.releaseNumber)
  const updateNumber = useApp((s) => s.updateNumber)
  const currency = useApp((s) => s.workspace.currency)

  const [q, setQ] = React.useState('')
  const [tab, setTab] = React.useState<Tab>('all')
  const [releasing, setReleasing] = React.useState<OwnedNumber | null>(null)

  // The open record lives in the URL, so a panel is linkable and the browser's
  // back button closes it — without costing a full page navigation.
  const [params, setParams] = useSearchParams()
  const openId = params.get('n')
  const openNumber = numbers.find((n) => n.id === openId)
  const openPanel = (id: string) => setParams({ n: id }, { replace: false })
  const closePanel = () => setParams({}, { replace: true })

  const counts = {
    all: numbers.length,
    active: numbers.filter((n) => n.status === 'active').length,
    pending: numbers.filter((n) => n.status === 'pending_verification' || n.status === 'porting').length,
    unrouted: numbers.filter((n) => !isRouted(n)).length,
  }

  const rows = React.useMemo(() => {
    let list = numbers
    if (tab === 'active') list = list.filter((n) => n.status === 'active')
    if (tab === 'pending')
      list = list.filter((n) => n.status === 'pending_verification' || n.status === 'porting')
    if (tab === 'unrouted') list = list.filter((n) => !isRouted(n))
    if (q) {
      const needle = q.toLowerCase()
      const digits = q.replace(/\D/g, '')
      list = list.filter(
        (n) =>
          (digits && n.e164.includes(digits)) ||
          n.label?.toLowerCase().includes(needle) ||
          n.city.toLowerCase().includes(needle) ||
          n.tags.some((t) => t.includes(needle)),
      )
    }
    return list
  }, [numbers, tab, q])

  const connName = (id?: string) => connections.find((c) => c.id === id)?.name
  const recurring = numbers.reduce((s, n) => s + n.monthly, 0)

  if (numbers.length === 0) {
    return (
      <>
        <Hero
          backdropImage={HERO_ART}
          backdropOpacity={0.85}
          title={t('Phone numbers')}
          lede={t("A number is how the world reaches you. You don't have one yet.")}
          actions={
            <Button size="lg" variant="primary" asChild>
              <Link to="/numbers/buy">
                {t('Buy your first number')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <Section className="pt-4">
          <EmptyState
            illustration={
              <div className="relative mb-7 grid size-24 place-items-center">
                <span className="bg-brand/8 absolute inset-0 rounded-[32px]" />
                <span className="bg-brand/12 absolute inset-4 rounded-3xl" />
                <Phone className="relative size-8 text-brand" />
              </div>
            }
            title={t("Nothing here yet — and that's the fun part")}
            description={t(
              'Pick a local Cairo line for support, a mobile range for SMS, or a toll-free hotline for national campaigns. Local numbers are live seconds after checkout.',
            )}
            action={
              <Button variant="primary" size="lg" asChild>
                <Link to="/numbers/buy">Browse the marketplace</Link>
              </Button>
            }
            secondaryAction={
              <Button variant="ghost" size="lg">
                {t('Port a number in')}
              </Button>
            }
          />
        </Section>
      </>
    )
  }

  return (
    <>
      <Hero
        backdropImage={HERO_ART}
        backdropOpacity={0.85}
        title={t('Phone numbers')}
        lede={t('{active} active across {total} numbers, {spend} a month.', {
          active: counts.active,
          total: numbers.length,
          spend: money(recurring, currency),
        })}
        actions={
          <>
            <Button variant="primary" asChild icon={<Plus />}>
              <Link to="/numbers/buy">
                <Plus className="size-4" />
                {t('Buy a number')}
              </Link>
            </Button>
            <Button
              variant="ghost"
              icon={<Download />}
              onClick={() =>
                toast.success('Export queued', { description: t('A CSV will land in your inbox shortly.') })
              }
            >
              {t('Export')}
            </Button>
          </>
        }
      />

      {/* The list yields room to the panel rather than sitting underneath it.
          The padding wraps the card — inside it the card would stretch under the
          panel and only its contents would move. */}
      <div
        className={cn(
          'transition-[padding] duration-300 ease-out',
          openNumber && 'lg:pe-[calc(var(--panel-w)+2rem)]',
        )}
      >
        <Section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ChipTabs
              value={tab}
              onValueChange={setTab}
              layoutId="numbers-tabs"
              items={[
                { value: 'all', label: t('All'), count: counts.all },
                { value: 'active', label: t('Active'), count: counts.active },
                { value: 'pending', label: t('Pending'), count: counts.pending },
                { value: 'unrouted', label: t('Not routed'), count: counts.unrouted },
              ]}
            />
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={t('Search numbers, labels or tags…')}
              size="sm"
              className="sm:max-w-64"
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              compact
              icon={<Phone />}
              title={t('Nothing matches that')}
              description={t('Try a different status or clear the search.')}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQ('')
                    setTab('all')
                  }}
                >
                  {t('Clear filters')}
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {rows.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.035, 0.24), ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    className={cn(
                      'group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-4 transition-colors',
                      n.id === openId ? 'bg-veil-strong' : 'hover:bg-veil',
                    )}
                  >
                    <CarrierAvatar carrier={n.carrier} size="md" />

                    <button
                      type="button"
                      onClick={() => openPanel(n.id)}
                      aria-expanded={n.id === openId}
                      className="min-w-0 flex-1 text-start"
                    >
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <p className="truncate text-base font-medium text-ink">
                          {n.label ?? formatE164(n.e164)}
                        </p>
                        {n.status === 'active' ? (
                          <StatusDot tone="success" />
                        ) : n.status === 'pending_verification' ? (
                          <Tooltip content="Reserved but not routable until verification clears">
                            <Badge tone="warning" size="sm">
                              <TriangleAlert />
                              {t('Held')}
                            </Badge>
                          </Tooltip>
                        ) : (
                          <Badge tone="neutral" size="sm" className="capitalize">
                            {n.status.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-subtle">
                        {n.label && <span className="font-mono tabular-nums">{formatE164(n.e164)}</span>}
                        {n.label && (
                          <span className="text-ink-faint/60" aria-hidden>
                            ·
                          </span>
                        )}
                        <CountryFlag code={n.country} />
                        <span>{NUMBER_TYPE_META[n.type].label}</span>
                        <span className="text-ink-faint/60" aria-hidden>
                          ·
                        </span>
                        <span className="truncate">{n.city}</span>
                      </p>
                    </button>

                    <CapabilityPills
                      capabilities={n.capabilities}
                      size="sm"
                      className={cn('hidden shrink-0 lg:flex', openNumber && 'lg:hidden')}
                    />

                    <div className={cn('hidden w-44 shrink-0 md:block', openNumber && 'md:hidden')}>
                      {n.connectionId ? (
                        <Link
                          to={`/sip/${n.connectionId}`}
                          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-ink"
                        >
                          <Network className="size-3.5 text-ink-faint" />
                          <span className="truncate">{connName(n.connectionId)}</span>
                        </Link>
                      ) : n.forwardTo && (n.forwardWhen ?? 'always') === 'always' ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                          <PhoneForwarded className="size-3.5 shrink-0 text-ink-faint" />
                          <span className="truncate tabular-nums">{formatE164(n.forwardTo)}</span>
                        </span>
                      ) : n.webhookUrl ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                          <Webhook className="size-3.5 shrink-0 text-ink-faint" />
                          <span className="truncate">{new URL(n.webhookUrl).host}</span>
                        </span>
                      ) : (
                        <Link
                          to={`/numbers/${n.id}/setup`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-warning-ink hover:underline"
                        >
                          {t('Not routed')}
                          <ArrowRight className="size-3" />
                        </Link>
                      )}
                    </div>

                    {/* Beside an open panel the list is an index, not a report —
                      the secondary columns only return once there's real room. */}
                    <div className={cn('hidden w-24 shrink-0 text-end sm:block', openNumber && 'sm:hidden')}>
                      <p className="text-sm tabular-nums text-ink">{num(n.usage.minutes)} min</p>
                      <p className="mt-0.5 text-xs tabular-nums text-ink-faint">
                        {money(n.monthly, currency)}/mo
                      </p>
                    </div>

                    <Menu>
                      <MenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className={cn(
                            'shrink-0 text-ink-faint opacity-60 transition-opacity group-hover:opacity-100',
                          )}
                          aria-label={`Actions for ${n.e164}`}
                        >
                          <EllipsisVertical />
                        </Button>
                      </MenuTrigger>
                      <MenuContent>
                        <MenuItem onSelect={() => openPanel(n.id)}>
                          <Settings2 />
                          {t('Settings')}
                        </MenuItem>
                        <MenuItem onSelect={() => navigate(`/numbers/${n.id}`)}>
                          <ArrowUpRight />
                          {t('Full details')}
                        </MenuItem>
                        <MenuItem onSelect={() => navigate(`/numbers/${n.id}/setup`)}>
                          <Network />
                          {t('Guided setup')}
                        </MenuItem>
                        <MenuItem
                          onSelect={() => {
                            updateNumber(n.id, { recordingEnabled: !n.recordingEnabled })
                            toast.success(`Recording ${n.recordingEnabled ? 'disabled' : 'enabled'}`, {
                              description: formatE164(n.e164),
                            })
                          }}
                        >
                          <Phone />
                          {n.recordingEnabled ? t('Disable recording') : t('Enable recording')}
                        </MenuItem>
                        {n.compliance === 'required' && (
                          <MenuItem onSelect={() => navigate('/verification')}>
                            <ShieldCheck />
                            {t('Submit documents')}
                          </MenuItem>
                        )}
                        <MenuSeparator />
                        <MenuItem destructive onSelect={() => setReleasing(n)}>
                          <Trash2 />
                          {t('Release number')}
                        </MenuItem>
                      </MenuContent>
                    </Menu>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <NumberPanel number={openNumber} onClose={closePanel} />

      <ConfirmDialog
        open={!!releasing}
        onOpenChange={(v) => !v && setReleasing(null)}
        title={t('Release {number}?', { number: releasing ? formatE164(releasing.e164) : '' })}
        description={t(
          'The number returns to the carrier pool immediately and cannot be recovered. Routing, caller ID and compliance records attached to it are deleted.',
        )}
        confirmLabel={t('Release number')}
        destructive
        icon={<Trash2 />}
        onConfirm={() => {
          if (releasing) {
            releaseNumber(releasing.id)
            toast.success('Number released', { description: formatE164(releasing.e164) })
          }
          setReleasing(null)
        }}
      >
        {releasing && (
          <dl className="divide-y divide-line-soft text-sm">
            <div className="flex justify-between py-2">
              <dt className="text-ink-muted">{t('Active since')}</dt>
              <dd className="text-ink">{relativeTime(releasing.purchasedAt)}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-ink-muted">{t('Lifetime minutes')}</dt>
              <dd className="tabular-nums text-ink">{num(releasing.usage.minutes)}</dd>
            </div>
          </dl>
        )}
      </ConfirmDialog>
    </>
  )
}
