/**
 * Turso (libSQL) + Drizzle ORM client (server-only)
 *
 * 사용:
 *   import { db } from '@/lib/db'
 *   import { applications } from '@/db/schema'
 *   const list = await db.select().from(applications).all()
 *
 * ⚠️ 서버 컴포넌트·API Route·Server Action에서만 사용.
 *    클라이언트에서 직접 import 금지 (TURSO_AUTH_TOKEN 노출 위험).
 */
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '@/db/schema'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error('TURSO_DATABASE_URL is not set in environment')
}

// Next.js dev 모드에서 HMR로 인한 client 다중 생성을 방지하기 위한 싱글톤 패턴
const globalForDb = globalThis as unknown as {
  libsqlClient: ReturnType<typeof createClient> | undefined
}

const client =
  globalForDb.libsqlClient ?? createClient({ url, authToken })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.libsqlClient = client
}

export const db = drizzle(client, { schema })

export type DB = typeof db
