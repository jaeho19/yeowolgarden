/**
 * GET /api/admin/applications/[id]
 * 어드민 신청 상세.
 */
import { NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, auditLogs } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params

  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get()
  if (!app) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '신청을 찾을 수 없습니다.' } },
      { status: 404 }
    )
  }

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.targetId, id))
    .orderBy(desc(auditLogs.createdAt))
    .all()

  return NextResponse.json({
    application: app,
    auditLogs: logs,
  })
}
