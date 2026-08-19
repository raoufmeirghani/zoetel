import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Spotlight } from '@/lib/journey'
import { Button } from '@/components/ui/button'
import { openZoie, useZoieContext } from '@/lib/zoie'
import { useApp } from '@/store/app'

const TONE = {
  brand: { chip: 'bg-brand/12 text-brand', halo: 'bg-brand/20' },
  danger: { chip: 'bg-danger/12 text-danger', halo: 'bg-danger/20' },
  warning: { chip: 'bg-warning/14 text-warning', halo: 'bg-warning/20' },
  success: { chip: 'bg-success/12 text-success', halo: 'bg-success/20' },
} as const

/**
 * The single most important thing on the page. Composed with type and space
 * rather than wrapped in a card, so it reads as the page's own voice.
 */
export function NextStep({
  spotlight,
  allClear,
  className,
  aside,
}: {
  spotlight: Spotlight | null
  allClear?: boolean
  className?: string
  aside?: React.ReactNode
}) {
  // Above the early return — hooks can't be conditional.
  const zoie = useZoieContext()
  const markZoieHandoff = useApp((s) => s.markZoieHandoff)

  if (!spotlight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn('flex flex-wrap items-center gap-5', className)}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success-soft text-success">
          <PartyPopper className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Nothing to do</p>
          <p className="headline mt-2 text-3xl text-ink">
            {allClear ? 'Everything is running' : 'You’re all set up'}
          </p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
            {allClear
              ? 'No action needed. Anything that changes will show up here first.'
              : 'Nothing is blocking you. Keep an eye on the items below.'}
          </p>
        </div>
      </motion.div>
    )
  }

  const tone = TONE[spotlight.tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between', className)}
    >
      <div className="flex min-w-0 gap-5">
        <span className={cn('relative mt-1 grid size-11 shrink-0 place-items-center rounded-2xl', tone.chip)}>
          <span className={cn('absolute inset-0 animate-pulse-ring rounded-2xl', tone.halo)} aria-hidden />
          <spotlight.icon className="relative size-5" />
        </span>
        <div className="min-w-0">
          <p className="eyebrow">{spotlight.eyebrow}</p>
          <h2 className="headline mt-2 text-balance text-2xl text-ink sm:text-3xl">{spotlight.title}</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">{spotlight.why}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 lg:pl-6">
        {aside}
        {/* A step that continues in Zoie opens a tab rather than navigating —
            the infrastructure work here isn't finished. */}
        {spotlight.zoie ? (
          <Button
            size="lg"
            variant="primary"
            onClick={() => {
              openZoie(spotlight.zoie!, zoie)
              markZoieHandoff()
            }}
          >
            {spotlight.cta}
            <ArrowUpRight className="size-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            variant={spotlight.waiting ? 'secondary' : spotlight.tone === 'danger' ? 'destructive' : 'primary'}
            asChild
          >
            <Link to={spotlight.to}>
              {spotlight.cta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  )
}
