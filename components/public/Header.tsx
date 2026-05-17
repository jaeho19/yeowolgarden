'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LinkButton } from '@/components/public/LinkButton'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: '홈' },
  { href: '/plots', label: '분양 안내' },
  { href: '/access', label: '오시는 길' },
  { href: '/about', label: '농원 소개' },
  { href: '/gallery', label: '갤러리' },
  { href: '/faq', label: 'FAQ' },
  { href: '/notice', label: '공지' },
] as const

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
          aria-label="여월농장 홈"
        >
          <span className="text-2xl" role="img" aria-hidden>
            🌱
          </span>
          <span>여월농장</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="주 메뉴"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  active
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Apply CTA (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <LinkButton href="/apply" size="sm">
            분양 신청
          </LinkButton>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-6 pt-6 pb-2 text-lg">메뉴</SheetTitle>
              <nav
                className="flex flex-col gap-1 px-3 pb-6"
                aria-label="모바일 메뉴"
              >
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'px-3 py-2.5 text-base font-medium rounded-md transition-colors',
                        active
                          ? 'text-brand-700 bg-brand-50'
                          : 'text-foreground hover:bg-accent'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
                <div className="mt-4 px-3">
                  <LinkButton
                    href="/apply"
                    onClick={() => setOpen(false)}
                    className="w-full"
                    size="lg"
                  >
                    분양 신청
                  </LinkButton>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
