/**
 * GET /api/admin/applications
 *
 * 어드민 신청 목록. 시즌·상태·검색 필터.
 * 응답에 모든 필드 포함 (어드민이므로).
 */
import { NextResponse } from 'next/server'
import { and, desc, eq, like, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'
import { getCurrentSeasonYear } from '@/lib/settings'
import { APPLICATION_STATUS } from '@/lib/schemas/application'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { searchParams } = new URL(req.url)
  const seasonParam = searchParams.get('season')
  const statusParam = searchParams.get('status') ?? undefined
  const q = (searchParams.get('q') ?? '').trim()

  const seasonYear = seasonParam
    ? Number(seasonParam)
    : await getCurrentSeasonYear()

  const filters = [eq(applications.seasonYear, seasonYear)]

  if (
    statusParam &&
    (APPLICATION_STATUS as readonly string[]).includes(statusParam)
  ) {
    filters.push(
      eq(
        applications.status,
        statusParam as (typeof APPLICATION_STATUS)[number]
      )
    )
  }

  if (q.length > 0) {
    const like1 = `%${q}%`
    const numQ = Number(q)
    const orParts = [
      like(applications.name, like1),
      like(applications.email, like1),
      like(applications.phone, like1),
    ]
    if (Number.isInteger(numQ)) {
      orParts.push(eq(applications.applicationNumber, numQ))
    }
    const orExpr = or(...orParts)
    if (orExpr) filters.push(orExpr)
  }

  const list = await db
    .select()
    .from(applications)
    .where(and(...filters))
    .orderBy(desc(applications.createdAt))
    .all()

  return NextResponse.json({
    seasonYear,
    count: list.length,
    applications: list,
  })
}
