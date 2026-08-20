import * as React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV } from './nav-config'
import { Logo } from './logo'
import { Tooltip } from '@/components/ui/tooltip'
import { useApp, selActiveCount } from '@/store/app'
import { useJourney } from '@/lib/journey'
import { Badge } from '@/components/ui/badge'
import { money } from '@/lib/format'
import { useDirSign, useI18n } from '@/lib/i18n'

const EASE = [0.16, 1, 0.3, 1] as const

function useNavSignals() {
  const activeCount = useApp(selActiveCount)
  const pending = useApp((s) => s.numbers.filter((n) => n.status === 'pending_verification').length)
  const stage = useApp((s) => s.verification.stage)
  const { attention } = useJourney()

  return React.useMemo(() => {
    const bySection: Record<string, { dot?: 'danger' | 'warning'; count?: number; label?: string }> = {}
    if (pending > 0) bySection['/numbers'] = { count: pending, dot: 'warning' }
    else if (activeCount > 0) bySection['/numbers'] = { count: activeCount }
    if (stage !== 'approved') {
      bySection['/verification'] =
        stage === 'rejected' ? { dot: 'danger', label: 'Action' } : { dot: 'warning', label: 'Required' }
    }
    const sip = attention.find((a) => a.id === 'sip-health')
    if (sip) bySection['/sip'] = { dot: sip.severity === 'critical' ? 'danger' : 'warning' }
    const hook = attention.find((a) => a.id === 'webhook')
    if (hook) bySection['/developers/webhooks'] = { dot: 'warning' }
    return bySection
  }, [activeCount, pending, stage, attention])
}

/**
 * Navigation only. Global actions live in the floating chrome, so nothing here
 * competes with the destinations. Expanding overlays the canvas rather than
 * pushing it, so opening the nav costs nothing in layout.
 */
