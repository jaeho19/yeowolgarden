/**
 * GET /api/announcements
 *
 * 공개 공지 목록.
 * - isVisible = true 만 반환
 * - isPinned DESC, createdAt DESC 정렬
 * - ISR 60초 캐시 (Next.js Route Handler에서 revalidate 사용)
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §4.2
 */
import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { announcements } from '@/db/schema'

// DB read API — build-time prerender 차단.
export const dynamic = 'force-dynamic'

export async function GET() {
  const list = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      isPinned: announcements.isPinned,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .where(eq(announcements.isVisible, true))
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
    .all()

  return NextResponse.json({ announcements: list })
}
