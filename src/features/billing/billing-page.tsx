import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Download,
  EllipsisVertical,
  Plus,
  Receipt,
  Repeat,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Hero, HERO_ART_USAGE } from '@/components/canvas/hero'
import { Section } from '@/components/canvas/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { ChipTabs } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/ui/status'
import { EmptyState } from '@/components/ui/feedback'
import { Switch } from '@/components/ui/toggle'
import { CurrencyInput, SearchInput } from '@/components/ui/inputs-special'
import { Modal, Drawer } from '@/components/ui/dialog'
import { Mono } from '@/components/ui/misc'
import { AreaChart } from '@/components/charts/area-chart'
import { DonutChart } from '@/components/charts/bar-chart'
import { Progress } from '@/components/ui/progress'
import { WalletStrip } from '@/components/shared/wallet-strip'
import { TopUpDialog } from './top-up-dialog'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { useApp } from '@/store/app'
import { monthToDate, usageSeries } from '@/lib/data/seed'
import { dateShort, money, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Invoice, Transaction } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

const KIND_LABEL: Record<Transaction['kind'], string> = {
  topup: 'Top-up',
  usage: 'Usage',
  number: 'Numbers',
  refund: 'Refund',
  adjustment: 'Adjustment',
  commitment: 'Commitment',
}

type Tab = 'overview' | 'transactions' | 'invoices' | 'methods'

