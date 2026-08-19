import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useApp } from '@/store/app'

export function Toaster() {
  const theme = useApp((s) => s.theme)
  return (
    <SonnerToaster
      position="bottom-right"
      theme={theme === 'system' ? 'system' : theme}
      offset={20}
      gap={10}
      duration={4200}
      icons={{
        success: <CircleCheck className="size-[18px] text-success" />,
        error: <CircleAlert className="size-[18px] text-danger" />,
        warning: <TriangleAlert className="size-[18px] text-warning" />,
        info: <Info className="size-[18px] text-info" />,
        loading: <LoaderCircle className="size-[18px] animate-spin text-ink-muted" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group flex w-[356px] items-start gap-3 rounded-2xl bg-surface p-3.5 shadow-pop text-ink font-sans',
          title: 'text-base font-semibold leading-snug tracking-[-0.006em]',
          description: 'text-sm text-ink-muted leading-relaxed mt-0.5',
          icon: 'shrink-0 mt-px',
          content: 'min-w-0 flex-1',
          actionButton:
            'shrink-0 rounded-lg bg-onyx px-2.5 h-7 text-xs font-medium text-onyx-fg hover:opacity-90 transition-opacity',
          cancelButton: 'shrink-0 rounded-lg px-2.5 h-7 text-xs font-medium text-ink-muted hover:bg-surface-3',
          closeButton: 'rounded-md text-ink-faint hover:text-ink',
        },
      }}
    />
  )
}

export const toast = sonnerToast
