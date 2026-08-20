import * as React from 'react'
import { motion } from 'framer-motion'
import { Building2, CircleCheck, CreditCard, Sparkles, Zap } from 'lucide-react'
import { Modal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/inputs-special'
import { Field } from '@/components/ui/label'
import { Alert } from '@/components/ui/feedback'
import { Switch } from '@/components/ui/toggle'
import { useApp } from '@/store/app'
import { money } from '@/lib/format'
import { cn, sleep } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { useI18n } from '@/lib/i18n'

const PRESETS = [100, 250, 500, 1000, 2500]

export function TopUpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n()
  const currency = useApp((s) => s.workspace.currency)
  const balance = useApp((s) => s.balance)
  const methods = useApp((s) => s.paymentMethods)
  const autoRecharge = useApp((s) => s.autoRecharge)
  const setAutoRecharge = useApp((s) => s.setAutoRecharge)
  const topUp = useApp((s) => s.topUp)

  const [amount, setAmount] = React.useState(500)
  const [methodId, setMethodId] = React.useState(methods.find((m) => m.isDefault)?.id ?? methods[0]?.id)
  const [state, setState] = React.useState<'form' | 'processing' | 'done'>('form')

  React.useEffect(() => {
    if (open) {
      setState('form')
      setAmount(500)
    }
  }, [open])

  const method = methods.find((m) => m.id === methodId)
  const vat = amount * 0.14
  const total = amount + vat

  const submit = async () => {
    setState('processing')
    await sleep(1400)
    topUp(amount, method ? `${method.brand.toUpperCase()} •• ${method.last4}` : 'Bank transfer')
    setState('done')
    await sleep(1500)
    onOpenChange(false)
    toast.success('Wallet funded', { description: `${money(amount, currency)} is available immediately.` })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={state === 'done' ? undefined : 'Add funds'}
      description={
        state === 'done' ? undefined : 'Funds are available instantly. Usage is billed against your wallet.'
      }
      size="md"
      icon={state === 'done' ? undefined : <Zap />}
      footer={
        state === 'form' ? (
          <>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" onClick={submit} disabled={amount <= 0}>
              Pay {money(total, currency)}
            </Button>
          </>
        ) : undefined
      }
    >
      {state === 'done' ? (
        <div className="flex flex-col items-center py-4 text-center">
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="grid size-16 place-items-center rounded-3xl bg-success-soft text-success"
          >
            <CircleCheck className="size-7" />
          </motion.span>
          <h3 className="headline mt-5 text-2xl text-ink">Wallet funded</h3>
          <p className="mt-1 text-base text-ink-muted">
            New balance{' '}
            <span className="font-semibold tabular-nums text-ink">
              <AnimatedNumber value={balance} format={(n) => money(n, currency)} />
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <Field label={t('Amount')} hint={`Balance ${money(balance, currency)}`}>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              size="lg"
              min={10}
              max={100000}
              presets={PRESETS}
              suffix={currency}
            />
          </Field>

          <Field label={t('Payment method')}>
            <div className="space-y-1.5">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethodId(m.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-colors duration-150',
                    methodId === m.id ? 'bg-brand-softer ring-1 ring-brand/40' : 'veil hover:bg-veil-strong',
                  )}
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-surface-3">
                    <CreditCard className="size-4 text-ink-muted" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium capitalize text-ink">
                      {m.brand} •••• {m.last4}
                    </span>
                    <span className="block text-xs text-ink-subtle">
                      Expires {String(m.expMonth).padStart(2, '0')}/{m.expYear}
                    </span>
                  </span>
                  {methodId === m.id && <CircleCheck className="size-4 shrink-0 text-brand" />}
                </button>
              ))}
              <button className="veil flex w-full items-center gap-3 rounded-2xl p-3 text-start text-ink-muted transition-colors hover:bg-veil-strong">
                <span className="grid size-8 place-items-center rounded-lg bg-surface-3">
                  <Building2 className="size-4" />
                </span>
                <span className="text-base font-medium">Bank transfer (EGP)</span>
                <span className="ms-auto text-xs text-ink-faint">1–2 business days</span>
              </button>
            </div>
          </Field>

          <div className="rounded-2xl bg-veil-strong p-3.5">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Credit</dt>
                <dd className="tabular-nums text-ink">{money(amount, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">VAT (14%)</dt>
                <dd className="tabular-nums text-ink">{money(vat, currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
                <dt className="text-ink">Total charged</dt>
                <dd className="tabular-nums text-ink">{money(total, currency)}</dd>
              </div>
            </dl>
          </div>

          {!autoRecharge.enabled && (
            <Alert tone="brand" compact icon={<Sparkles />}>
              <div className="flex items-start justify-between gap-3">
                <span>
                  Turn on auto-recharge so calls never drop when the balance runs low. We'll add{' '}
                  {money(autoRecharge.amount, currency)} whenever you fall below{' '}
                  {money(autoRecharge.threshold, currency)}.
                </span>
                <Switch
                  checked={autoRecharge.enabled}
                  onCheckedChange={(v) => setAutoRecharge({ enabled: v })}
                  aria-label={t('Enable auto-recharge')}
                />
              </div>
            </Alert>
          )}

          {state === 'processing' && (
            <p className="text-center text-sm text-ink-subtle">Authorising with your bank…</p>
          )}
        </div>
      )}
    </Modal>
  )
}
