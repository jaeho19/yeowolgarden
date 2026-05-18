'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/applications', label: '신청 관리', icon: '📋' },
  { href: '/admin/plots', label: '구획 현황', icon: '🗺️' },
  { href: '/admin/announcements', label: '공지 관리', icon: '📢' },
  { href: '/admin/settings', label: '설정', icon: '⚙️' },
] as const

export function AdminMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
      <Link href="/admin" className="flex items-center gap-2 font-semibold">
        <span className="text-lg" role="img" aria-hidden>
          🌱
        </span>
        여월농장 Admin
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
            {NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-100 text-brand-900'
                      : 'text-foreground hover:bg-accent'
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
