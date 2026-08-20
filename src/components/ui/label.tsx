import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { hint?: React.ReactNode; required?: boolean }
>(({ className, children, hint, required, ...props }, ref) => (
  <div className="flex items-baseline justify-between gap-3">
    <LabelPrimitive.Root
      ref={ref}
      className={cn('text-sm font-medium text-ink peer-disabled:opacity-60', className)}
      {...props}
    >
      {children}
      {required && <span className="ms-0.5 text-danger">*</span>}
    </LabelPrimitive.Root>
    {hint && <span className="text-xs text-ink-faint">{hint}</span>}
  </div>
))
Label.displayName = 'Label'

export function Field({
  label,
  hint,
  error,
  description,
  required,
  htmlFor,
  children,
  className,
}: {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  description?: React.ReactNode
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} hint={hint} required={required}>
          {label}
        </Label>
      )}
      {children}
      {description && !error && <p className="text-xs leading-relaxed text-ink-subtle">{description}</p>}
      {error && (
        <p className="text-xs font-medium text-danger-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
