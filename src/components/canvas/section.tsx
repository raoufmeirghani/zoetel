import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * A page section, on glass. Every page composes with this, so the card treatment
 * lives here rather than being repeated across sixteen feature files.
 *
 * `card={false}` opts out for the rare section that is an inline sub-group rather
 * than a standalone block — nesting glass inside glass reads as a mistake.
 */
export function Section({
  eyebrow,
  title,
  lede,
  action,
  href,
  hrefLabel = 'View all',
  children,
  className,
  divided,
  card = true,
  index = 0,
}: {
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  lede?: React.ReactNode
  action?: React.ReactNode
  href?: string
  hrefLabel?: string
  children: React.ReactNode
  className?: string
  /** Legacy hairline separator. Ignored on a card — the card's edge separates. */
  divided?: boolean
  /** Opt out for a section that is an inline sub-group; glass inside glass reads wrong. */
  card?: boolean
  index?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        card ? 'glass rounded-[28px] px-6 py-6 sm:px-7' : divided && 'border-t border-line-soft pt-10',
        className,
      )}
    >
      {(title || eyebrow || action || href) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
            {title && (
              <h2 className="text-lg font-semibold tracking-[-0.016em] text-ink sm:text-xl">{title}</h2>
            )}
            {lede && <p className="mt-1.5 max-w-xl text-base leading-relaxed text-ink-subtle">{lede}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            {href && (
              <Link
                to={href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {hrefLabel}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.section>
  )
}
