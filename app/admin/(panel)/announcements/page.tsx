/**
 * /admin/announcements — 공지 관리.
 */
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { announcements } from '@/db/schema'
import {
  AnnouncementsTable,
  type AdminAnnouncement,
} from '@/components/admin/AnnouncementsTable'

export const dynamic = 'force-dynamic'

async function getAll(): Promise<AdminAnnouncement[]> {
  const rows = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
    .all()

  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    isPinned: a.isPinned,
    isVisible: a.isVisible,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }))
}

export default async function AnnouncementsAdminPage() {
  const items = await getAll()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">공지 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전체 {items.length}건 · 핀 고정한 공지가 홈 상단과 /notice 페이지
          최상단에 노출됩니다.
        </p>
      </header>

      <AnnouncementsTable items={items} />
    </div>
  )
}
