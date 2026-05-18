/**
 * /admin/plots — 구획 그리드.
 * 300개 plot 시각화 + 클릭 시 메모/상태 편집.
 */
import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, plots } from '@/db/schema'
import { getCurrentSeasonYear } from '@/lib/settings'
import { PlotsGrid, type PlotItem } from '@/components/admin/PlotsGrid'

export const dynamic = 'force-dynamic'

async function getPlotsForSeason(): Promise<{
  seasonYear: number
  plots: PlotItem[]
}> {
  const seasonYear = await getCurrentSeasonYear()
  const rows = await db
    .select()
    .from(plots)
    .where(eq(plots.seasonYear, seasonYear))
    .orderBy(asc(plots.plotNumber))
    .all()

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

  return {
    seasonYear,
    plots: rows.map((p) => ({
      id: p.id,
      plotNumber: p.plotNumber,
      status: p.status,
      notes: p.notes,
      application: p.applicationId ? appMap[p.applicationId] ?? null : null,
    })),
  }
}

export default async function PlotsPage() {
  const { seasonYear, plots: items } = await getPlotsForSeason()

  const total = items.length
  const counts = {
    AVAILABLE: items.filter((p) => p.status === 'AVAILABLE').length,
    RESERVED: items.filter((p) => p.status === 'RESERVED').length,
    OCCUPIED: items.filter((p) => p.status === 'OCCUPIED').length,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-medium text-muted-foreground">
          {seasonYear} 시즌
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          구획 현황
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전체 {total}구획 · 가용 {counts.AVAILABLE} · 예약 {counts.RESERVED} ·
          점유 {counts.OCCUPIED}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            이 시즌의 구획이 아직 생성되지 않았습니다.
            <br />
            <code className="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs">
              pnpm tsx scripts/seed-plots.ts
            </code>
            를 실행하세요.
          </p>
        </div>
      ) : (
        <PlotsGrid plots={items} />
      )}
    </div>
  )
}
