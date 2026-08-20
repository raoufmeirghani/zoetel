import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './button'
import { Stepper, type Step } from './stepper'
import { cn } from '@/lib/utils'
import { useDirSign, useI18n } from '@/lib/i18n'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A multi-step flow in a near-fullscreen sheet — 90% of the viewport, so the
 * page stays visible at the edges and the flow still reads as something you
 * stepped into rather than navigated to.
 *
 * The shell owns the chrome (stepper, close, footer) and animates step changes
 * horizontally in the direction of travel. The caller owns the step state, so a
 * step can validate before it lets go.
 */
export function FlowDialog({
  open,
  onOpenChange,
  title,
  steps,
  step,
  onStepClick,
  direction = 1,
  children,
  footer,
  className,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: React.ReactNode
  steps: Step[]
  step: number
  /** Allows jumping back to a completed step from the stepper. */
  onStepClick?: (i: number) => void
  /** 1 when moving forward, -1 when going back — sets the slide direction. */
  direction?: 1 | -1
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  const { t } = useI18n()
  const dirSign = useDirSign()
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
                className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[3px] dark:bg-black/60"
              />
            </DialogPrimitive.Overlay>
            {/* Centred by the grid wrapper, so Framer's transform is free for
                the entrance and can't fight the centring. */}
            <DialogPrimitive.Content
              forceMount
              aria-describedby={undefined}
              className="fixed inset-0 z-50 grid place-items-center focus:outline-none"
            >
              {/* A 90% window is right on a desktop and wrong on a phone, where
                  the eight pixels of visible page behind it read as a rendering
                  mistake. Below `sm` it takes the whole screen and keeps only
                  its top corners, which is what a phone means by a flow. */}
              <motion.div
                initial={{ opacity: 0, scale: 0.975, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: 8, transition: { duration: 0.14 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.75 }}
                className={cn(
                  'glass-panel chrome-solid-sm flex flex-col overflow-hidden',
                  'h-dvh w-screen rounded-none',
                  'sm:h-[90dvh] sm:w-[90vw] sm:max-w-5xl sm:rounded-[28px]',
                  className,
                )}
              >
                <header className="shrink-0 border-b border-line-soft px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:px-8 sm:py-5">
                  <div className="flex items-center justify-between gap-6">
                    <DialogPrimitive.Title className="headline truncate text-lg text-ink">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={t('Close')} className="shrink-0">
                        <X />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                  <Stepper steps={steps} current={step} onStepClick={onStepClick} className="mt-5" />
                </header>

                <div className="sheet-scroll min-h-0 flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 26 * dirSign }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -26 * dirSign, transition: { duration: 0.14 } }}
                      transition={{ duration: 0.32, ease: EASE }}
                      className="mx-auto max-w-2xl px-5 py-7 sm:px-8 sm:py-10"
                    >
                      {children}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {footer && (
                  <footer className="shrink-0 border-t border-line-soft px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-4">
                    <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">{footer}</div>
                  </footer>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

/**
 * The step heading pattern used inside a flow — a question, then the reason it
 * is being asked. Keeps every step's opening beat identical.
 */
export function FlowStep({
  title,
  lede,
  children,
}: {
  title: React.ReactNode
  lede?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="headline text-2xl text-ink sm:text-3xl">{title}</h2>
      {lede && <p className="mt-3 text-md leading-relaxed text-ink-muted">{lede}</p>}
      <div className="mt-8">{children}</div>
    </div>
  )
}
