'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/applications', label: '신청 관리', icon: '📋' },
  { href: '/admin/plots', label: '구획 현황', icon: '🗺️' },
  { href: '/admin/announcements', label: '공지 관리', icon: '📢' },
  { href: '/admin/settings', label: '설정', icon: '⚙️' },
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
    <aside className="hidden w-56 shrink-0 border-r border-border bg-muted/30 md:flex md:flex-col">
      <div className="border-b border-border p-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <span className="text-xl" role="img" aria-hidden>
            🌱
          </span>
          여월농장
        </Link>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Admin Console
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4" aria-label="어드민 메뉴">
        {NAV.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-100 text-brand-900'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
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
