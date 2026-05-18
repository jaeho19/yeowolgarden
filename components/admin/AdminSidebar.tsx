'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTransition } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  Megaphone,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV: ReadonlyArray<{
  href: string
  label: string
  Icon: LucideIcon
}> = [
  { href: '/admin', label: '대시보드', Icon: LayoutDashboard },
  { href: '/admin/applications', label: '신청 관리', Icon: ClipboardList },
  { href: '/admin/plots', label: '구획 현황', Icon: MapIcon },
  { href: '/admin/announcements', label: '공지 관리', Icon: Megaphone },
  { href: '/admin/settings', label: '설정', Icon: Settings },
] as const

export function AdminSidebar() {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: '/admin/login' })
    })
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-secondary md:flex md:flex-col">
      <div className="border-b border-border p-4">
        <Link
          href="/admin"
          className="font-heading text-base font-bold tracking-tight text-foreground"
        >
          여월농장
        </Link>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
          어드민 콘솔
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4" aria-label="어드민 메뉴">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-100 text-brand-900'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? '로그아웃 중...' : '로그아웃'}
        </Button>
        <Link
          href="/"
          className="mt-2 block text-center text-[11px] text-muted-foreground hover:text-foreground"
        >
          ← 공개 사이트로
        </Link>
      </div>
    </aside>
  )
}
