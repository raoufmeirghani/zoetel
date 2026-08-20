import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDirSign, useI18n } from '@/lib/i18n'

/**
 * A detached, floating slide-over — the same physical language as the nav rail:
 * inset from the window edges, its own rounded shell, its own shadow. It is
 * deliberately *not* a modal: there's no scrim and no focus trap, so the list
 * behind it stays readable and clickable and you can walk down a set of records
 * without closing anything.
 *
 * Escape closes it, as does the close button. Pointer-down outside is ignored,
 * because "outside" is usually the next row in the list — dismissing there
 * would fight the panel's whole purpose.
 */
export function SidePanel({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  meta,
  fullHref,
  fullLabel = 'Open full page',
  footer,
  children,
  width = 'var(--panel-w)',
}: {
  open: boolean
  onClose: () => void
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** A row of chips or pills under the title. */
  meta?: React.ReactNode
  /** Deep link to the record's own page, for the times a panel isn't enough. */
  fullHref?: string
  fullLabel?: string
  footer?: React.ReactNode
  children?: React.ReactNode
  width?: string
}) {
  const { t } = useI18n()
  const dirSign = useDirSign()
  // Lets the page column drop its max-width so the list keeps usable room
  // beside the panel instead of being squeezed into the centred column.
  React.useEffect(() => {
    if (!open) return
    document.documentElement.dataset.sidePanel = 'open'
    return () => {
      delete document.documentElement.dataset.sidePanel
    }
  }, [open])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()} modal={false}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Content
              forceMount
              aria-describedby={undefined}
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
              asChild
            >
              <motion.aside
                initial={{ opacity: 0, x: 28 * dirSign }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 28 * dirSign, transition: { duration: 0.16 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
                style={{ maxWidth: `calc(100vw - 1.5rem)`, width }}
                className={cn(
                  'glass-panel chrome-solid-sm fixed inset-y-3 end-3 z-40 flex flex-col overflow-hidden rounded-[26px]',
                  'focus:outline-none',
                )}
              >
                <header className="shrink-0 px-6 pb-5 pt-6 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {eyebrow && <div className="mb-2 flex items-center gap-2">{eyebrow}</div>}
                      <DialogPrimitive.Title className="headline truncate text-xl text-ink">
                        {title}
                      </DialogPrimitive.Title>
                      {subtitle && <p className="mt-1 truncate text-sm text-ink-subtle">{subtitle}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {fullHref && (
                        <Button variant="ghost" size="icon-sm" asChild aria-label={fullLabel} title={fullLabel}>
                          <Link to={fullHref}>
                            <ArrowUpRight />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={t('Close panel')}>
                        <X />
                      </Button>
                    </div>
                  </div>
                  {meta && <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div>}
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-7">
                  {children}
                </div>

                {footer && (
                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line-soft px-6 py-4 sm:px-7">
                    {footer}
                  </div>
                )}
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
