import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Menu = DropdownMenu.Root
export const MenuTrigger = DropdownMenu.Trigger

const panel = [
  'z-50 min-w-52 overflow-hidden rounded-xl bg-surface p-1 shadow-pop',
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]',
  'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
  'duration-150',
].join(' ')

export function MenuContent({
  children,
  className,
  align = 'end',
  sideOffset = 6,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content align={align} sideOffset={sideOffset} className={cn(panel, className)} {...props}>
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  )
}

const itemClass = [
  'group relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-base text-ink outline-none',
  'transition-colors duration-100',
  'data-[highlighted]:bg-surface-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-faint data-[highlighted]:[&_svg]:text-ink-muted',
].join(' ')

export function MenuItem({
  className,
  destructive,
  shortcut,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> & { destructive?: boolean; shortcut?: string }) {
  return (
    <DropdownMenu.Item
      className={cn(
        itemClass,
        destructive && 'text-danger-ink data-[highlighted]:bg-danger-soft [&_svg]:text-danger/70',
        className,
      )}
      {...props}
    >
      {children}
      {shortcut && <span className="ml-auto text-2xs tracking-wide text-ink-faint">{shortcut}</span>}
    </DropdownMenu.Item>
  )
}

export function MenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.CheckboxItem>) {
  return (
    <DropdownMenu.CheckboxItem className={cn(itemClass, 'pl-8', className)} {...props}>
      <DropdownMenu.ItemIndicator className="absolute left-2.5">
        <Check className="!text-brand" />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.CheckboxItem>
  )
}

export function MenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.RadioItem>) {
  return (
    <DropdownMenu.RadioItem className={cn(itemClass, 'pl-8', className)} {...props}>
      <DropdownMenu.ItemIndicator className="absolute left-3">
        <span className="block size-1.5 rounded-full bg-brand" />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.RadioItem>
  )
}

export const MenuRadioGroup = DropdownMenu.RadioGroup

export function MenuLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenu.Label>) {
  return (
    <DropdownMenu.Label
      className={cn(
        'px-2.5 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wider text-ink-faint',
        className,
      )}
      {...props}
    />
  )
}

export function MenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Separator>) {
  return <DropdownMenu.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />
}

export function MenuSub({
  label,
  children,
  icon,
}: {
  label: React.ReactNode
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={cn(itemClass, 'data-[state=open]:bg-surface-3')}>
        {icon}
        {label}
        <ChevronRight className="ml-auto" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className={panel} sideOffset={4} alignOffset={-4}>
          {children}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  )
}
