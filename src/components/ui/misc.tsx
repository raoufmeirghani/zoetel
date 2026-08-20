import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { cn, copyText } from '@/lib/utils'
import { Button, type ButtonProps } from './button'
import { Tooltip } from './tooltip'

export function Separator({
  className,
  orientation = 'horizontal',
  label,
  ...props
}: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & { label?: React.ReactNode }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-ink-faint">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    )
  }
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-line',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] bg-surface-3 px-1.5',
        'font-sans text-[11px] font-medium text-ink-subtle shadow-[inset_0_-1px_0_hsl(var(--line-strong))]',
        'ltr-island',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

export function CopyButton({
  value,
  label = 'Copy',
  size = 'icon-xs',
  variant = 'ghost',
  className,
  showLabel,
}: {
  value: string
  label?: string
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  className?: string
  showLabel?: boolean
}) {
  const [copied, setCopied] = React.useState(false)
  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (await copyText(value)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }
  return (
    <Tooltip content={copied ? 'Copied' : label}>
      <Button variant={variant} size={size} onClick={onClick} className={className} aria-label={label}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'y' : 'n'}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.14 }}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="text-success" /> : <Copy />}
            {showLabel && (copied ? 'Copied' : label)}
          </motion.span>
        </AnimatePresence>
      </Button>
    </Tooltip>
  )
}

/** Inline monospace value with copy affordance — IDs, tokens, SIP URIs. */
export function Mono({
  children,
  copy,
  className,
  truncate,
}: {
  children: string
  copy?: boolean
  className?: string
  truncate?: boolean
}) {
  return (
    <span className={cn('group/mono inline-flex max-w-full items-center gap-1', className)}>
      <code
        className={cn(
          'rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-muted',
          // An ID, a token or a SIP URI is a left-to-right string whatever the
          // paragraph around it is doing.
          'ltr-island',
          truncate && 'truncate',
        )}
      >
        {children}
      </code>
      {copy && (
        <span className="opacity-0 transition-opacity group-hover/mono:opacity-100">
          <CopyButton value={children} />
        </span>
      )}
    </span>
  )
}

export function CodeBlock({
  code,
  language,
  className,
  filename,
}: {
  code: string
  language?: string
  className?: string
  filename?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl bg-[hsl(240_14%_9%)] dark:bg-surface-inset', className)}>
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2">
        <span className="font-mono text-[11px] text-white/45">{filename ?? language ?? 'shell'}</span>
        <CopyButton value={code} className="text-white/50 hover:bg-white/10 hover:text-white" />
      </div>
      <pre className="ltr-island overflow-x-auto px-3.5 py-3 text-[12.5px] leading-relaxed">
        <code className="font-mono text-[hsl(220_20%_86%)]">{code}</code>
      </pre>
    </div>
  )
}

export const Accordion = AccordionPrimitive.Root

export function AccordionItem({
  value,
  title,
  children,
  className,
  icon,
  meta,
}: {
  value: string
  title: React.ReactNode
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Item value={value} className={cn('border-b border-line last:border-b-0', className)}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full items-center gap-3 py-3.5 text-start transition-colors hover:text-brand-ink [&[data-state=open]>svg:last-child]:rotate-180">
          {icon && <span className="text-ink-faint [&_svg]:size-4">{icon}</span>}
          <span className="flex-1 text-base font-medium text-ink">{title}</span>
          {meta}
          <ChevronDown className="size-4 shrink-0 text-ink-faint transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-4 text-base leading-relaxed text-ink-muted">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

/** Definition list row — the workhorse of every detail panel. */
export function DetailRow({
  label,
  children,
  className,
  hint,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  hint?: React.ReactNode
}) {
  return (
    <div className={cn('flex items-start justify-between gap-6 py-2.5', className)}>
      <dt className="shrink-0 text-sm text-ink-subtle">
        {label}
        {hint}
      </dt>
      <dd className="min-w-0 text-end text-base font-medium text-ink">{children}</dd>
    </div>
  )
}

export function Spinner({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={cn('animate-spin text-ink-faint', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
