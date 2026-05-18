import Link from 'next/link'
import { desc, and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { announcements } from '@/db/schema'

/**
 * 홈 최상단 핀고정 공지 1개 미리보기. 공지가 없으면 렌더링 안 함.
 *
 * .impeccable.md 「흙냄새 미니멀」 준수:
 *  - 이모지(📢) 제거
 *  - brand-50 박스 + brand 텍스트 모노톤 제거 (페이퍼 배경 + ink 텍스트)
 *  - 작은 leaf-700 dot prefix로 "공지" 라벨
 */
export async function AnnouncementBanner() {
  const pinned = await db
    .select()
    .from(announcements)
    .where(
      and(eq(announcements.isVisible, true), eq(announcements.isPinned, true))
    )
    .orderBy(desc(announcements.createdAt))
    .limit(1)
    .get()

  if (!pinned) return null

  return (
    <Link
      href="/notice"
      className="block border-y border-border bg-background transition-colors hover:bg-secondary/60"
      aria-label={`공지: ${pinned.title}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-brand-700">
          <span
            className="h-1.5 w-1.5 rounded-full bg-brand-500"
            aria-hidden
          />
          공지
        </span>
        <span className="truncate font-medium text-foreground">
          {pinned.title}
        </span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          자세히 →
        </span>
      </div>
    </Link>
  )
}
