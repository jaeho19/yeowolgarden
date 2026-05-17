/**
 * Drizzle ORM schema — Turso (libSQL/SQLite)
 *
 * 테이블:
 *   - plots         : 5평 균일 구획 (시즌별 1~300)
 *   - applications  : 분양 신청 (시즌별 #1~ applicationNumber)
 *   - announcements : 홈페이지 공지 (어드민 작성)
 *   - auditLogs     : 어드민 액션 감사 로그
 *   - settings      : (key, value) 형태의 앱 설정
 *
 * 1차 MVP 단순화: 모든 구획 5평 균일, zone(영역)은 nullable 필드만 유지(추후)
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §3
 */
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

/* ─────────────────────────────────────────────────────────
 * Plot
 * ─────────────────────────────────────────────────────── */
export const plots = sqliteTable(
  'plots',
  {
    id: text('id').primaryKey(),
    plotNumber: integer('plot_number').notNull(),
    seasonYear: integer('season_year').notNull(),
    areaPyeong: integer('area_pyeong').notNull().default(5),
    // status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'
    status: text('status', { enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED'] })
      .notNull()
      .default('AVAILABLE'),
    applicationId: text('application_id'),
    zone: text('zone'), // 1차 미사용. 추후 영역 분류 도입 시
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (t) => ({
    uqSeasonPlot: uniqueIndex('uq_season_plot').on(t.seasonYear, t.plotNumber),
    idxStatusPlot: index('idx_status_plot').on(t.status, t.plotNumber),
    idxSeason: index('idx_plot_season').on(t.seasonYear),
  })
)

/* ─────────────────────────────────────────────────────────
 * Application
 * ─────────────────────────────────────────────────────── */
export const applications = sqliteTable(
  'applications',
  {
    id: text('id').primaryKey(),
    // 사용자 친화 번호: 시즌별 자동 증가 (#1, #2, ...)
    applicationNumber: integer('application_number').notNull(),
    seasonYear: integer('season_year').notNull(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    desiredCount: integer('desired_count').notNull(), // 5평 단위 묶음 수
    totalPriceKrw: integer('total_price_krw').notNull(),
    experience: text('experience'),
    memo: text('memo'),
    // status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
    status: text('status', {
      enum: ['PENDING', 'PAID', 'CONFIRMED', 'REJECTED', 'CANCELLED'],
    })
      .notNull()
      .default('PENDING'),
    // 배정된 plot 정보 (비정규화 — JSON string)
    plotIds: text('plot_ids'), // JSON: string[]
    plotNumbers: text('plot_numbers'), // JSON: number[]
    privacyAgreed: integer('privacy_agreed', { mode: 'boolean' }).notNull(),
    approvedAt: integer('approved_at', { mode: 'timestamp_ms' }),
    rejectedAt: integer('rejected_at', { mode: 'timestamp_ms' }),
    cancelledAt: integer('cancelled_at', { mode: 'timestamp_ms' }),
    rejectionReason: text('rejection_reason'),
    adminNote: text('admin_note'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (t) => ({
    uqSeasonEmail: uniqueIndex('uq_season_email').on(t.seasonYear, t.email),
    uqSeasonNumber: uniqueIndex('uq_season_number').on(
      t.seasonYear,
      t.applicationNumber
    ),
    idxStatusCreated: index('idx_app_status_created').on(
      t.seasonYear,
      t.status,
      t.createdAt
    ),
    idxLookup: index('idx_app_lookup').on(t.applicationNumber, t.email),
  })
)

/* ─────────────────────────────────────────────────────────
 * Announcement (홈페이지 공지)
 * ─────────────────────────────────────────────────────── */
export const announcements = sqliteTable(
  'announcements',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
    isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (t) => ({
    idxVisible: index('idx_ann_visible').on(t.isVisible, t.isPinned, t.createdAt),
  })
)

/* ─────────────────────────────────────────────────────────
 * AuditLog
 * ─────────────────────────────────────────────────────── */
export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(), // 'Application' | 'Plot'
    targetId: text('target_id').notNull(),
    payload: text('payload'), // JSON string
    actor: text('actor').notNull(), // 'admin' | 'system' | 'user'
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (t) => ({
    idxTarget: index('idx_audit_target').on(t.targetType, t.targetId),
    idxCreated: index('idx_audit_created').on(t.createdAt),
  })
)

/* ─────────────────────────────────────────────────────────
 * Settings (key-value)
 *   - RECRUITMENT_OPEN     : 'true' | 'false'
 *   - CURRENT_SEASON_YEAR  : '2027' 등
 *   - PRICE_PER_UNIT_KRW   : '100000'
 * ─────────────────────────────────────────────────────── */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch() * 1000)`)
    .notNull(),
})

/* ─────────────────────────────────────────────────────────
 * Type exports (Drizzle infer)
 * ─────────────────────────────────────────────────────── */
export type Plot = typeof plots.$inferSelect
export type NewPlot = typeof plots.$inferInsert
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert
export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
