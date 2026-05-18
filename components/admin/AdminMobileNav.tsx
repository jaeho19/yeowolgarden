'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Menu,
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  Megaphone,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

export function AdminMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <Link
        href="/admin"
        className="font-heading text-base font-bold tracking-tight text-foreground"
      >
        여월농장 어드민
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="border-b border-border p-4 text-base">
            메뉴
          </SheetTitle>
          <nav
            className="flex flex-col gap-1 p-2"
            aria-label="모바일 어드민 메뉴"
          >
            {NAV.map(({ href, label, Icon }) => {
              const active =
                href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-100 text-brand-900'
                      : 'text-foreground hover:bg-accent'
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
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full"
            >
              로그아웃
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
