'use client'

import { usePathname } from 'next/navigation'
import { LinkButton } from '@/components/public/LinkButton'

/**
 * 모바일에서 화면 하단에 고정되는 "분양 신청" CTA 버튼.
 * /apply 와 /admin 경로에서는 표시하지 않음.
 */
export function MobileBottomCTA() {
  const pathname = usePathname()

  const hidden =
    pathname.startsWith('/apply') || pathname.startsWith('/admin')

  if (hidden) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <LinkButton href="/apply" size="lg" className="w-full">
        분양 신청하기
      </LinkButton>
    </div>
  )
}