export default function BillingPage() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const currency = useApp((s) => s.workspace.currency)
  const plan = useApp((s) => s.workspace.plan)
  const transactions = useApp((s) => s.transactions)
  const invoices = useApp((s) => s.invoices)
  const methods = useApp((s) => s.paymentMethods)
  const autoRecharge = useApp((s) => s.autoRecharge)
  const setAutoRecharge = useApp((s) => s.setAutoRecharge)
  const spendLimit = useApp((s) => s.spendLimit)
  const setSpendLimit = useApp((s) => s.setSpendLimit)
  const setDefaultPaymentMethod = useApp((s) => s.setDefaultPaymentMethod)
  const removePaymentMethod = useApp((s) => s.removePaymentMethod)
  const numbers = useApp((s) => s.numbers)

  const [tab, setTab] = React.useState<Tab>('overview')
  const [topUpOpen, setTopUpOpen] = React.useState(params.get('topup') === '1')
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [txSearch, setTxSearch] = React.useState('')
  const [controlsOpen, setControlsOpen] = React.useState(false)
  const series = React.useMemo(() => usageSeries(30), [])

  React.useEffect(() => {
    if (params.get('topup') === '1') {
      setTopUpOpen(true)
      setParams(new URLSearchParams(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const monthSpend = monthToDate().spend
  const lastMonthSpend =
    usageSeries(90)
      .slice(-60, -30)
      .reduce((s, d) => s + d.spend, 0) || 741.18
  const numbersMonthly = numbers.reduce((s, n) => s + n.monthly, 0)
  const openInvoice = invoices.find((i) => i.status === 'open')
  const delta = ((monthSpend - lastMonthSpend) / lastMonthSpend) * 100

  const breakdown = [
    { label: t('Outbound voice'), value: monthSpend * 0.62, color: 'hsl(var(--brand))' },
    { label: t('Inbound voice'), value: monthSpend * 0.19, color: 'hsl(var(--info))' },
    { label: t('Messaging'), value: monthSpend * 0.11, color: 'hsl(var(--success))' },
    { label: t('Numbers & channels'), value: monthSpend * 0.08, color: 'hsl(var(--warning))' },
  ]

  const filteredTx = transactions.filter(
    (t) =>
      !txSearch ||
      t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
      KIND_LABEL[t.kind].toLowerCase().includes(txSearch.toLowerCase()),
  )

  return (
    <>
      <Hero
        backdropImage={HERO_ART_USAGE}
        mood="ledger"
        size="md"
        title={t('Billing')}
        lede={t('A prepaid wallet, so nothing can run away from you. Usage is drawn down as it happens.')}
        actions={
          <Button variant="ghost" icon={<ShieldCheck />} onClick={() => setControlsOpen(true)}>
            {t('Spend controls')}
          </Button>
        }
      >
        {openInvoice && (
          <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-info-soft p-5 sm:flex-row sm:items-center">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/60 text-info dark:bg-white/10">
              <Receipt className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-info-ink">
                {t('Invoice {number} is open', { number: openInvoice.number })}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-info-ink/85">
                {t('{amount} accrued so far. It settles automatically from your wallet on {date}.', {
                  amount: money(openInvoice.amount, currency),
                  date: dateShort(openInvoice.dueAt),
                })}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setInvoice(openInvoice)} className="shrink-0">
              {t('View invoice')}
            </Button>
          </div>
        )}

        <ChipTabs
          value={tab}
          onValueChange={setTab}
          layoutId="billing-tabs"
          items={[
            { value: 'overview', label: t('Overview') },
            { value: 'transactions', label: t('Transactions'), count: transactions.length },
            { value: 'invoices', label: t('Invoices'), count: invoices.length },
            { value: 'methods', label: t('Payment methods'), count: methods.length },
          ]}
        />
      </Hero>

      {/* ── Overview ───────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <Section index={0}>
              <div className="grid gap-y-7 sm:grid-cols-3 sm:divide-x sm:divide-line">
                <Figure
                  label={t('Spend this month')}
                  value={money(monthSpend, currency)}
                  meta={
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        delta > 0 ? 'text-danger-ink' : 'text-success-ink',
                      )}
                    >
                      <TrendingUp className="size-3.5" />
                      {Math.abs(delta).toFixed(1)}% <span className="text-ink-faint">vs last month</span>
                    </span>
                  }
                  first
                />
                <Figure
                  label={t('Recurring')}
                  value={money(numbersMonthly, currency)}
                  meta={`${numbers.length} numbers · renews on the 1st`}
                />
                <Figure
                  label={t('Effective rate')}
                  value={money(0.0231, currency, { precise: true })}
                  meta={t('per minute, blended across all destinations')}
                />
              </div>
            </Section>
            <WalletStrip onTopUp={() => setTopUpOpen(true)} className="sm:w-full" />
          </div>

          <Section
            eyebrow={t('Last 30 days')}
            title={t('Daily spend')}
            action={
              <Badge tone={plan === 'payg' ? 'outline' : 'brand'}>
                {plan === 'payg' ? t('Pay as you go') : t('Volume pricing')}
              </Badge>
            }
            divided
            index={1}
          >
            <div className="-mx-2">
              <AreaChart
                data={series.map((d) => ({ label: d.label, value: d.spend }))}
                height={220}
                formatValue={(n) => money(n, currency)}
                ariaLabel={t('Daily spend over the last 30 days')}
              />
            </div>
          </Section>

          <Section eyebrow={t('This month')} title={t('Where it goes')} divided index={2}>
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex items-center gap-7">
                <DonutChart
                  segments={breakdown}
                  size={124}
                  thickness={13}
                  center={
                    <>
                      <span className="text-[10px] uppercase tracking-wider text-ink-faint">Total</span>
                      <span className="text-sm font-semibold tabular-nums text-ink">
                        {money(monthSpend, currency, { compact: true })}
                      </span>
                    </>
                  }
                />
                <ul className="min-w-0 flex-1 space-y-2.5">
                  {breakdown.map((b) => (
                    <li key={b.label} className="flex items-center gap-2.5 text-sm">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: b.color }} />
                      <span className="min-w-0 flex-1 truncate text-ink-muted">{b.label}</span>
                      <span className="shrink-0 tabular-nums text-ink">{money(b.value, currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow mb-4">Top cost drivers</p>
                <ul className="space-y-4">
                  {[
                    { label: t('Egypt — mobile'), value: monthSpend * 0.44, sub: '18,420 min' },
                    { label: t('Egypt — landline'), value: monthSpend * 0.24, sub: '9,120 min' },
                    { label: t('UAE — mobile'), value: monthSpend * 0.18, sub: '1,240 min' },
                    { label: t('Saudi Arabia — mobile'), value: monthSpend * 0.14, sub: '880 min' },
                  ].map((d, i) => (
                    <li key={d.label}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-ink">{d.label}</span>
                        <span className="shrink-0 tabular-nums text-ink-muted">{money(d.value, currency)}</span>
                      </div>
                      <Progress value={(d.value / (monthSpend * 0.44)) * 100} size="xs" />
                      <p className="mt-1 text-xs tabular-nums text-ink-faint">{d.sub}</p>
                      {i === 3 && <span className="sr-only">end</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {plan === 'payg' && monthSpend > 250 && (
            <Section divided index={3}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="eyebrow">Worth a look</p>
                  <p className="headline mt-2 text-xl text-ink">
                    You'd save about {money(monthSpend * 0.18, currency)} a month
                  </p>
                  <p className="mt-2 max-w-lg text-base leading-relaxed text-ink-muted">
                    At {money(monthSpend, currency)} of usage you qualify for tier 2 rates. Nothing changes
                    about how the product works.
                  </p>
                </div>
                <Button variant="primary" asChild className="shrink-0">
                  <Link to="/pricing">
                    {t('Compare plans')}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ── Transactions ───────────────────────────────── */}
      {tab === 'transactions' && (
        <Section
          eyebrow={t('Every movement')}
          title={t('Transactions')}
          action={
            <div className="flex items-center gap-2">
              <SearchInput
                value={txSearch}
                onChange={setTxSearch}
                placeholder={t('Search…')}
                size="sm"
                className="w-48"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Download />}
                onClick={() => toast.success('CSV export queued')}
              >
                {t('Export')}
              </Button>
            </div>
          }
        >
          {filteredTx.length === 0 ? (
            <EmptyState
              compact
              icon={<Receipt />}
              title={t('Nothing matches that')}
              description={t('Try a different search.')}
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {filteredTx.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(i * 0.025, 0.22) }}
                  className="flex items-center gap-4 py-4"
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-xl',
                      t.amount > 0 ? 'bg-success-soft text-success' : 'bg-veil-strong text-ink-muted',
                    )}
                  >
                    {t.kind === 'topup' ? (
                      <ArrowDownToLine className="size-4" />
                    ) : t.kind === 'refund' || t.kind === 'adjustment' ? (
                      <Repeat className="size-4" />
                    ) : (
                      <Receipt className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base text-ink">{t.description}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-subtle">
                      {KIND_LABEL[t.kind]}
                      {t.method ? ` · ${t.method}` : ''} · {relativeTime(t.createdAt)}
                    </p>
                  </div>
                  {t.reference && (
                    <span className="hidden shrink-0 lg:block">
                      <Mono copy>{t.reference}</Mono>
                    </span>
                  )}
                  {t.status !== 'succeeded' && <StatusBadge status={t.status} size="sm" />}
                  <span
                    className={cn(
                      'w-24 shrink-0 text-end text-base font-medium tabular-nums',
                      t.amount > 0
                        ? 'text-success-ink'
                        : t.status === 'failed'
                          ? 'text-ink-faint line-through'
                          : 'text-ink',
                    )}
                  >
                    {t.amount > 0 ? '+' : ''}
                    {money(t.amount, currency)}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* ── Invoices ───────────────────────────────────── */}
      {tab === 'invoices' && (
        <Section
          eyebrow={t('Issued monthly')}
          title={t('Invoices')}
          lede="Settled automatically from your wallet. Downloadable as PDF for your accountant."
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={<Download />}
              onClick={() => toast.success('All invoices queued')}
            >
              {t('Download all')}
            </Button>
          }
        >
          <ul className="divide-y divide-line-soft">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <button
                  onClick={() => setInvoice(inv)}
                  className="group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-2xl px-3 py-4 text-start transition-colors hover:bg-veil"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-veil-strong text-ink-muted">
                    <Banknote className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="tnum truncate font-mono text-sm font-medium text-ink">{inv.number}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-subtle">
                      {dateShort(inv.periodStart)} – {dateShort(inv.periodEnd)} · issued{' '}
                      {dateShort(inv.issuedAt)}
                    </p>
                  </div>
                  <StatusBadge status={inv.status} size="sm" />
                  <span className="w-24 shrink-0 text-end text-base font-medium tabular-nums text-ink">
                    {money(inv.amount, currency)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Payment methods ────────────────────────────── */}
      {tab === 'methods' && (
        <div className="space-y-5">
          <Section eyebrow={t('On file')} title={t('Payment methods')} index={0}>
            <ul className="divide-y divide-line-soft">
              {methods.map((m) => (
                <li key={m.id} className="flex items-center gap-4 py-4">
                  <span
                    className={cn(
                      'grid h-9 w-12 shrink-0 place-items-center rounded-xl text-[10px] font-bold uppercase tracking-wide text-white',
                      m.brand === 'visa' && 'bg-[#1a1f71]',
                      m.brand === 'mastercard' && 'bg-[#eb001b]',
                      m.brand === 'amex' && 'bg-[#006fcf]',
                      m.brand === 'meeza' && 'bg-[#8b1a3d]',
                    )}
                  >
                    {m.brand === 'meeza' ? 'Meeza' : m.brand.slice(0, 4)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base text-ink">•••• {m.last4}</p>
                      {m.isDefault && (
                        <Badge tone="brand" size="sm">
                          <Star className="size-2.5" />
                          {t('Default')}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {m.holder} · expires {String(m.expMonth).padStart(2, '0')}/{m.expYear}
                    </p>
                  </div>
                  <Menu>
                    <MenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-ink-faint"
                        aria-label={t('Card actions')}
                      >
                        <EllipsisVertical />
                      </Button>
                    </MenuTrigger>
                    <MenuContent>
                      {!m.isDefault && (
                        <MenuItem
                          onSelect={() => {
                            setDefaultPaymentMethod(m.id)
                            toast.success('Default payment method updated')
                          }}
                        >
                          <Star />
                          {t('Make default')}
                        </MenuItem>
                      )}
                      <MenuItem>
                        <CreditCard />
                        {t('Update expiry')}
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        destructive
                        disabled={m.isDefault}
                        onSelect={() => {
                          removePaymentMethod(m.id)
                          toast.success('Payment method removed')
                        }}
                      >
                        <Trash2 />
                        {t('Remove card')}
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                toast.info('Card entry opens in a secure hosted form', {
                  description: t('Card details never touch Zoetel servers.'),
                })
              }
              className="mt-4 flex w-full items-center gap-4 rounded-3xl border border-dashed border-line-strong p-4 text-start transition-colors hover:border-brand/50 hover:bg-veil"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-veil-strong text-ink-muted">
                <Plus className="size-4" />
              </span>
              <span>
                <span className="block text-base font-medium text-ink">Add a payment method</span>
                <span className="block text-xs text-ink-subtle">Visa, Mastercard, Meeza or bank transfer</span>
              </span>
            </button>
          </Section>

          <Section eyebrow={t('For larger amounts')} title={t('Bank transfer')} divided index={1}>
            <div className="grid gap-8 lg:grid-cols-2">
              <p className="text-base leading-relaxed text-ink-muted">
                Above {money(5000, currency)} a local EGP transfer avoids card fees entirely. Funds land in 1–2
                business days. Always include the reference — it's how we match the transfer to your wallet.
              </p>
              <dl className="divide-y divide-line-soft">
                {[
                  { label: t('Bank'), value: 'CIB Egypt' },
                  { label: t('Account name'), value: 'Zoetel Egypt LLC' },
                ].map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-sm text-ink-subtle">{f.label}</dt>
                    <dd className="text-base text-ink">{f.value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-ink-subtle">Reference</dt>
                  <dd>
                    <Mono copy>WS-ACME-RETAIL</Mono>
                  </dd>
                </div>
              </dl>
            </div>
          </Section>
        </div>
      )}

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />

      {/* ── Spend controls, out of the way until needed ── */}
      <Drawer
        open={controlsOpen}
        onOpenChange={setControlsOpen}
        title={t('Spend controls')}
        description={t('Two settings that stand between a leaked credential and your whole balance.')}
        footer={
          <Button variant="primary" onClick={() => setControlsOpen(false)}>
            {t('Done')}
          </Button>
        }
      >
        <div className="space-y-8 pt-1">
          <div>
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-md font-medium text-ink">
                  <Zap className="size-4 text-brand" />
                  {t('Auto-recharge')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-subtle">
                  {t('Never drop a call because the wallet ran dry.')}
                </p>
              </div>
              <Switch
                checked={autoRecharge.enabled}
                onCheckedChange={(v) => {
                  setAutoRecharge({ enabled: v })
                  toast.success(`Auto-recharge ${v ? 'enabled' : 'disabled'}`)
                }}
                aria-label={t('Auto-recharge')}
              />
            </div>
            <motion.div
              animate={{ opacity: autoRecharge.enabled ? 1 : 0.45 }}
              style={{ pointerEvents: autoRecharge.enabled ? 'auto' : 'none' }}
              className="mt-5 space-y-5"
            >
              <Field label={t('When the balance falls below')}>
                <CurrencyInput
                  value={autoRecharge.threshold}
                  onChange={(v) => setAutoRecharge({ threshold: v })}
                  min={50}
                  max={10000}
                  presets={[100, 250, 500]}
                />
              </Field>
              <Field label={t('Top up by')}>
                <CurrencyInput
                  value={autoRecharge.amount}
                  onChange={(v) => setAutoRecharge({ amount: v })}
                  min={100}
                  max={20000}
                  presets={[250, 500, 1000]}
                />
              </Field>
              <p className="text-xs leading-relaxed text-ink-subtle">
                Charged to {methods.find((m) => m.isDefault)?.brand.toUpperCase()} ••{' '}
                {methods.find((m) => m.isDefault)?.last4}. We retry twice, six hours apart, then email you.
              </p>
            </motion.div>
          </div>

          <div className="rule" />

          <div>
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-md font-medium text-ink">
                  <ShieldCheck className="size-4 text-brand" />
                  {t('Monthly spend limit')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-subtle">
                  A hard ceiling. Toll fraud almost always starts with a compromised credential, and this is
                  what stops it costing you a month's revenue.
                </p>
              </div>
              <Switch
                checked={spendLimit.enabled}
                onCheckedChange={(v) => setSpendLimit({ enabled: v })}
                aria-label={t('Spend limit')}
              />
            </div>
            {spendLimit.enabled && (
              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-baseline justify-between text-sm">
                    <span className="text-ink-muted">Used this month</span>
                    <span className="tabular-nums text-ink">
                      {money(monthSpend, currency)} / {money(spendLimit.monthly, currency)}
                    </span>
                  </div>
                  <Progress
                    value={(monthSpend / spendLimit.monthly) * 100}
                    tone={monthSpend / spendLimit.monthly > 0.8 ? 'warning' : 'brand'}
                    size="sm"
                  />
                </div>
                <Field label={t('Monthly limit')}>
                  <CurrencyInput
                    value={spendLimit.monthly}
                    onChange={(v) => setSpendLimit({ monthly: v })}
                    min={100}
                    max={100000}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <Modal
        open={!!invoice}
        onOpenChange={(v) => !v && setInvoice(null)}
        title={invoice ? `Invoice ${invoice.number}` : ''}
        description={invoice ? `${dateShort(invoice.periodStart)} – ${dateShort(invoice.periodEnd)}` : ''}
        size="lg"
        icon={<Receipt />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setInvoice(null)}>
              {t('Close')}
            </Button>
            <Button
              variant="primary"
              icon={<Download />}
              onClick={() => toast.success('Invoice downloaded', { description: `${invoice?.number}.pdf` })}
            >
              {t('Download PDF')}
            </Button>
          </>
        }
      >
        {invoice && (
          <div>
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Total</p>
                <p className="headline mt-1.5 text-3xl text-ink">{money(invoice.amount, currency)}</p>
              </div>
              <StatusBadge status={invoice.status} size="lg" />
            </div>
            <ul className="mt-7 divide-y divide-line-soft">
              {invoice.lines.map((l) => (
                <li key={l.label} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-base text-ink">{l.label}</p>
                    <p className="text-xs tabular-nums text-ink-subtle">{l.qty}</p>
                  </div>
                  <span className="shrink-0 tabular-nums text-ink">{money(l.amount, currency)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-1.5 text-base">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">{money(invoice.amount / 1.14, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">VAT (14%)</dt>
                <dd className="tabular-nums text-ink">
                  {money(invoice.amount - invoice.amount / 1.14, currency)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-2 font-medium">
                <dt className="text-ink">Total</dt>
                <dd className="tabular-nums text-ink">{money(invoice.amount, currency)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-relaxed text-ink-faint">
              Billed to Acme Retail LLC, Tax ID 442-118-903, New Cairo, Egypt. Settled automatically from your
              wallet on {dateShort(invoice.dueAt)}.
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}

function Figure({
  label,
  value,
  meta,
  first,
}: {
  label: string
  value: string
  meta: React.ReactNode
  first?: boolean
}) {
  return (
    <div className={cn('min-w-0 sm:px-6', first && 'sm:ps-0')}>
      <p className="eyebrow truncate">{label}</p>
      <p className="display mt-2.5 truncate text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
        {value}
      </p>
      <div className="mt-2 text-sm text-ink-subtle">{meta}</div>
    </div>
  )
}
