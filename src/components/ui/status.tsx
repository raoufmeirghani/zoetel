import { cn } from '@/lib/utils'
import { Badge } from './badge'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'

const dotTones: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-faint',
  brand: 'bg-brand',
}

export function StatusDot({
  tone = 'neutral',
  pulse,
  className,
}: {
  tone?: Tone
  pulse?: boolean
  className?: string
}) {
  return (
    <span className={cn('relative flex size-2 shrink-0', className)}>
      {pulse && (
        <span className={cn('absolute inset-0 animate-pulse-ring rounded-full', dotTones[tone])} aria-hidden />
      )}
      <span className={cn('relative size-2 rounded-full', dotTones[tone])} />
    </span>
  )
}

const STATUS_MAP: Record<string, { label: string; tone: Tone; pulse?: boolean }> = {
  active: { label: 'Active', tone: 'success' },
  healthy: { label: 'Healthy', tone: 'success' },
  approved: { label: 'Approved', tone: 'success' },
  succeeded: { label: 'Succeeded', tone: 'success' },
  paid: { label: 'Paid', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  delivered: { label: 'Delivered', tone: 'success' },
  live: { label: 'Live', tone: 'success', pulse: true },
  in_progress: { label: 'In progress', tone: 'info', pulse: true },
  provisioning: { label: 'Provisioning', tone: 'info', pulse: true },
  porting: { label: 'Porting', tone: 'info' },
  in_review: { label: 'In review', tone: 'info' },
  submitted: { label: 'Submitted', tone: 'info' },
  sent: { label: 'Sent', tone: 'info' },
  open: { label: 'Open', tone: 'info' },
  invited: { label: 'Invited', tone: 'info' },
  queued: { label: 'Queued', tone: 'neutral' },
  pending: { label: 'Pending', tone: 'warning' },
  pending_verification: { label: 'Pending verification', tone: 'warning' },
  required: { label: 'Action required', tone: 'warning' },
  degraded: { label: 'Degraded', tone: 'warning' },
  past_due: { label: 'Past due', tone: 'warning' },
  no_answer: { label: 'No answer', tone: 'warning' },
  busy: { label: 'Busy', tone: 'warning' },
  processing: { label: 'Processing', tone: 'warning' },
  uploading: { label: 'Uploading', tone: 'info' },
  in_review_business: { label: 'In review', tone: 'info' },
  failed: { label: 'Failed', tone: 'danger' },
  failing: { label: 'Failing', tone: 'danger' },
  rejected: { label: 'Rejected', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  revoked: { label: 'Revoked', tone: 'danger' },
  offline: { label: 'Offline', tone: 'danger' },
  paused: { label: 'Paused', tone: 'neutral' },
  missing: { label: 'Not uploaded', tone: 'neutral' },
  not_started: { label: 'Not started', tone: 'neutral' },
  not_required: { label: 'Not required', tone: 'neutral' },
  inactive: { label: 'Inactive', tone: 'neutral' },
}

export function StatusBadge({
  status,
  label,
  className,
  size = 'md',
  dot = true,
}: {
  status: string
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}) {
  const meta = STATUS_MAP[status] ?? { label: label ?? status.replace(/_/g, ' '), tone: 'neutral' as Tone }
  return (
    <Badge
      tone={meta.tone === 'brand' ? 'brand' : meta.tone}
      size={size}
      className={cn('capitalize', className)}
    >
      {dot && <StatusDot tone={meta.tone} pulse={meta.pulse} />}
      {label ?? meta.label}
    </Badge>
  )
}

export function statusTone(status: string): Tone {
  return STATUS_MAP[status]?.tone ?? 'neutral'
}
