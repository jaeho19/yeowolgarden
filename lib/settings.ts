/**
 * settings 테이블 접근 헬퍼 (서버 전용).
 */
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/db/schema'

async function getValue(key: string): Promise<string | null> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get()
  return row?.value ?? null
}

export async function getCurrentSeasonYear(): Promise<number> {
  const v = await getValue('CURRENT_SEASON_YEAR')
  if (v) return Number(v)
  // fallback — 다음 해
  return new Date().getFullYear() + 1
}

export async function isRecruitmentOpen(): Promise<boolean> {
  const v = await getValue('RECRUITMENT_OPEN')
  return v === 'true'
}
