/**
 * In-memory rate limiter (per-process)
 *
 * Netlify Functions는 인스턴스가 짧게 살고 다중 인스턴스로 스케일 아웃되므로
 * 절대적 정확성은 보장하지 않는다. M3 기준 충분한 1차 방어선.
 *
 * 정확한 분산 rate-limit 필요 시 → Turso 테이블 또는 Upstash Redis로 이관.
 *
 * 사용:
 *   import { rateLimit } from '@/lib/rate-limit'
 *   const allowed = await rateLimit(`lookup:${ip}`, { limit: 5, windowSec: 60 })
 *   if (!allowed) return 429
 */

interface Bucket {
  // 최근 windowSec 내 hit 타임스탬프(ms) — 단순 sliding-window log
  hits: number[]
}

interface RateLimitOptions {
  limit: number
  windowSec: number
}

const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 60_000

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  // 5분 이상 비활성 키 제거 (간단한 메모리 보호)
  const cutoff = now - 5 * 60_000
  for (const [key, b] of buckets.entries()) {
    const last = b.hits[b.hits.length - 1]
    if (!last || last < cutoff) buckets.delete(key)
  }
}

/**
 * 통과 시 true, 초과 시 false.
 */
export async function rateLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions
): Promise<boolean> {
  const now = Date.now()
  sweep(now)

  const windowMs = windowSec * 1000
  const since = now - windowMs

  const bucket = buckets.get(key) ?? { hits: [] }
  // 윈도 밖 hit 제거
  bucket.hits = bucket.hits.filter((t) => t > since)

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket)
    return false
  }

  bucket.hits.push(now)
  buckets.set(key, bucket)
  return true
}

/**
 * X-Forwarded-For 또는 fallback으로 'unknown'.
 * Netlify는 client IP를 첫 항목에 둠.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
