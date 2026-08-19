import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  className,
  label = 'results',
}: {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (p: number) => void
  className?: string
  label?: string
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages = (): (number | '…')[] => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
    const out: (number | '…')[] = [1]
    const start = Math.max(2, page - 1)
    const end = Math.min(pageCount - 1, page + 1)
    if (start > 2) out.push('…')
    for (let i = start; i <= end; i++) out.push(i)
    if (end < pageCount - 1) out.push('…')
    out.push(pageCount)
    return out
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 px-4 py-3', className)}>
      <p className="text-sm text-ink-subtle">
        <span className="font-medium tabular-nums text-ink">
          {from}–{to}
        </span>{' '}
        of <span className="tabular-nums">{total.toLocaleString('en-US')}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {pages().map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-ink-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors',
                p === page ? 'bg-brand text-brand-fg' : 'text-ink-muted hover:bg-surface-3 hover:text-ink',
              )}
            >
              {p}
            </button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
