import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/lib/schemas/application'

const MAP: Record<
  ApplicationStatus,
  { label: string; cls: string; icon: string }
> = {
  PENDING: {
    label: '입금 대기',
    cls: 'bg-amber-100 text-amber-900',
    icon: '⏳',
  },
  PAID: {
    label: '배정 대기',
    cls: 'bg-blue-100 text-blue-900',
    icon: '🔄',
  },
  CONFIRMED: {
    label: '배정 완료',
    cls: 'bg-brand-500 text-white',
    icon: '✅',
  },
  REJECTED: {
    label: '거절',
    cls: 'bg-destructive/15 text-destructive',
    icon: '❌',
  },
  CANCELLED: {
    label: '취소',
    cls: 'bg-muted text-muted-foreground',
    icon: '🚫',
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  const m = MAP[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        m.cls,
        className
      )}
    >
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  )
}
