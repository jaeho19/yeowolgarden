/**
 * Plot 시드 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/seed-plots.ts
 *
 * 동작:
 *   1. plots 테이블에 plotNumber 1~300 INSERT (시즌 2027, AVAILABLE 상태)
 *   2. settings 테이블에 CURRENT_SEASON_YEAR / PRICE_PER_UNIT_KRW / RECRUITMENT_OPEN 등록
 *
 * 멱등성: onConflictDoNothing — 이미 존재하는 plot은 건드리지 않음
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { createId } from '@paralleldrive/cuid2'
import { plots, settings } from '../db/schema'

const SEASON = 2027
const TOTAL_PLOTS = 300

async function main() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) throw new Error('TURSO_DATABASE_URL is not set')

  const client = createClient({ url, authToken })
  const db = drizzle(client)

  console.log(`🌱 Seeding plots for season ${SEASON} ...`)

  const plotData = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
    id: createId(),
    plotNumber: i + 1,
    seasonYear: SEASON,
    areaPyeong: 5,
    status: 'AVAILABLE' as const,
  }))

  // batch insert (Turso는 단일 트랜잭션에서 다수 row OK)
  await db.insert(plots).values(plotData).onConflictDoNothing()
  console.log(`  ✓ Inserted ${TOTAL_PLOTS} plots (skipped duplicates)`)

  const settingsData = [
    { key: 'CURRENT_SEASON_YEAR', value: String(SEASON) },
    { key: 'PRICE_PER_UNIT_KRW', value: '100000' },
    { key: 'RECRUITMENT_OPEN', value: 'true' },
  ]
  await db.insert(settings).values(settingsData).onConflictDoNothing()
  console.log(`  ✓ Inserted ${settingsData.length} settings`)

  console.log('🌾 Seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
