import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Ellipsis, Search } from 'lucide-react'
import { ChartBar, Phone, SquaresFour, TreeStructure } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { NAV } from './nav-config'
import { useJourney } from '@/lib/journey'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'

const PRIMARY: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/', label: 'Overview', icon: SquaresFour, end: true },
  { to: '/numbers', label: 'Numbers', icon: Phone },
  { to: '/sip', label: 'SIP', icon: TreeStructure },
  { to: '/analytics', label: 'Usage', icon: ChartBar },
]

/** Thumb-reachable dock. Replaces the drawer pattern on phones. */
export function MobileDock({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { t } = useI18n()
  const [sheet, setSheet] = React.useState(false)
  const location = useLocation()
  const { attention } = useJourney()

  React.useEffect(() => setSheet(false), [location.pathname])

  const secondary = NAV.flatMap((g) => g.items).filter((i) => !PRIMARY.some((p) => p.to === i.to))

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3 lg:hidden">
        <nav
          aria-label={t('Primary')}
          className="chrome pointer-events-auto flex items-center gap-0.5 rounded-full p-1.5"
        >
          {PRIMARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative grid size-11 place-items-center rounded-full transition-colors',
                  isActive ? 'text-brand' : 'text-ink-faint',
                )
              }
              aria-label={t(item.label)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="dock-active"
                      className="absolute inset-0 rounded-full bg-veil-strong"
                      transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                    />
                  )}
                  <item.icon weight="fill" className="relative size-[21px]" />
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={onOpenSearch}
            className="grid size-11 place-items-center rounded-full text-ink-faint"
            aria-label={t('Search')}
          >
            <Search className="size-[19px]" />
          </button>
          <button
            onClick={() => setSheet(true)}
            className="relative grid size-11 place-items-center rounded-full text-ink-faint"
            aria-label={t('More')}
          >
            <Ellipsis className="size-[19px]" />
            {attention.length > 0 && (
              <span className="absolute end-2 top-2 size-1.5 rounded-full bg-warning ring-2 ring-surface" />
            )}
          </button>
        </nav>
      </div>

      <DialogPrimitive.Root open={sheet} onOpenChange={setSheet}>
        <AnimatePresence>
          {sheet && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[3px] dark:bg-black/60 lg:hidden"
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                  className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-surface p-5 pb-8 shadow-pop lg:hidden"
                >
                  <DialogPrimitive.Title className="sr-only">{t('More destinations')}</DialogPrimitive.Title>
                  <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" />
                  <ul className="grid grid-cols-2 gap-2">
                    {secondary.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className="flex items-center gap-2.5 rounded-2xl px-3 py-3 text-base text-ink transition-colors hover:bg-veil-strong"
                        >
                          <item.icon weight="fill" className="size-4 shrink-0 text-ink-faint" />
                          <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
                          {item.badge === 'verification' && attention.some((a) => a.id.startsWith('kyc')) && (
                            <Badge tone="danger" size="sm">
                              !
                            </Badge>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </>
  )
}
