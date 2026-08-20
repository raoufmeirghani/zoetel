import * as React from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input, inputBase } from './input'
import { Button } from './button'
import { COUNTRIES } from '@/lib/data/countries'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { useI18n } from '@/lib/i18n'

/* ── Search ─────────────────────────────────────────────── */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  autoFocus,
  size = 'md',
  onClear,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClear?: () => void
}) {
  const { t } = useI18n()
  return (
    <Input
      inputSize={size}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      leading={<Search />}
      trailing={
        value ? (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              onChange('')
              onClear?.()
            }}
            aria-label={t('Clear search')}
          >
            <X />
          </Button>
        ) : undefined
      }
    />
  )
}

/* ── OTP ────────────────────────────────────────────────── */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  className,
}: {
  length?: number
  value: string
  onChange: (v: string) => void
  onComplete?: (v: string) => void
  error?: boolean
  className?: string
}) {
  const { t } = useI18n()
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  const setChar = (i: number, char: string) => {
    const next = (value.padEnd(length, ' ').slice(0, i) + char + value.padEnd(length, ' ').slice(i + 1))
      .replace(/\s/g, '')
      .slice(0, length)
    onChange(next)
    if (char && i < length - 1) refs.current[i + 1]?.focus()
    if (next.length === length) onComplete?.(next)
  }

  return (
    <div className={cn('flex gap-2', className)} role="group" aria-label={t('One-time code')}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={value[i] ?? ''}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '')
            if (v.length > 1) {
              onChange(v.slice(0, length))
              refs.current[Math.min(v.length, length - 1)]?.focus()
              if (v.length >= length) onComplete?.(v.slice(0, length))
            } else setChar(i, v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
            if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onPaste={(e) => {
            e.preventDefault()
            const v = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            onChange(v)
            if (v.length >= length) onComplete?.(v)
          }}
          className={cn(
            inputBase,
            'size-12 rounded-xl text-center text-lg font-semibold tabular-nums',
            error && 'shadow-[0_0_0_1px_hsl(var(--danger)),0_0_0_4px_hsl(var(--danger)/0.12)]',
          )}
        />
      ))}
    </div>
  )
}

/* ── Phone ──────────────────────────────────────────────── */
export function PhoneInput({
  country,
  onCountryChange,
  value,
  onChange,
  className,
  placeholder = '10 1234 5678',
}: {
  country: string
  onCountryChange: (c: string) => void
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const meta = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0]
  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-lg bg-surface',
        'shadow-[0_0_0_1px_hsl(var(--line-strong))] transition-shadow',
        'focus-within:shadow-[0_0_0_1px_hsl(var(--brand)),0_0_0_4px_hsl(var(--brand)/0.14)]',
        className,
      )}
    >
      <Select value={country} onValueChange={onCountryChange}>
        <SelectTrigger className="w-auto shrink-0 rounded-none border-0 bg-surface-2 pe-2 ps-3 shadow-none hover:bg-surface-3 focus-visible:shadow-none data-[state=open]:shadow-none">
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <span className="text-md leading-none">{meta.flag}</span>
              <span className="text-sm tabular-nums text-ink-muted">{meta.dial}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-64">
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code} hint={c.dial}>
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                {c.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="w-px bg-line" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ''))}
        placeholder={placeholder}
        inputMode="tel"
        className="h-9 min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </div>
  )
}

