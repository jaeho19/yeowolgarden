/**
 * GET /api/admin/announcements — 전체 목록 (visible 무관)
 * POST /api/admin/announcements — 새 공지 생성
 */
import { NextResponse } from 'next/server'
import { desc } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@/lib/db'
import { announcements, auditLogs } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'
import { AnnouncementInputSchema } from '@/lib/schemas/announcement'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const list = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
    .all()
  return NextResponse.json({ announcements: list })
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: '잘못된 요청 형식' } },
      { status: 400 }
    )
  }

  const parsed = AnnouncementInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues[0]?.message,
        },
      },
      { status: 400 }
    )
  }

  const id = createId()
  await db.transaction(async (tx) => {
    await tx.insert(announcements).values({
      id,
      ...parsed.data,
    })
    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'CREATE_ANNOUNCEMENT',
      targetType: 'Announcement',
      targetId: id,
      payload: JSON.stringify({ title: parsed.data.title }),
      actor: 'admin',
    })
  })

  return NextResponse.json({ id, ...parsed.data }, { status: 201 })
}
