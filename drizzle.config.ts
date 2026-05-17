import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Next.js와 달리 drizzle-kit은 .env.local을 자동 로드하지 않음
config({ path: '.env.local' })

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not set')
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
})
