import Link from 'next/link'
import { desc, and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { announcements } from '@/db/schema'

/**
 * 홈 상단에 표시되는 핀고정 공지 1개 미리보기.
 * 공지가 없으면 렌더링 안 함.
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
      className="block bg-brand-50 border-y border-brand-100"
      aria-label={`공지: ${pinned.title}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <span className="inline-flex shrink-0 items-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
          📢 공지
        </span>
        <span className="truncate font-medium text-brand-900">
          {pinned.title}
        </span>
        <span className="ml-auto shrink-0 text-xs text-brand-700">
          자세히 →
        </span>
      </div>
    </Link>
  )
}
