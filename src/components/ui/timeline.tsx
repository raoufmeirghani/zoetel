import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { relativeTime } from '@/lib/format'
import { Foreign } from './foreign'
import { useDirSign } from '@/lib/i18n'

export interface TimelineEntry {
  id: string
  title: React.ReactNode
  detail?: React.ReactNode
  at: string
  icon?: React.ReactNode
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  meta?: React.ReactNode
}

const tones = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-veil-strong text-ink-subtle',
}

export function Timeline({
  entries,
  className,
  dense,
}: {
  entries: TimelineEntry[]
  className?: string
  dense?: boolean
}) {
  const dirSign = useDirSign()
  return (
    <ol className={cn('relative', className)}>
      {entries.map((e, i) => (
        <motion.li
          key={e.id}
          initial={{ opacity: 0, x: -6 * dirSign }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.045, 0.4), ease: [0.16, 1, 0.3, 1] }}
          className={cn('relative flex gap-3.5', dense ? 'pb-4' : 'pb-5', 'last:pb-0')}
        >
          {i < entries.length - 1 && (
            <span className="absolute start-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-line" />
          )}
          <span
            className={cn(
              'relative z-10 grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-[15px]',
              tones[e.tone ?? 'neutral'],
            )}
          >
            {e.icon ?? <span className="size-1.5 rounded-full bg-current" />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="text-base text-ink">
                <Foreign>{e.title}</Foreign>
              </p>
              <time className="shrink-0 text-xs tabular-nums text-ink-faint" dateTime={e.at}>
                {relativeTime(e.at)}
              </time>
            </div>
            {e.detail && (
              <p className="mt-0.5 text-sm leading-relaxed text-ink-subtle">
                <Foreign>{e.detail}</Foreign>
              </p>
            )}
            {e.meta}
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
