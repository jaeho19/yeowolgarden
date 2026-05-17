/**
 * DB 검증 스크립트 (1회성)
 * 사용: pnpm tsx scripts/check-db.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@libsql/client'

async function main() {
  const c = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  console.log('━━━ Turso DB Verification ━━━\n')

  // 1. plots count
  const count = await c.execute(
    'SELECT COUNT(*) AS cnt, status FROM plots WHERE season_year = 2027 GROUP BY status'
  )
  console.log('Plots by status:', count.rows)

  // 2. plots sample
  const samples = await c.execute(
    'SELECT plot_number, area_pyeong, status FROM plots WHERE season_year = 2027 ORDER BY plot_number LIMIT 5'
  )
  console.log('First 5 plots:', samples.rows)

  // 3. settings
  const settings = await c.execute('SELECT key, value FROM settings')
  console.log('Settings:', settings.rows)

  // 4. tables list
  const tables = await c.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name"
  )
  console.log('Tables:', tables.rows.map((r) => r.name))
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
