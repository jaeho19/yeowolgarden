/**
 * GET /api/admin/plots
 * 시즌별 모든 구획 + 점유 신청 매핑.
 */
import { NextResponse } from 'next/server'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, plots } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'
import { getCurrentSeasonYear } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { searchParams } = new URL(req.url)
  const seasonParam = searchParams.get('season')
  const seasonYear = seasonParam
    ? Number(seasonParam)
    : await getCurrentSeasonYear()

  const rows = await db
    .select()
    .from(plots)
    .where(eq(plots.seasonYear, seasonYear))
    .orderBy(asc(plots.plotNumber))
    .all()

  // 점유 plot에 대해 신청자 정보 매핑 (이름·신청번호만)
  const appIds = rows
    .map((p) => p.applicationId)
    .filter((id): id is string => !!id)

  let appMap: Record<
    string,
    { id: string; applicationNumber: number; name: string }
  > = {}
  if (appIds.length > 0) {
    const apps = await db
      .select({
        id: applications.id,
        applicationNumber: applications.applicationNumber,
        name: applications.name,
      })
      .from(applications)
      .where(and(inArray(applications.id, appIds)))
      .all()
    appMap = Object.fromEntries(apps.map((a) => [a.id, a]))
  }

  return NextResponse.json({
    seasonYear,
    plots: rows.map((p) => ({
      ...p,
      application: p.applicationId ? appMap[p.applicationId] ?? null : null,
    })),
  })
}
