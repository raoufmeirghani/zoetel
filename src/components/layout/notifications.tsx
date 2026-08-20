import * as React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CircleCheck,
  CircleAlert,
  Info,
  Phone,
  ShieldCheck,
  TriangleAlert,
  Wallet,
  Network,
  CheckCheck,
} from 'lucide-react'
import { useApp, selUnreadCount } from '@/store/app'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmptyState } from '@/components/ui/feedback'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

const KIND_ICON = {
  verification: ShieldCheck,
  number: Phone,
  billing: Wallet,
  compliance: TriangleAlert,
  system: Info,
  sip: Network,
} as const

const SEVERITY = {
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const

function Row({ n, onRead }: { n: NotificationItem; onRead: (id: string) => void }) {
  const Icon = KIND_ICON[n.kind] ?? Info
  const body = (
    <>
      <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', SEVERITY[n.severity])}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'text-base leading-snug',
              n.read ? 'font-medium text-ink-muted' : 'font-semibold text-ink',
            )}
          >
            {n.title}
          </span>
          {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />}
        </span>
        <span className="mt-0.5 block text-sm leading-relaxed text-ink-subtle">{n.body}</span>
        <span className="mt-1 block text-2xs tabular-nums text-ink-faint">{relativeTime(n.at)}</span>
      </span>
    </>
  )

  const cls = cn(
    'flex w-full gap-3 rounded-xl p-2.5 text-start transition-colors hover:bg-surface-2',
    !n.read && 'bg-brand-softer/60',
  )

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
    >
      {n.href ? (
        <Link to={n.href} className={cls} onClick={() => onRead(n.id)}>
          {body}
        </Link>
      ) : (
        <button className={cls} onClick={() => onRead(n.id)}>
          {body}
        </button>
      )}
    </motion.li>
  )
}

export function NotificationBell() {
  const { t } = useI18n()
  const notifications = useApp((s) => s.notifications)
  const unread = useApp(selUnreadCount)
  const markRead = useApp((s) => s.markNotificationRead)
  const markAll = useApp((s) => s.markAllNotificationsRead)
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<'all' | 'unread'>('all')

  const shown = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-ink-muted"
          aria-label={t('Notifications')}
        >
          <Bell />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -end-0.5 -top-0.5 grid min-w-[15px] place-items-center rounded-full bg-danger px-1 text-[9px] font-bold leading-[15px] text-white ring-2 ring-surface"
              >
                {unread}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="flex items-center gap-1">
            {(['all', 'unread'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-lg px-2 py-1 text-sm font-medium capitalize transition-colors',
                  tab === t ? 'bg-surface-3 text-ink' : 'text-ink-subtle hover:text-ink',
                )}
              >
                {t}
                {t === 'unread' && unread > 0 && <span className="ms-1 tabular-nums text-brand">{unread}</span>}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="xs"
              icon={<CheckCheck />}
              onClick={markAll}
              className="text-ink-subtle"
            >
              {t('Mark all read')}
            </Button>
          )}
        </div>
        <div className="max-h-[26rem] overflow-y-auto p-1.5">
          {shown.length === 0 ? (
            <EmptyState
              compact
              icon={<CircleCheck />}
              title={t("You're all caught up")}
              description={t('Verification updates, purchases and billing events land here.')}
            />
          ) : (
            <ul className="space-y-0.5">
              <AnimatePresence initial={false}>
                {shown.map((n) => (
                  <Row key={n.id} n={n} onRead={markRead} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
        <div className="border-t border-line px-3 py-2">
          <Button variant="ghost" size="xs" block className="justify-center text-ink-subtle" asChild>
            <Link to="/settings?tab=notifications" onClick={() => setOpen(false)}>
              {t('Notification preferences')}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const NotificationIcons = { CircleAlert }
