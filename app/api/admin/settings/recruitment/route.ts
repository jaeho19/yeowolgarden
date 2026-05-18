/**
 * POST /api/admin/settings/recruitment
 * Body: { open: boolean }
 *
 * RECRUITMENT_OPEN 설정 토글.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@/lib/db'
import { auditLogs, settings } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({ open: z.boolean() })

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
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: '잘못된 요청 본문' } },
      { status: 400 }
    )
  }

  const value = parsed.data.open ? 'true' : 'false'
  const now = new Date()

  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(settings)
      .where(eq(settings.key, 'RECRUITMENT_OPEN'))
      .get()
    if (existing) {
      await tx
        .update(settings)
        .set({ value, updatedAt: now })
        .where(eq(settings.key, 'RECRUITMENT_OPEN'))
    } else {
      await tx
        .insert(settings)
        .values({ key: 'RECRUITMENT_OPEN', value, updatedAt: now })
    }

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'TOGGLE_RECRUITMENT',
      targetType: 'Setting',
      targetId: 'RECRUITMENT_OPEN',
      payload: JSON.stringify({ open: parsed.data.open }),
      actor: 'admin',
    })
  })

  return NextResponse.json({ open: parsed.data.open })
}
