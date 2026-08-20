import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDirSign, useI18n } from '@/lib/i18n'
import { useIsHandheld } from '@/hooks/use-media'

/**
 * A record opened beside the list, or over it.
 *
 * On a wide screen it is a detached slide-over in the same physical language as
 * the nav rail: inset from the window edges, its own rounded shell, its own
 * shadow. Deliberately *not* modal — no scrim, no focus trap — so the list
 * behind it stays readable and clickable and you can walk down a set of records
 * without closing anything.
 *
 * On a phone that arrangement makes no sense: there is no room beside the list,
 * and a floating card inset on four sides reads as a shrunken desktop panel. So
 * it becomes a bottom sheet instead — it rises from the bottom edge, spans the
 * full width, keeps only its top corners, carries a grab handle, and can be
 * flung downward to dismiss. That is what a phone means by "opening a record",
 * and it is the same component either way so behaviour can't drift between them.
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
  const handheld = useIsHandheld()
  const drag = useDragControls()

  // Lets the page column drop its max-width so the list keeps usable room
  // beside the panel instead of being squeezed into the centred column.
  React.useEffect(() => {
    if (!open) return
    document.documentElement.dataset.sidePanel = 'open'
    return () => {
      delete document.documentElement.dataset.sidePanel
    }
  }, [open])

  // A sheet covers the page, so the page behind it must not scroll underneath.
  React.useEffect(() => {
    if (!open || !handheld) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, handheld])

  const sheet = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%', transition: { duration: 0.2 } },
  }
  const slide = {
    initial: { opacity: 0, x: 28 * dirSign },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 28 * dirSign, transition: { duration: 0.16 } },
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()} modal={handheld}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* A scrim only on the phone, where the sheet is genuinely modal. */}
            {handheld && (
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] dark:bg-black/55"
              />
            )}

            <DialogPrimitive.Content
              forceMount
              aria-describedby={undefined}
              onPointerDownOutside={(e) => !handheld && e.preventDefault()}
              onInteractOutside={(e) => !handheld && e.preventDefault()}
              asChild
            >
              <motion.aside
                {...(handheld ? sheet : slide)}
                transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
                style={handheld ? undefined : { maxWidth: `calc(100vw - 1.5rem)`, width }}
                // Fling downward to dismiss. `dragListener={false}` keeps the
                // gesture on the handle and header, so a swipe inside the body
                // scrolls the content rather than closing the record.
                drag={handheld ? 'y' : false}
                dragControls={drag}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 600) onClose()
                }}
                className={cn(
                  'glass-panel chrome-solid-sm fixed z-50 flex flex-col overflow-hidden focus:outline-none',
                  handheld
                    ? 'inset-x-0 bottom-0 top-[max(2.5rem,env(safe-area-inset-top))] rounded-t-[26px]'
                    : 'inset-y-3 end-3 z-40 rounded-[26px]',
                )}
              >
                {/* The grab handle is also the drag surface — on a phone the
                    header is a legitimate place to start the gesture. */}
                {handheld && (
                  <div
                    onPointerDown={(e) => drag.start(e)}
                    className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
                  >
                    <span aria-hidden className="h-1 w-10 rounded-full bg-line-strong" />
                  </div>
                )}

                <header
                  onPointerDown={(e) => handheld && drag.start(e)}
                  className={cn('shrink-0 px-5 sm:px-7', handheld ? 'touch-none pb-4 pt-2' : 'pb-5 pt-6')}
                >
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

                <div
                  className={cn(
                    'sheet-scroll min-h-0 flex-1 overflow-y-auto px-5 sm:px-7',
                    // Clears the home indicator when there is no footer to do it.
                    footer ? 'pb-6' : 'pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]',
                  )}
                >
                  {children}
                </div>

                {footer && (
                  <div
                    className={cn(
                      'flex shrink-0 items-center justify-between gap-3 border-t border-line-soft px-5 sm:px-7',
                      'py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4',
                    )}
                  >
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
