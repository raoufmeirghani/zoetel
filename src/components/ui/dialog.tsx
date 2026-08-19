import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

const spring = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 }

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  icon,
  tone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ReactNode
  tone?: 'brand' | 'danger' | 'success' | 'warning'
}) {
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' }
  const tones = {
    brand: 'bg-brand-soft text-brand-ink',
    danger: 'bg-danger-soft text-danger-ink',
    success: 'bg-success-soft text-success-ink',
    warning: 'bg-warning-soft text-warning-ink',
  }
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[3px] dark:bg-black/55"
              />
            </DialogPrimitive.Overlay>
            {/* The panel is centred by the grid wrapper rather than a transform, so
                Framer Motion's inline transform can't fight the centring. */}
            <DialogPrimitive.Content
              forceMount
              className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 focus:outline-none"
              // Radix forces pointer-events:auto on Content, so dismiss-on-backdrop
              // is handled here rather than by the overlay underneath.
              onClick={(e) => {
                if (e.target === e.currentTarget) onOpenChange(false)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.13 } }}
                transition={spring}
                className={cn(
                  'relative flex w-full flex-col',
                  'glass-panel max-h-[calc(100dvh-2rem)] rounded-3xl',
                  widths[size],
                )}
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
                  {(title || icon) && (
                    <div className="mb-4">
                      {icon && (
                        <span
                          className={cn(
                            'mb-3.5 flex size-10 items-center justify-center rounded-xl [&_svg]:size-5',
                            tones[tone ?? 'brand'],
                          )}
                        >
                          {icon}
                        </span>
                      )}
                      <DialogPrimitive.Title className="text-lg font-semibold tracking-[-0.014em] text-ink">
                        {title}
                      </DialogPrimitive.Title>
                      {description && (
                        <DialogPrimitive.Description className="mt-1.5 text-base leading-relaxed text-ink-muted">
                          {description}
                        </DialogPrimitive.Description>
                      )}
                    </div>
                  )}
                  {children}
                </div>
                {footer && (
                  <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-6 py-4">
                    {footer}
                  </div>
                )}
                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-4 top-4 text-ink-faint"
                    aria-label="Close"
                  >
                    <X />
                  </Button>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  icon,
  children,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      icon={icon}
      tone={destructive ? 'danger' : 'brand'}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'max-w-lg',
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  side?: 'right' | 'bottom'
  width?: string
}) {
  const isBottom = side === 'bottom'
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[3px] dark:bg-black/55"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={isBottom ? { y: '100%' } : { x: '100%' }}
                animate={isBottom ? { y: 0 } : { x: 0 }}
                exit={isBottom ? { y: '100%' } : { x: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
                className={cn(
                  'glass-panel fixed z-50 flex flex-col focus:outline-none',
                  isBottom
                    ? 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl'
                    : cn('inset-y-0 right-0 w-full sm:rounded-l-3xl', width),
                )}
              >
                {isBottom && <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line-strong" />}
                {title && (
                  <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
                    <div>
                      <DialogPrimitive.Title className="text-lg font-semibold tracking-[-0.014em] text-ink">
                        {title}
                      </DialogPrimitive.Title>
                      {description && (
                        <DialogPrimitive.Description className="mt-1 text-base text-ink-muted">
                          {description}
                        </DialogPrimitive.Description>
                      )}
                    </div>
                    <DialogPrimitive.Close asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Close">
                        <X />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
                {footer && (
                  <div className="flex items-center justify-end gap-2 border-t border-line-soft px-6 py-4">
                    {footer}
                  </div>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
