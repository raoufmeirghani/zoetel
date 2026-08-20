import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Plus, Zap } from 'lucide-react'
import { money } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { useApp } from '@/store/app'
import { Button } from '@/components/ui/button'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { cn } from '@/lib/utils'

/** Days of runway we treat as "comfortable" — the meter's full width. */
const RUNWAY_TARGET = 90

/**
 * The one deliberately elevated object in the product. It earns that because a
 * prepaid balance is the single fact that can stop every service at once.
 *
 * Kept short on purpose: a label row, the figure, one meter that answers "how
 * long have I got", and the two actions. An earlier version stacked two meta
 * lines beside a sparkline, which made the card tall, left dead space under the
 * actions, and turned 14 days of spend into an unreadable scribble.
 */
export function WalletStrip({ className, onTopUp }: { className?: string; onTopUp?: () => void }) {
  const { t, tNode } = useI18n()
  const balance = useApp((s) => s.balance)
  const currency = useApp((s) => s.workspace.currency)
  const autoRecharge = useApp((s) => s.autoRecharge)
  const numbers = useApp((s) => s.numbers)
  const recurring = numbers.reduce((sum, n) => sum + n.monthly, 0)
  const low = balance < autoRecharge.threshold
  const runway = Math.max(0, Math.floor(balance / 18.4))
  const meter = Math.min(runway / RUNWAY_TARGET, 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative w-full overflow-hidden rounded-3xl bg-onyx px-5 py-4 text-onyx-fg shadow-lg sm:w-[20rem]',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute -end-10 -top-16 size-40 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xs font-semibold uppercase tracking-[0.09em] text-white/45">
            {t('Wallet')}
          </span>
          {autoRecharge.enabled && (
            <span className="inline-flex items-center gap-1 text-2xs font-medium text-white/55">
              <Zap className="size-2.5" />
              {t('Auto-recharge')}
            </span>
          )}
        </div>

        <p className="headline mt-2 text-[2rem] leading-none text-white">
          <AnimatedNumber value={balance} format={(n) => money(n, currency)} />
        </p>

        {/* One meter instead of two stacked meta lines — it answers the only
            question a balance raises: how long have I got? */}
        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-white/55">
              {tNode('{n} days of runway', {
                n: <span className="tabular-nums text-white/80">{runway}</span>,
              })}
            </span>
            <span className="tabular-nums text-white/40">
              {t('{amount}/mo', { amount: money(recurring, currency) })}
            </span>
          </div>
          <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.span
              className={cn('block h-full rounded-full', low ? 'bg-warning' : 'bg-brand')}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(meter * 100, 4)}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>
        </div>

        {low && (
          <p className="mt-3 text-xs leading-relaxed text-warning">
            {t('Below your {amount} threshold — calls stop at zero.', {
              amount: money(autoRecharge.threshold, currency),
            })}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5">
          <Button
            size="sm"
            className="bg-white text-onyx shadow-none hover:bg-white/90"
            icon={<Plus />}
            onClick={onTopUp}
          >
            {t('Add funds')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/55 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link to="/billing">
              {t('Billing')}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