export function Rail() {
  const dirSign = useDirSign()
  // The rail sits on the leading edge, so its tooltips open toward the canvas.
  const { rtl, t } = useI18n()
  // Pinned lives in the store so the content column can yield room for it.
  const pinned = useApp((s) => s.navPinned)
  const setPinned = useApp((s) => s.setNavPinned)
  const [hovered, setHovered] = React.useState(false)
  const location = useLocation()
  const signals = useNavSignals()

  const open = pinned || hovered

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <div
      className="fixed inset-y-3 start-3 z-40 hidden lg:block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.nav
        aria-label={t('Primary')}
        initial={false}
        animate={{ width: open ? 264 : 76 }}
        transition={{ duration: 0.28, ease: EASE }}
        // Onyx, not the translucent chrome the rest of the furniture uses: the
        // rail is the one piece of permanent structure on screen, and a solid
        // dark plane says that better than another pane of frosted glass.
        className="relative flex h-full flex-col overflow-hidden rounded-[26px] bg-onyx text-onyx-fg shadow-xl"
      >
        {/* ── Mark ──────────────────────────────────── */}
        <div className="flex h-[62px] shrink-0 items-center gap-3 px-[18px]">
          <Tooltip content={open ? '' : t('Overview')} side={rtl ? 'left' : 'right'}>
            <Link to="/" aria-label={`Zoetel — ${t('Overview')}`} className="shrink-0">
              <Logo size={30} tone="onDark" />
            </Link>
          </Tooltip>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -6 * dirSign }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 * dirSign }}
                transition={{ duration: 0.18 }}
                className="flex min-w-0 flex-1 items-center"
              >
                <span className="headline truncate text-base text-white">Zoetel</span>
                <button
                  onClick={() => setPinned(!pinned)}
                  className="ms-auto shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={pinned ? t('Collapse navigation') : t('Keep navigation open')}
                  aria-pressed={pinned}
                >
                  {pinned ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Destinations ──────────────────────────── */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2">
          {NAV.map((group, gi) => (
            <div key={group.label ?? gi} className={cn(gi > 0 && (open ? 'mt-4' : 'mt-3'))}>
              {open && group.label && (
                <p className="eyebrow mb-1.5 px-[22px] text-white/35">{t(group.label)}</p>
              )}
              <ul className={cn('space-y-1', !open && 'px-[14px]')}>
                {group.items.map((item) => {
                  const active = isActive(item.to, item.end)
                  const sig = signals[item.to]

                  const link = (
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={cn(
                        'group relative flex items-center transition-colors',
                        open
                          ? 'mx-[14px] gap-3 rounded-2xl py-1 pe-3 ps-1 text-base'
                          : 'justify-center rounded-2xl py-0.5',
                        active ? 'text-white' : 'text-white/60 hover:text-white',
                      )}
                    >
                      {/* The icon sits in a filled tile — solid brand when active,
                          a faint wash otherwise. A tile reads as "filled" for every
                          glyph, which a fill on the paths themselves does not:
                          lucide's line icons (usage, webhooks, logs) turn to blobs
                          when you fill them. */}
                      <span
                        className={cn(
                          'relative grid size-10 shrink-0 place-items-center rounded-[14px] transition-colors',
                          active ? 'text-white' : 'text-white/70 group-hover:bg-white/10',
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={open ? 'rail-tile-open' : 'rail-tile-closed'}
                            className="absolute inset-0 rounded-[14px] bg-brand shadow-brand"
                            transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                          />
                        )}
                        <item.icon weight="fill" className="relative size-[22px] shrink-0" />
                      </span>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn('flex-1 truncate', active && 'font-medium')}
                        >
                          {t(item.label)}
                        </motion.span>
                      )}
                      {open ? (
                        sig?.label ? (
                          <Badge tone={sig.dot === 'danger' ? 'danger' : 'warning'} size="sm">
                            {t(sig.label)}
                          </Badge>
                        ) : sig?.count != null ? (
                          <span className="text-xs tabular-nums text-white/40">{sig.count}</span>
                        ) : sig?.dot ? (
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              sig.dot === 'danger' ? 'bg-danger' : 'bg-warning',
                            )}
                          />
                        ) : null
                      ) : (
                        sig?.dot && (
                          <span
                            className={cn(
                              'absolute end-0 top-0.5 size-2 rounded-full ring-2 ring-onyx',
                              sig.dot === 'danger' ? 'bg-danger' : 'bg-warning',
                            )}
                          />
                        )
                      )}
                    </NavLink>
                  )

                  return (
                    <li key={item.to}>
                      {open ? (
                        link
                      ) : (
                        <Tooltip content={t(item.label)} side={rtl ? 'left' : 'right'}>
                          {link}
                        </Tooltip>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <RailFooter open={open} />
      </motion.nav>
    </div>
  )
}

function RailFooter({ open }: { open: boolean }) {
  const { rtl, t } = useI18n()
  const balance = useApp((s) => s.balance)
  const currency = useApp((s) => s.workspace.currency)
  const threshold = useApp((s) => s.autoRecharge.threshold)
  const { progress, setupComplete } = useJourney()
  const low = balance < threshold

  return (
    <div className="shrink-0 border-t border-white/10 p-[14px]">
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
          {!setupComplete && (
            <Link to="/" className="block rounded-xl px-2.5 py-2 transition-colors hover:bg-white/10">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-white/55">{t('Setup')}</span>
                <span className="tabular-nums text-white">{progress}%</span>
              </div>
              <div className="bg-white/12 mt-1.5 h-1 overflow-hidden rounded-full">
                <motion.div
                  className="h-full rounded-full bg-brand"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: EASE }}
                />
              </div>
            </Link>
          )}
          <Link
            to="/billing"
            className="flex items-baseline justify-between rounded-xl px-2.5 py-2 text-xs transition-colors hover:bg-white/10"
          >
            <span className="font-medium text-white/55">{t('Wallet')}</span>
            <span className={cn('font-semibold tabular-nums', low ? 'text-warning' : 'text-white')}>
              {money(balance, currency)}
            </span>
          </Link>
        </motion.div>
      ) : (
        <Tooltip content={`${t('Wallet')} · ${money(balance, currency)}`} side={rtl ? 'left' : 'right'}>
          <Link
            to="/billing"
            className={cn(
              'grid h-10 place-items-center rounded-xl text-xs font-semibold tabular-nums transition-colors hover:bg-white/10',
              low ? 'text-warning' : 'text-white/55 hover:text-white',
            )}
          >
            {money(balance, currency, { compact: true, trimZeros: true })}
          </Link>
        </Tooltip>
      )}
    </div>
  )
}
