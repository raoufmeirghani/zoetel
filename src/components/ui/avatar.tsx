import { cn, initials } from '@/lib/utils'

export function Avatar({
  name,
  hue = 249,
  size = 'md',
  className,
  src,
  status,
}: {
  name: string
  hue?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  src?: string
  status?: 'online' | 'offline'
}) {
  const sizes = {
    xs: 'size-5 text-[9px]',
    sm: 'size-6 text-[10px]',
    md: 'size-8 text-xs',
    lg: 'size-10 text-sm',
    xl: 'size-14 text-lg',
  }
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-tight',
          sizes[size],
        )}
        style={{
          background: `linear-gradient(145deg, hsl(${hue} 72% 62%), hsl(${hue + 26} 68% 48%))`,
          color: 'white',
        }}
        aria-hidden={!!src}
      >
        {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials(name)}
      </span>
      {status && (
        <span
          className={cn(
            'absolute -bottom-px -right-px rounded-full ring-2 ring-surface',
            size === 'xs' || size === 'sm' ? 'size-1.5' : 'size-2.5',
            status === 'online' ? 'bg-success' : 'bg-ink-faint',
          )}
        />
      )}
    </span>
  )
}

export function AvatarStack({
  people,
  max = 4,
  size = 'sm',
}: {
  people: { name: string; hue?: number }[]
  max?: number
  size?: 'xs' | 'sm' | 'md'
}) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  const sizes = { xs: 'size-5 text-[9px]', sm: 'size-6 text-[10px]', md: 'size-8 text-xs' }
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <Avatar
          key={p.name}
          name={p.name}
          hue={p.hue}
          size={size}
          className={cn('ring-2 ring-surface', i > 0 && '-ml-2')}
        />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            '-ml-2 inline-flex items-center justify-center rounded-full bg-surface-3 font-semibold text-ink-muted ring-2 ring-surface',
            sizes[size],
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}
