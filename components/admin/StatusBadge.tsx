import { Clock, RefreshCw, Check, X, Ban, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/lib/schemas/application'

const MAP: Record<
  ApplicationStatus,
  { label: string; cls: string; Icon: LucideIcon }
> = {
  PENDING: {
    label: '입금 대기',
    cls: 'bg-amber-100 text-amber-900',
    Icon: Clock,
  },
  PAID: {
    label: '배정 대기',
    cls: 'bg-blue-100 text-blue-900',
    Icon: RefreshCw,
  },
  CONFIRMED: {
    label: '배정 완료',
    cls: 'bg-brand-500 text-white',
    Icon: Check,
  },
  REJECTED: {
    label: '거절',
    cls: 'bg-destructive/15 text-destructive',
    Icon: X,
  },
  CANCELLED: {
    label: '취소',
    cls: 'bg-muted text-muted-foreground',
    Icon: Ban,
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  const { label, cls, Icon } = MAP[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        cls,
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
      {label}
    </span>
  )
}
