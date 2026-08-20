import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleAlert, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface ConfigSection {
  id: string
  icon: LucideIcon
  label: string
  /** The current value, shown under the label once the section is set. */
  summary?: React.ReactNode
  /** What this setting does — shown instead of `summary` while it is unset. */
  hint?: string
  state: 'set' | 'unset' | 'required' | 'locked'
  /** Pane heading. Falls back to `label`. */
  title?: React.ReactNode
  description?: React.ReactNode
  body: React.ReactNode
  /** Omit for sections that apply immediately — then no footer is drawn. */
  onSave?: () => void
  saveLabel?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Settings as tabs with the form already on screen, rather than a list of rows
 * that each cost a click and a drawer. The tab rail carries the same at-a-glance
 * state the old checklist did — what's set, what still needs attention — so
 * nothing is lost by showing the first section expanded.
 *
 * `layout="stacked"` drops the vertical rail for a chip row, for narrow columns
 * like the slide-over panel.
 */
export function ConfigTabs({
  sections,
  className,
  layout = 'split',
  layoutId = 'config-tab',
}: {
  sections: ConfigSection[]
  className?: string
  layout?: 'split' | 'stacked'
  layoutId?: string
}) {
  const { t } = useI18n()
  const first = sections.find((s) => s.state !== 'locked') ?? sections[0]
  // Anything outstanding opens first — the customer shouldn't have to hunt for
  // the one thing that's actually blocking them.
  const initial = sections.find((s) => s.state === 'required') ?? first
  const [activeId, setActiveId] = React.useState(initial?.id)

  const active = sections.find((s) => s.id === activeId) ?? first
  if (!active) return null

  const stacked = layout === 'stacked'

  return (
    <div
      className={cn(
        stacked ? 'space-y-5' : 'lg:grid lg:grid-cols-[15.5rem_1fr] lg:items-start lg:gap-10',
        className,
      )}
    >
      {stacked ? (
        <TabRail sections={sections} activeId={active.id} onSelect={setActiveId} layoutId={layoutId} />
      ) : (
        <>
          <div className="lg:hidden">
            <TabRail
              sections={sections}
              activeId={active.id}
              onSelect={setActiveId}
              layoutId={`${layoutId}-sm`}
            />
          </div>
          <div className="hidden lg:block">
            <VerticalRail sections={sections} activeId={active.id} onSelect={setActiveId} layoutId={layoutId} />
          </div>
        </>
      )}

      <div className={cn(!stacked && 'mt-7 min-w-0 lg:mt-0')}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="mb-6">
              <h3 className="headline text-lg text-ink">{active.title ?? active.label}</h3>
              {active.description && (
                <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{active.description}</p>
              )}
            </div>

            {active.body}

            {active.onSave && (
              <div className="mt-8 flex items-center justify-end gap-2 border-t border-line-soft pt-5">
                <Button variant="primary" onClick={active.onSave}>
                  {active.saveLabel ?? t('Save changes')}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** State glyph shared by both rails, so the two layouts read identically. */
function StateMark({ section, size = 'md' }: { section: ConfigSection; size?: 'sm' | 'md' }) {
  const set = section.state === 'set'
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-xl transition-colors',
        size === 'md' ? 'size-9' : 'size-6 rounded-lg',
        set && 'bg-success-soft text-success',
        section.state === 'required' && 'bg-warning-soft text-warning',
        (section.state === 'unset' || section.state === 'locked') && 'bg-veil-strong text-ink-faint',
      )}
    >
      {set ? (
        <Check className={size === 'md' ? 'size-4' : 'size-3'} strokeWidth={2.8} />
      ) : section.state === 'required' ? (
        <CircleAlert className={size === 'md' ? 'size-4' : 'size-3'} />
      ) : section.state === 'locked' ? (
        <Lock className={size === 'md' ? 'size-4' : 'size-3'} />
      ) : (
        <section.icon className={size === 'md' ? 'size-4' : 'size-3'} />
      )}
    </span>
  )
}

function VerticalRail({
  sections,
  activeId,
  onSelect,
  layoutId,
}: {
  sections: ConfigSection[]
  activeId: string
  onSelect: (id: string) => void
  layoutId: string
}) {
  const { t } = useI18n()
  return (
    <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-0.5">
      {sections.map((s) => {
        const active = s.id === activeId
        const locked = s.state === 'locked'
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={active}
            disabled={locked}
            onClick={() => onSelect(s.id)}
            className={cn(
              'relative flex items-center gap-3.5 rounded-2xl px-3 py-3 text-start transition-colors',
              !active && !locked && 'hover:bg-veil',
              locked && 'cursor-not-allowed opacity-55',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-2xl bg-veil-strong"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span className="relative">
              <StateMark section={s} />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className={cn('truncate text-base', active ? 'font-medium text-ink' : 'text-ink-muted')}>
                  {s.label}
                </span>
                {s.state === 'required' && (
                  <span className="shrink-0 text-2xs font-semibold uppercase tracking-wider text-warning-ink">
                    {t('Required')}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs text-ink-subtle">
                {s.state === 'set' && s.summary ? s.summary : s.hint}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Underlined tabs, not pills. Pills carrying a state tick read as status badges
 * — people didn't see them as navigation — so this uses the one shape that is
 * unambiguously a tab strip: a shared baseline with the active item's underline
 * sliding along it. State survives as a small dot beside the label rather than a
 * boxed tick, so it informs without impersonating a badge.
 */
function TabRail({
  sections,
  activeId,
  onSelect,
  layoutId,
}: {
  sections: ConfigSection[]
  activeId: string
  onSelect: (id: string) => void
  layoutId: string
}) {
  return (
    <div className="relative">
      <div
        role="tablist"
        className="no-scrollbar flex items-stretch gap-1 overflow-x-auto border-b border-line"
      >
        {sections.map((s) => {
          const active = s.id === activeId
          const locked = s.state === 'locked'
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              disabled={locked}
              onClick={() => onSelect(s.id)}
              className={cn(
                'group relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3 pb-3 pt-1 text-base transition-colors',
                active ? 'font-medium text-ink' : 'text-ink-subtle hover:text-ink',
                locked && 'cursor-not-allowed opacity-55',
              )}
            >
              <StateDot section={s} />
              {s.label}
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brand"
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** The tab strip's state cue: a dot, deliberately not a boxed tick. */
function StateDot({ section }: { section: ConfigSection }) {
  const { t } = useI18n()
  if (section.state === 'locked') return <Lock className="size-3 shrink-0 text-ink-faint" />
  if (section.state === 'required')
    return <CircleAlert className="size-3.5 shrink-0 text-warning" aria-label={t('Needs attention')} />
  if (section.state === 'set')
    return <span className="size-1.5 shrink-0 rounded-full bg-success" aria-label={t('Configured')} />
  return <span className="size-1.5 shrink-0 rounded-full bg-line-strong" aria-label={t('Not set')} />
}
