import * as React from 'react'
import { motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'brand' | 'neutral'

const toneStyles: Record<Tone, { wrap: string; icon: string; Icon: React.ElementType }> = {
  info: { wrap: 'bg-info-soft text-info-ink', icon: 'text-info', Icon: Info },
  success: { wrap: 'bg-success-soft text-success-ink', icon: 'text-success', Icon: CircleCheck },
  warning: { wrap: 'bg-warning-soft text-warning-ink', icon: 'text-warning', Icon: TriangleAlert },
  danger: { wrap: 'bg-danger-soft text-danger-ink', icon: 'text-danger', Icon: CircleAlert },
  brand: { wrap: 'bg-brand-soft text-brand-ink', icon: 'text-brand', Icon: Info },
  neutral: { wrap: 'bg-surface-3 text-ink', icon: 'text-ink-muted', Icon: Info },
}

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className,
  icon,
  compact,
}: {
  tone?: Tone
  title?: React.ReactNode
  children?: React.ReactNode
  action?: React.ReactNode
  onDismiss?: () => void
  className?: string
  icon?: React.ReactNode
  compact?: boolean
}) {
  const s = toneStyles[tone]
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-3xl', compact ? 'p-3.5' : 'p-4.5', s.wrap, className)}
    >
      <span className={cn('mt-px shrink-0 [&_svg]:size-[18px]', s.icon)}>{icon ?? <s.Icon />}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-base font-semibold leading-snug">{title}</p>}
        {children && (
          <div className={cn('text-sm leading-relaxed opacity-90', title && 'mt-1')}>{children}</div>
        )}
        {action && <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="-m-1 h-fit rounded-md p-1 opacity-50 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

/** Full-width banner for account-level states (verification, low balance, upgrade). */
export function Banner({
  tone = 'brand',
  icon,
  title,
  description,
  action,
  onDismiss,
  className,
}: {
  tone?: Tone
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  onDismiss?: () => void
  className?: string
}) {
  const s = toneStyles[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-4',
        s.wrap,
        className,
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/10 [&_svg]:size-[18px]',
          s.icon,
        )}
      >
        {icon ?? <s.Icon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-snug">{title}</p>
        {description && <p className="mt-0.5 text-sm leading-relaxed opacity-85">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="opacity-60"
          >
            <X />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration,
  compact,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
  illustration?: React.ReactNode
  compact?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-10' : 'py-16',
        className,
      )}
    >
      {illustration ?? (
        <span className="relative mb-6 flex size-16 items-center justify-center rounded-3xl bg-veil-strong text-ink-subtle [&_svg]:size-7">
          <span className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/50 to-transparent dark:from-white/5" />
          {icon}
        </span>
      )}
      <h3 className="headline text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-base leading-relaxed text-ink-subtle">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </motion.div>
  )
}

/** Error state with an explanation and a recovery path — never a raw stack trace. */
export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  action,
  className,
  code,
}: {
  title?: string
  description?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  action?: React.ReactNode
  className?: string
  code?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-danger-soft text-danger [&_svg]:size-7">
        <CircleAlert />
      </span>
      <h3 className="headline text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-base leading-relaxed text-ink-subtle">{description}</p>}
      <div className="mt-6 flex items-center gap-2">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {action}
      </div>
      {code && <p className="mt-5 font-mono text-2xs text-ink-faint">{code}</p>}
    </div>
  )
}

/** Locked/permission state for role-gated surfaces. */
export function PermissionState({
  title = 'You need extra permissions',
  description,
  requiredRole,
  className,
  icon,
}: {
  title?: string
  description?: React.ReactNode
  requiredRole?: string
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-veil-strong text-ink-subtle [&_svg]:size-7">
        {icon}
      </span>
      <h3 className="headline text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-base leading-relaxed text-ink-subtle">{description}</p>}
      {requiredRole && (
        <p className="mt-4 rounded-lg bg-surface-3 px-3 py-1.5 text-xs text-ink-muted">
          Requires the <span className="font-semibold text-ink">{requiredRole}</span> role
        </p>
      )}
    </div>
  )
}
