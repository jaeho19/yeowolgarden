/**
 * PATCH /api/admin/announcements/[id] — 부분 수정
 * DELETE /api/admin/announcements/[id]
 */
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@/lib/db'
import { announcements, auditLogs } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

const PatchSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).max(5000).optional(),
    isPinned: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, '수정할 항목이 없습니다.')

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: '잘못된 요청 형식' } },
      { status: 400 }
    )
  }
  const parsed = PatchSchema.safeParse(body)
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

  const existing = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .get()
  if (!existing) {
    return NextResponse.json(
      {
        error: {
          code: 'ANNOUNCEMENT_NOT_FOUND',
          message: '공지를 찾을 수 없습니다.',
        },
      },
      { status: 404 }
    )
  }

  const now = new Date()
  await db.transaction(async (tx) => {
    await tx
      .update(announcements)
      .set({ ...parsed.data, updatedAt: now })
      .where(eq(announcements.id, id))

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'UPDATE_ANNOUNCEMENT',
      targetType: 'Announcement',
      targetId: id,
      payload: JSON.stringify(parsed.data),
      actor: 'admin',
    })
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params

  const existing = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .get()
  if (!existing) {
    return NextResponse.json(
      {
        error: {
          code: 'ANNOUNCEMENT_NOT_FOUND',
          message: '공지를 찾을 수 없습니다.',
        },
      },
      { status: 404 }
    )
  }

  await db.transaction(async (tx) => {
    await tx.delete(announcements).where(eq(announcements.id, id))
    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'DELETE_ANNOUNCEMENT',
      targetType: 'Announcement',
      targetId: id,
      payload: JSON.stringify({ title: existing.title }),
      actor: 'admin',
    })
  })

  return NextResponse.json({ success: true })
}
