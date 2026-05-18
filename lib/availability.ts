/**
 * 잔여 + 인접 묶음 통계 계산 (서버 전용).
 *
 * 1~MAX_UNITS 묶음별로 "현재 가용 plot 시퀀스에서 만들 수 있는 묶음 수"를 계산.
 * 예: 가용 plot = [1,2,3,5,6,7] → runs = [3,3]
 *      capacity = { 1: 6, 2: 4, 3: 2, 4: 0, ... }
 *
 * AvailabilityBadge와 GET /api/plots/availability가 공유.
 */
import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { plots } from '@/db/schema'
import { MAX_UNITS_PER_APPLICATION } from '@/lib/schemas/application'
import {
  getCurrentSeasonYear,
  isRecruitmentOpen,
} from '@/lib/settings'

const CAPACITY_BUCKETS = [1, 2, 3, 4, 5] as const

export interface AvailabilitySnapshot {
  seasonYear: number
  recruitmentOpen: boolean
  total: number
  available: number
  /** desiredCount 별로 만들 수 있는 인접 묶음 수 */
  capacity: Record<number, number>
}

export async function getAvailabilitySnapshot(): Promise<AvailabilitySnapshot> {
  const seasonYear = await getCurrentSeasonYear()
  const recruitmentOpen = await isRecruitmentOpen()

  const totalRow = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(plots)
    .where(eq(plots.seasonYear, seasonYear))
    .get()
  const total = Number(totalRow?.cnt ?? 0)

  const available = await db
    .select({ plotNumber: plots.plotNumber })
    .from(plots)
    .where(
      and(eq(plots.seasonYear, seasonYear), eq(plots.status, 'AVAILABLE'))
    )
    .orderBy(asc(plots.plotNumber))
    .all()

  // 연속 run 길이 계산
  const runs: number[] = []
  let run = 0
  let prev: number | null = null
  for (const p of available) {
    if (prev !== null && p.plotNumber === prev + 1) {
      run += 1
    } else {
      if (run > 0) runs.push(run)
      run = 1
    }
    prev = p.plotNumber
  }
  if (run > 0) runs.push(run)

  const capacity: Record<number, number> = {}
  for (const n of CAPACITY_BUCKETS) {
    capacity[n] = runs.reduce((sum, r) => sum + Math.max(0, r - n + 1), 0)
  }
  // MAX_UNITS_PER_APPLICATION 까지 확장하고 싶다면 아래 loop로 교체:
  void MAX_UNITS_PER_APPLICATION

  return {
    seasonYear,
    recruitmentOpen,
    total,
    available: available.length,
    capacity,
  }
}