/* ── Currency ───────────────────────────────────────────── */
export function CurrencyInput({
  value,
  onChange,
  symbol = '$',
  suffix,
  className,
  min = 0,
  max,
  size = 'md',
  presets,
}: {
  value: number
  onChange: (v: number) => void
  symbol?: string
  suffix?: string
  className?: string
  min?: number
  max?: number
  size?: 'md' | 'lg'
  presets?: number[]
}) {
  const [text, setText] = React.useState(String(value))
  React.useEffect(() => setText(String(value)), [value])

  const commit = (raw: string) => {
    const n = Number(raw.replace(/[^0-9.]/g, ''))
    if (Number.isNaN(n)) return onChange(min)
    onChange(Math.min(max ?? Infinity, Math.max(min, n)))
  }

  return (
    <div className={cn('space-y-2.5', className)}>
      <div
        className={cn(
          'flex items-center rounded-xl bg-surface shadow-[0_0_0_1px_hsl(var(--line-strong))] transition-shadow',
          'focus-within:shadow-[0_0_0_1px_hsl(var(--brand)),0_0_0_4px_hsl(var(--brand)/0.14)]',
          size === 'lg' ? 'h-12' : 'h-9',
        )}
      >
        <span className={cn('ps-3.5 font-medium text-ink-subtle', size === 'lg' ? 'text-lg' : 'text-base')}>
          {symbol}
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(e) => e.key === 'Enter' && commit(text)}
          inputMode="decimal"
          className={cn(
            'min-w-0 flex-1 bg-transparent px-2 font-semibold tabular-nums text-ink focus:outline-none',
            size === 'lg' ? 'text-lg' : 'text-base',
          )}
        />
        {suffix && <span className="pe-3.5 text-sm text-ink-faint">{suffix}</span>}
      </div>
      {presets && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-sm font-medium tabular-nums transition-colors',
                value === p
                  ? 'bg-brand text-brand-fg'
                  : 'bg-veil-strong text-ink-muted hover:bg-line hover:text-ink',
              )}
            >
              {symbol}
              {p.toLocaleString('en-US')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Number stepper ─────────────────────────────────────── */
export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  suffix,
  className,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  className?: string
}) {
  const { t } = useI18n()
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)))
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center rounded-lg bg-surface shadow-[0_0_0_1px_hsl(var(--line-strong))]',
        'focus-within:shadow-[0_0_0_1px_hsl(var(--brand)),0_0_0_4px_hsl(var(--brand)/0.14)]',
        className,
      )}
    >
      <button
        onClick={() => set(value - step)}
        disabled={value <= min}
        className="grid h-full w-8 place-items-center rounded-s-lg text-ink-muted transition-colors hover:bg-surface-3 disabled:opacity-35"
        aria-label={t('Decrease')}
      >
        <Minus className="size-3.5" />
      </button>
      <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1 px-1">
        <input
          value={value}
          onChange={(e) => set(Number(e.target.value.replace(/\D/g, '')) || min)}
          inputMode="numeric"
          className="w-full min-w-8 bg-transparent text-center text-base font-medium tabular-nums text-ink focus:outline-none"
        />
        {suffix && <span className="shrink-0 text-xs text-ink-faint">{suffix}</span>}
      </div>
      <button
        onClick={() => set(value + step)}
        disabled={value >= max}
        className="grid h-full w-8 place-items-center rounded-e-lg text-ink-muted transition-colors hover:bg-surface-3 disabled:opacity-35"
        aria-label={t('Increase')}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

/* ── Chip toggle group (capabilities, events) ───────────── */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple = true,
  className,
  size = 'md',
}: {
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode; hint?: string }[]
  value: T[]
  onChange: (v: T[]) => void
  multiple?: boolean
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((o) => {
        const active = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() =>
              multiple
                ? onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])
                : onChange(active ? [] : [o.value])
            }
            className={cn(
              'relative inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150',
              size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 px-2.5 text-sm',
              active
                ? 'bg-brand text-brand-fg shadow-[0_1px_2px_rgb(17_18_28/0.14)]'
                : 'bg-surface text-ink-muted shadow-[inset_0_0_0_1px_hsl(var(--line-strong))] hover:bg-surface-2 hover:text-ink',
              '[&_svg]:size-3.5',
            )}
          >
            {o.icon}
            {o.label}
            {active && (
              <motion.span
                layoutId={undefined}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="sr-only"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
