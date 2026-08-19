import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openZoie, useZoieContext, type ZoieTarget } from '@/lib/zoie'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'

/**
 * Shown once the customer picks an AI agent as the destination. Choosing an
 * option shouldn't fling a tab open at you — so the choice reveals this, which
 * says plainly what is about to happen, what is already carried over, and leaves
 * the crossing itself to a deliberate click.
 *
 * It is not an advert: it only ever appears *after* the customer chose this
 * destination, and it describes a handoff rather than selling a product.
 */
export function ZoieHandoff({
  target = 'voice-agent',
  number,
  className,
}: {
  target?: ZoieTarget
  /** The E.164 number Zoie should pre-select for the agent. */
  number?: string
  className?: string
}) {
  const zoie = useZoieContext()
  const markZoieHandoff = useApp((s) => s.markZoieHandoff)

  const carried = [
    `${zoie.business} imported`,
    zoie.verified ? 'Verification cleared' : 'Verification status shared',
    number ? `${number} pre-selected` : `${zoie.numbers.length} numbers connected`,
    `${zoie.country} · ${zoie.timezone}`,
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className={cn('rounded-3xl bg-brand-softer p-5 sm:p-6', className)}
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg">
          <Cpu className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-ink">Agents are built in Zoie</p>
          <p className="mt-1.5 text-base leading-relaxed text-ink-muted">
            Zoie is where the intelligence lives — it opens in a new tab with this workspace already set up, so
            you pick a voice and write the brief, nothing else.
          </p>

          <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {carried.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-ink-muted">
                <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.8} />
                <span className="truncate">{c}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                openZoie(target, zoie, { number })
                markZoieHandoff()
              }}
            >
              Continue in Zoie
              <ArrowUpRight className="size-4" />
            </Button>
            <span className="text-xs text-ink-faint">Opens us.zoie.ai in a new tab</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
