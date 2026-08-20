import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AttentionItem } from '@/lib/journey'
import { useI18n } from '@/lib/i18n'

const TONE = {
  critical: { dot: 'bg-danger', chip: 'bg-danger-soft text-danger', label: 'Blocking' },
  warning: { dot: 'bg-warning', chip: 'bg-warning-soft text-warning', label: 'Soon' },
  info: { dot: 'bg-info', chip: 'bg-info-soft text-info', label: 'Worth doing' },
} as const

/**
 * Prioritised, borderless rows. Severity is carried by a single dot and the
 * order of the list, not by four competing coloured boxes.
 */
export function AttentionList({
  items,
  className,
  limit,
}: {
  items: AttentionItem[]
  className?: string
  limit?: number
}) {
  const { t } = useI18n()
  if (!items.length) {
    return (
      <div className={cn('flex items-center gap-3 py-2', className)}>
        <CircleCheck className="size-[18px] shrink-0 text-success" />
        <p className="text-base text-ink-muted">
          Nothing needs your attention. Compliance, wallet and connections are all healthy.
        </p>
      </div>
    )
  }

  const shown = limit ? items.slice(0, limit) : items

  return (
    <ul className={cn('divide-y divide-line-soft', className)}>
      {shown.map((item, i) => {
        const tone = TONE[item.severity]
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={item.to}
              className="group -mx-3 flex flex-col gap-3 rounded-2xl px-3 py-4 transition-colors hover:bg-veil sm:flex-row sm:items-center sm:gap-5"
            >
              <span
                className={cn('mt-1.5 grid size-9 shrink-0 place-items-center rounded-xl sm:mt-0', tone.chip)}
              >
                <item.icon className="size-[17px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
                  <p className="truncate text-base font-medium text-ink">{t(item.title)}</p>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{t(item.detail)}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors group-hover:text-brand-ink">
                {t(item.cta)}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.li>
        )
      })}
      {limit && items.length > limit && (
        <li className="pt-3 text-sm text-ink-faint">
          +{items.length - limit} more {items.length - limit === 1 ? 'item' : 'items'}
        </li>
      )}
    </ul>
  )
}

/**
 * The same items as a tile grid. Stacked full-width rows made the overview read
 * as one long text list — everything the same weight, nothing to land on. Tiles
 * give each decision its own shape, carry severity as a wash of colour rather
 * than a lone dot, and let three of them sit side by side instead of end to end.
 */
export function AttentionTiles({
  items,
  className,
  limit = 3,
}: {
  items: AttentionItem[]
  className?: string
  limit?: number
}) {
  const { t } = useI18n()
  if (!items.length) {
    return (
      <div className={cn('flex items-center gap-3 rounded-3xl bg-success-soft px-5 py-4', className)}>
        <CircleCheck className="size-[18px] shrink-0 text-success" />
        <p className="text-base text-success-ink">
          Nothing needs your attention — compliance, wallet and connections are all healthy.
        </p>
      </div>
    )
  }

  const shown = items.slice(0, limit)

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item, i) => {
          const tone = TILE[item.severity]
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={item.to}
                className={cn(
                  'group flex h-full flex-col rounded-3xl p-5 transition-colors',
                  tone.tile,
                  tone.hover,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone.chip)}>
                    <item.icon className="size-[17px]" />
                  </span>
                  <span className={cn('text-2xs font-semibold uppercase tracking-wider', tone.label)}>
                    {TONE[item.severity].label}
                  </span>
                </div>

                <p className={cn('mt-4 text-base font-medium', tone.title)}>{t(item.title)}</p>
                <p className={cn('mt-1.5 line-clamp-2 text-sm leading-relaxed', tone.detail)}>
                  {t(item.detail)}
                </p>

                <span className={cn('mt-5 inline-flex items-center gap-1.5 text-sm font-medium', tone.cta)}>
                  {t(item.cta)}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
      {items.length > limit && (
        <p className="mt-3 text-sm text-ink-faint">
          +{items.length - limit} more {items.length - limit === 1 ? 'item' : 'items'}
        </p>
      )}
    </div>
  )
}

const TILE = {
  critical: {
    tile: 'bg-danger-soft',
    hover: 'hover:bg-danger-soft/70',
    chip: 'bg-danger text-white',
    label: 'text-danger-ink/70',
    title: 'text-danger-ink',
    detail: 'text-danger-ink/80',
    cta: 'text-danger-ink',
  },
  warning: {
    tile: 'bg-warning-soft',
    hover: 'hover:bg-warning-soft/70',
    chip: 'bg-warning text-white',
    label: 'text-warning-ink/70',
    title: 'text-warning-ink',
    detail: 'text-warning-ink/80',
    cta: 'text-warning-ink',
  },
  info: {
    tile: 'bg-veil',
    hover: 'hover:bg-veil-strong',
    chip: 'bg-info-soft text-info',
    label: 'text-ink-faint',
    title: 'text-ink',
    detail: 'text-ink-subtle',
    cta: 'text-ink-muted group-hover:text-brand-ink',
  },
} as const
