import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from './toggle'
import { SkeletonTable } from './skeleton'
import { useI18n } from '@/lib/i18n'
import { useIsHandheld } from '@/hooks/use-media'

export interface Column<T> {
  id: string
  header: React.ReactNode
  cell: (row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  sortValue?: (row: T) => string | number
  className?: string
  headerClassName?: string
  /** Hidden below the given breakpoint to keep small screens legible. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /**
   * What this column becomes when the table turns into a list on a phone.
   *
   * A table is a two-dimensional idea and a phone is one column wide, so below
   * `sm` the rows are rebuilt as list items instead of being scrolled sideways
   * or silently clipped. Each row gets a title, a value on the same line, and a
   * quiet meta line under it:
   *
   * - `primary`   the title
   * - `trailing`  right-aligned on the title line — a figure, a status
   * - `meta`      joined into the second line
   * - `omit`      dropped; some columns only make sense in a grid
   *
   * A table that annotates nothing keeps the old behaviour, so this is additive.
   */
  mobile?: 'primary' | 'trailing' | 'meta' | 'omit'
}

const hideMap = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
  '2xl': 'hidden 2xl:table-cell',
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  empty,
  onRowClick,
  selectable,
  selected,
  onSelectedChange,
  rowClassName,
  stickyHeader = true,
  compact,
  initialSort,
  className,
  footer,
  animateRows = true,
}: {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  empty?: React.ReactNode
  onRowClick?: (row: T) => void
  selectable?: boolean
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  rowClassName?: (row: T) => string
  stickyHeader?: boolean
  compact?: boolean
  initialSort?: { id: string; dir: 'asc' | 'desc' }
  className?: string
  footer?: React.ReactNode
  animateRows?: boolean
}) {
  const { t } = useI18n()
  const handheld = useIsHandheld()
  const [sort, setSort] = React.useState<{ id: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null)

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.id === sort.id)
    if (!col?.sortValue) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, sort, columns])

  const allSelected = selectable && rows.length > 0 && selected?.length === rows.length
  const someSelected = selectable && (selected?.length ?? 0) > 0 && !allSelected

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return
    setSort((s) =>
      s?.id === col.id ? (s.dir === 'asc' ? { id: col.id, dir: 'desc' } : null) : { id: col.id, dir: 'asc' },
    )
  }

  if (loading) {
    return (
      <div className={cn('overflow-hidden', className)}>
        <SkeletonTable rows={compact ? 5 : 7} cols={Math.min(columns.length, 6)} />
      </div>
    )
  }

  if (!rows.length && empty) return <>{empty}</>

  // On a phone, a table whose columns declare their mobile role becomes a list.
  const annotated = columns.some((c) => c.mobile)
  if (handheld && annotated) {
    const primary = columns.find((c) => c.mobile === 'primary') ?? columns[0]
    const trailing = columns.filter((c) => c.mobile === 'trailing')
    const meta = columns.filter((c) => c.mobile === 'meta')

    return (
      <div className={cn('w-full', className)}>
        <ul className="divide-y divide-line-soft">
          {sorted.map((row, i) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                disabled={!onRowClick}
                className={cn(
                  '-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-xl px-2 py-3.5 text-start',
                  onRowClick && 'transition-colors active:bg-veil',
                  rowClassName?.(row),
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-ink">{primary.cell(row, i)}</span>
                  {meta.length > 0 && (
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-subtle">
                      {meta.map((c, k) => (
                        <React.Fragment key={c.id}>
                          {k > 0 && (
                            <span className="text-ink-faint/60" aria-hidden>
                              ·
                            </span>
                          )}
                          <span className="min-w-0 truncate">{c.cell(row, i)}</span>
                        </React.Fragment>
                      ))}
                    </span>
                  )}
                </span>
                {trailing.length > 0 && (
                  <span className="flex shrink-0 flex-col items-end gap-1 text-sm text-ink-muted">
                    {trailing.map((c) => (
                      <span key={c.id}>{c.cell(row, i)}</span>
                    ))}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {footer && <div className="border-t border-line-soft pt-3">{footer}</div>}
      </div>
    )
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-separate border-spacing-0 text-start">
        <thead className={cn(stickyHeader && 'sticky top-14 z-10 bg-canvas')}>
          <tr>
            {selectable && (
              <th className="hidden w-10 border-b border-line px-3 pb-2.5 sm:table-cell sm:px-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected || undefined}
                  onCheckedChange={(v) => onSelectedChange?.(v ? rows.map((r) => r.id) : [])}
                  aria-label={t('Select all rows')}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.id}
                style={{ width: col.width }}
                className={cn(
                  'whitespace-nowrap border-b border-line px-3 pb-2.5 text-2xs font-semibold uppercase tracking-[0.09em] text-ink-faint sm:px-4',
                  col.align === 'right' && 'text-end',
                  col.align === 'center' && 'text-center',
                  col.hideBelow && hideMap[col.hideBelow],
                  col.headerClassName,
                )}
              >
                {col.sortable ? (
                  <button
                    onClick={() => toggleSort(col)}
                    className={cn(
                      'group inline-flex items-center gap-1 transition-colors hover:text-ink',
                      // A 'right'-aligned column is the trailing, numeric one; its sort
                      // caret belongs on the side the numbers run away from.
                      col.align === 'right' && 'flex-row-reverse',
                    )}
                  >
                    {col.header}
                    {sort?.id === col.id ? (
                      sort.dir === 'asc' ? (
                        <ArrowUp className="size-3 text-brand" />
                      ) : (
                        <ArrowDown className="size-3 text-brand" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {sorted.map((row, i) => {
              const isSelected = selected?.includes(row.id)
              const Row = animateRows ? motion.tr : 'tr'
              const motionProps = animateRows
                ? {
                    layout: 'position' as const,
                    initial: { opacity: 0, y: 4 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, height: 0 },
                    transition: {
                      duration: 0.24,
                      delay: Math.min(i * 0.018, 0.28),
                      ease: [0.16, 1, 0.3, 1] as const,
                    },
                  }
                : {}
              return (
                <Row
                  key={row.id}
                  {...motionProps}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'group/row transition-colors duration-100',
                    onRowClick && 'cursor-pointer',
                    isSelected ? 'bg-brand-softer' : 'hover:bg-veil',
                    rowClassName?.(row),
                  )}
                >
                  {selectable && (
                    <td
                      className="hidden border-b border-line-soft px-3 py-3 sm:table-cell sm:px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(v) =>
                          onSelectedChange?.(
                            v ? [...(selected ?? []), row.id] : (selected ?? []).filter((id) => id !== row.id),
                          )
                        }
                        aria-label={`${row.id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        'border-b border-line-soft px-3 align-middle text-base text-ink sm:px-4',
                        compact ? 'py-2.5' : 'py-3.5',
                        col.align === 'right' && 'text-end',
                        col.align === 'center' && 'text-center',
                        col.hideBelow && hideMap[col.hideBelow],
                        col.className,
                      )}
                    >
                      {col.cell(row, i)}
                    </td>
                  ))}
                </Row>
              )
            })}
          </AnimatePresence>
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-3">
                {footer}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

/** Two-line cell: strong primary value with a quiet secondary line. */
export function CellStack({
  primary,
  secondary,
  mono,
}: {
  primary: React.ReactNode
  secondary?: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className={cn('truncate font-medium text-ink', mono && 'tnum font-mono text-sm')}>{primary}</div>
      {secondary && <div className="mt-0.5 truncate text-xs text-ink-subtle">{secondary}</div>}
    </div>
  )
}
