import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stage } from '@/lib/journey'
import { Tooltip } from '@/components/ui/tooltip'
import { openZoie, useZoieContext } from '@/lib/zoie'
import { useApp } from '@/store/app'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The customer's path, shown as a trail rather than a checklist. Completed
 * stages recede; the current one is the only thing that draws the eye.
 */
export function JourneyRail({ stages, className }: { stages: Stage[]; className?: string }) {
  const zoie = useZoieContext()
  const markZoieHandoff = useApp((s) => s.markZoieHandoff)
  // Fill to the first *incomplete* stage, not the last complete one. Stages can
  // finish out of order (you can fund a wallet before verifying), and filling to
  // the last tick painted a 100% trail with an unfinished step sitting inside it.
  const firstOpen = stages.findIndex((s) => !s.done)
  const reached = firstOpen === -1 ? stages.length - 1 : firstOpen
  const fill = stages.length > 1 ? (reached / (stages.length - 1)) * 100 : 0

  return (
    <div className={cn('relative', className)}>
      {/* The trail itself */}
      <div className="absolute left-0 right-0 top-[13px] h-px bg-line-soft" aria-hidden />
      <motion.div
        className="absolute left-0 top-[13px] h-px bg-brand/45"
        initial={{ width: 0 }}
        animate={{ width: `${fill}%` }}
        transition={{ duration: 0.9, ease: EASE }}
        aria-hidden
      />

      <ol className="relative flex items-start justify-between gap-1">
        {stages.map((stage, i) => (
          <li key={stage.id} className="flex min-w-0 flex-col items-center gap-2.5">
            <Tooltip content={stage.done ? `${stage.label} — done` : stage.action} side="top">
              <Link
                to={stage.to}
                {...(stage.zoie
                  ? {
                      onClick: (e: React.MouseEvent) => {
                        e.preventDefault()
                        openZoie(stage.zoie!, zoie)
                        markZoieHandoff()
                      },
                    }
                  : {})}
                aria-current={stage.current ? 'step' : undefined}
                className="group grid size-[27px] place-items-center rounded-full bg-canvas"
              >
                {stage.current && (
                  <motion.span
                    layoutId="journey-halo"
                    className="bg-brand/14 absolute size-[27px] rounded-full"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    'relative grid size-[19px] place-items-center rounded-full transition-colors duration-300',
                    stage.done && 'bg-brand/85 text-brand-fg',
                    stage.current && !stage.done && 'bg-brand text-brand-fg',
                    !stage.done && !stage.current && 'bg-veil-strong text-ink-faint',
                  )}
                >
                  {stage.done ? (
                    <Check className="size-[11px]" strokeWidth={3.4} />
                  ) : stage.waiting ? (
                    <LoaderCircle className="size-[11px] animate-spin" />
                  ) : (
                    <span
                      className={cn('size-[5px] rounded-full', stage.current ? 'bg-brand-fg' : 'bg-ink-faint')}
                    />
                  )}
                </span>
              </Link>
            </Tooltip>
            <span
              className={cn(
                'hidden truncate text-2xs font-medium transition-colors sm:block',
                stage.current ? 'text-ink' : stage.done ? 'text-ink-faint' : 'text-ink-faint/70',
              )}
              style={{ maxWidth: `${Math.max(100 / stages.length, 8)}%`, minWidth: 'max-content' }}
            >
              {stage.label}
            </span>
            {i === 0 && <span className="sr-only">Journey progress</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}
