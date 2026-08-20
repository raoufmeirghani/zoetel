import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Clock, Cpu, Network, PhoneForwarded, Webhook } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export type DestinationId = 'zoie' | 'sip' | 'forward' | 'webhook' | 'later'

export interface Destination {
  id: DestinationId
  icon: LucideIcon
  label: string
  blurb: string
  /** Marks the destination that opens Zoie — draws the new-tab affordance. */
  external?: boolean
}

/**
 * The four honest answers to "how should this channel work", plus deferral.
 * Zoie sits first because it is the shortest path to a working phone number for
 * most customers — not because it is being sold. It carries no badge, no
 * "recommended" ribbon and no accent the others don't get; it is a peer.
 */
export const CALL_DESTINATIONS: Destination[] = [
  {
    id: 'zoie',
    icon: Cpu,
    label: 'An AI voice agent',
    blurb: 'Zoie answers, understands, books and escalates. No PBX, no code.',
    external: true,
  },
  {
    id: 'sip',
    icon: Network,
    label: 'My own PBX or softswitch',
    blurb: 'Deliver the call over a SIP trunk you control.',
  },
  {
    id: 'webhook',
    icon: Webhook,
    label: 'My application',
    blurb: 'We POST call events to your endpoint and you drive the call.',
  },
  {
    id: 'forward',
    icon: PhoneForwarded,
    label: 'Another phone number',
    blurb: 'Straight forwarding to a mobile or landline.',
  },
  {
    id: 'later',
    icon: Clock,
    label: 'Decide later',
    blurb: 'The number stays reserved. Nothing rings until you choose.',
  },
]

/**
 * A question, then the destinations — the pattern the product uses everywhere a
 * channel needs an owner. It never asks "do you want to use Zoie?"; it asks how
 * the thing should work and lets Zoie be one of the answers.
 */
export function DestinationPicker({
  question,
  lede,
  destinations = CALL_DESTINATIONS,
  value,
  onSelect,
  exclude,
  className,
}: {
  question?: React.ReactNode
  lede?: React.ReactNode
  destinations?: Destination[]
  value?: DestinationId
  onSelect: (id: DestinationId) => void
  exclude?: DestinationId[]
  className?: string
}) {
  const { t } = useI18n()
  const items = destinations.filter((d) => !exclude?.includes(d.id))

  return (
    <div className={className}>
      {question && <h3 className="headline text-lg text-ink">{question}</h3>}
      {lede && <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{lede}</p>}

      <div className={cn('grid gap-2.5 sm:grid-cols-2', (question || lede) && 'mt-6')}>
        {items.map((d, i) => {
          const active = d.id === value
          return (
            <motion.button
              key={d.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: Math.min(i * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(d.id)}
              aria-pressed={active}
              className={cn(
                'group flex items-start gap-3.5 rounded-3xl p-4 text-start transition-colors',
                active ? 'bg-brand-softer ring-1 ring-brand/40' : 'bg-veil hover:bg-veil-strong',
                d.id === 'later' && 'sm:col-span-2',
              )}
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-2xl transition-colors',
                  active ? 'bg-brand text-brand-fg' : 'bg-surface text-ink-muted',
                )}
              >
                <d.icon className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-base font-medium text-ink">{t(d.label)}</span>
                  {active && <Check className="size-4 shrink-0 text-brand" />}
                  {d.external && (
                    <ArrowUpRight
                      className="size-3.5 shrink-0 text-ink-faint transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                      aria-label={t('Opens in a new tab')}
                    />
                  )}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-subtle">{t(d.blurb)}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
