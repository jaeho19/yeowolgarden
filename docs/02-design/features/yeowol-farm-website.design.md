---
template: design
version: 1.2
feature: yeowolgarden
date: 2026-05-16
author: 운영자 (조경학과 교수)
project: 여월농장 (Yeowol Farm)
status: Updated (v0.4 - Turso/Drizzle + 이메일 제거 + 신청 조회 + 공지)
---

# 여월농장 홈페이지 + 분양 자동배정 시스템 Design Document

> **Summary**: Next.js 14 + **Turso(SQLite)/Drizzle** + Netlify. 5평 단위 균일 300구획, 인접 묶음 자동 배정. **이메일 발송 없음** — 사이트 공지 + 신청자 본인 조회 페이지.
>
> **Project**: yeowolgarden (GitHub: jaeho19/yeowolgarden)
> **Version**: 0.4.0
> **Author**: 운영자 + Claude
> **Date**: 2026-05-16
> **Status**: Updated — Firebase/Gmail 제거, Turso/Drizzle 도입, Announcement·Lookup 페이지 추가
> **Planning**: [yeowol-farm-website.plan.md](../../01-plan/features/yeowol-farm-website.plan.md)
> **Critical Deadline**: 2026-12-31

### 농원 기본 정보 (확정)

| 항목 | 값 |
|------|-----|
| 사이트 URL | https://yeowolfarm.netlify.app |
| 정식 명칭 | 여월농장 (운영: 농업회사법인 (유)호정) |
| 주소 | 경기도 부천시 오정구 여월동 112 |
| GPS | 37.514173, 126.793019 |
| 네이버 지도 | [장소 #2003003971](https://map.naver.com/p/search/여월농장/place/2003003971) |
| 시즌 | 매년 3월 ~ 11월 (9개월) |
| 구획 | 300개 모두 5평 균일 |
| 가격 | 5평당 100,000원 / 시즌 1회 결제 |
| 계좌 | 농축협 351-1352-647143 / 농업회사법인 (유)호정 |
| 어드민 ID | adminyeowol |

---

## 1. Overview

### 1.1 Design Goals

1. **시즌 데드라인 사수** — 2026-12 라이브
2. **운영자 단독 운영** — 어드민에서 모든 운영
3. **결정론적 자동 배정** — Turso 트랜잭션 기반 인접 묶음
4. **이메일 무의존** — 사이트 공지 + 신청자 조회 페이지로 대체
5. **무료 운영** — Netlify + Turso 모두 무료 한도 내
6. **모바일 우선**

### 1.2 Design Principles

- **Zod 단일 소스** — 클라+서버 검증 공유
- **Server Components 우선**
- **Turso 트랜잭션** — `db.transaction()`으로 동시성 보장
- **본인 확인 보안** — 신청번호+이메일 일치 + rate-limit
- **균일 5평 구획** — 1차 MVP, 영역 분류는 추후

---

## 2. Architecture

### 2.1 Component Diagram

```
┌────────────────┐    HTTPS     ┌────────────────────────────────┐    libSQL  ┌──────────────┐
│   Visitor      │◄────────────▶│   Next.js 14 (App Router)      │◄──────────▶│ Turso (libSQL│
│  (모바일/PC)    │              │   Netlify (Next.js Runtime)    │           │  / SQLite)   │
├────────────────┤              │                                │           │  Region: NRT │
│  운영자 (어드민) │◄────────────▶│   /(public) 8p                  │           │   asia-east  │
└────────────────┘              │     · 7p + /apply/status        │           └──────────────┘
                                │   /admin 6p                     │
                                │     · 5p + announcements        │           ┌──────────────┐
                                │   /api 14 routes                │──────────▶│ Naver 지도    │
                                │   lib/allocation.ts             │           │ (iframe)     │
                                │   (Drizzle Transaction)         │           └──────────────┘
                                └────────────────────────────────┘

❌ 제거: Firebase, Gmail SMTP, Nodemailer, Resend, 이메일 템플릿 5종, Kakao Maps API
```

### 2.2 Data Flow

**Flow A — 분양 신청:**
```
[사용자] 폼 작성 → POST /api/applications
   ↓
[Server] zod 검증 + honeypot + rate-limit
   ↓
[Turso] applications INSERT (status=PENDING, applicationNumber 자동 발급)
   ↓
[Client] /apply/success?number=1234 리다이렉트
   ↓
[화면에 모든 안내 표시]
   · 신청번호 #1234
   · 계좌: 농축협 351-1352-647143 / (유)호정
   · 금액: 200,000원 (계산)
   · "입금 후 1~3일 내 운영자가 확인합니다"
   · "신청 상태는 /apply/status 에서 신청번호+이메일로 조회"
```

**Flow B — 입금 확인 후 자동 배정:**
```
[운영자] 통장 입금 확인 → /admin/applications/[id] → "승인" 클릭
   ↓
[Server] NextAuth 세션 검증 → POST /api/admin/applications/[id]/approve
   ↓
[lib/allocation.ts] Drizzle transaction:
   ├─ application SELECT FOR UPDATE
   ├─ plots SELECT WHERE status='AVAILABLE' ORDER BY plotNumber
   ├─ findContiguousGroup(plots, desiredCount)
   ├─ 묶음 있음 → UPDATE plots(OCCUPIED) + UPDATE application(CONFIRMED)
   └─ 묶음 없음 → UPDATE application(PAID) — 수동 대기
   ↓
[Client] 어드민 새로고침 + revalidatePath('/', '/apply/status')
```

**Flow C — 신청자 본인 조회 (새로움):**
```
[신청자] /apply/status 접근 → 신청번호 + 이메일 입력
   ↓
[Server] GET /api/applications/lookup?number=1234&email=user@example.com
   ↓
[Rate-limit] IP당 분당 5건 체크 (Upstash 또는 in-memory)
   ↓
[Turso] applications SELECT WHERE applicationNumber=1234 AND email=user@example.com
   ↓
[응답] 공개 가능 필드만 (이름·면적·금액·상태·배정구획)
       - 운영자 메모, adminNote는 비공개
       - 일치 X → 404 (보안상 "찾을 수 없음")
   ↓
[Client] 결과 페이지 표시
```

**Flow D — 사이트 공지 (새로움):**
```
[운영자] /admin/announcements → 공지 작성 (제목, 내용, 노출 ON/OFF)
   ↓
[Turso] announcements INSERT/UPDATE
   ↓
[홈/공지 페이지] GET /api/announcements → 공개 공지 목록 (ISR 60초)
```

### 2.3 Dependencies

| Component | Depends On |
|-----------|-----------|
| Next.js App | Netlify |
| DB Access | `@libsql/client` + `drizzle-orm` |
| Migrations | `drizzle-kit` |
| Auto-allocator | Drizzle `db.transaction()` |
| Map | **Naver 지도 iframe 임베드** (API 가입 불필요, 외부 의존 없음) |
| Admin Auth | NextAuth Credentials + bcrypt |
| Form | react-hook-form + zod |
| Rate-limit | in-memory 또는 Upstash (선택) |

---

## 3. Data Model (Turso/SQLite + Drizzle)

### 3.1 Domain Schemas (Zod)

```typescript
// lib/schemas/application.ts
import { z } from 'zod'

export const APPLICATION_STATUS = ['PENDING','PAID','CONFIRMED','REJECTED','CANCELLED'] as const
export const PLOT_STATUS = ['AVAILABLE','RESERVED','OCCUPIED'] as const

export const PRICE_PER_UNIT_KRW = 100_000
export const PYEONG_PER_UNIT = 5
export const MAX_UNITS_PER_APPLICATION = 20

export const ApplicationInputSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '휴대폰 형식'),
  email: z.string().email(),
  desiredCount: z.number().int().min(1).max(MAX_UNITS_PER_APPLICATION),
  experience: z.string().max(500).optional(),
  memo: z.string().max(500).optional(),
  privacyAgreed: z.literal(true),
  website: z.string().max(0).optional(),  // honeypot
})

export const LookupInputSchema = z.object({
  applicationNumber: z.number().int().positive(),
  email: z.string().email(),
})

export const AnnouncementInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  isPinned: z.boolean().default(false),
  isVisible: z.boolean().default(true),
})
```

### 3.2 Drizzle Schema (`db/schema.ts`)

```typescript
import { sqliteTable, integer, text, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const plots = sqliteTable('plots', {
  id: text('id').primaryKey(),
  plotNumber: integer('plot_number').notNull(),
  seasonYear: integer('season_year').notNull(),
  areaPyeong: integer('area_pyeong').notNull().default(5),
  status: text('status', { enum: PLOT_STATUS }).notNull().default('AVAILABLE'),
  applicationId: text('application_id'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
}, t => ({
  uqSeasonPlot: uniqueIndex('uq_season_plot').on(t.seasonYear, t.plotNumber),
  idxStatusPlotNum: index('idx_status_plot').on(t.status, t.plotNumber),
  idxSeason: index('idx_season').on(t.seasonYear),
}))

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  applicationNumber: integer('application_number').notNull(),   // 사용자 친화 #1, #2, ... (시즌별 reset)
  seasonYear: integer('season_year').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  desiredCount: integer('desired_count').notNull(),
  totalPriceKrw: integer('total_price_krw').notNull(),
  experience: text('experience'),
  memo: text('memo'),
  status: text('status', { enum: APPLICATION_STATUS }).notNull().default('PENDING'),
  plotIds: text('plot_ids'),                  // JSON array string 또는 별도 join 테이블
  plotNumbers: text('plot_numbers'),          // JSON array 비정규화 (빠른 표시)
  privacyAgreed: integer('privacy_agreed', { mode: 'boolean' }).notNull(),
  approvedAt: integer('approved_at', { mode: 'timestamp_ms' }),
  rejectedAt: integer('rejected_at', { mode: 'timestamp_ms' }),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp_ms' }),
  rejectionReason: text('rejection_reason'),
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
}, t => ({
  uqSeasonEmail: uniqueIndex('uq_season_email').on(t.seasonYear, t.email),
  uqSeasonNumber: uniqueIndex('uq_season_number').on(t.seasonYear, t.applicationNumber),
  idxStatusCreated: index('idx_app_status').on(t.seasonYear, t.status, t.createdAt),
  idxLookup: index('idx_lookup').on(t.applicationNumber, t.email),  // 본인 조회 최적화
}))

export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
}, t => ({
  idxVisible: index('idx_announcement_visible').on(t.isVisible, t.isPinned, t.createdAt),
}))

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  payload: text('payload'),       // JSON string
  actor: text('actor').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
}, t => ({
  idxTarget: index('idx_audit_target').on(t.targetType, t.targetId),
  idxCreated: index('idx_audit_created').on(t.createdAt),
}))

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`).notNull(),
})
```

### 3.3 시드 데이터 (`scripts/seed-plots.ts`)

```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { plots, settings } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})
const db = drizzle(client)

async function seed() {
  const SEASON = 2027

  const data = Array.from({ length: 300 }, (_, i) => ({
    id: createId(),
    plotNumber: i + 1,
    seasonYear: SEASON,
    areaPyeong: 5,
    status: 'AVAILABLE' as const,
  }))

  await db.insert(plots).values(data).onConflictDoNothing()
  await db.insert(settings).values([
    { key: 'CURRENT_SEASON_YEAR', value: '2027' },
    { key: 'PRICE_PER_UNIT_KRW', value: '100000' },
    { key: 'RECRUITMENT_OPEN', value: 'true' },
  ]).onConflictDoNothing()

  console.log('Seed completed: 300 plots, 3 settings')
}
seed()
```

### 3.4 applicationNumber 발급

```typescript
// 신청 생성 시 (lib/applications.ts)
async function createApplication(input: ApplicationInput, seasonYear: number) {
  return await db.transaction(async (tx) => {
    // 중복 이메일 체크
    const dup = await tx.select().from(applications)
      .where(and(eq(applications.seasonYear, seasonYear), eq(applications.email, input.email)))
      .get()
    if (dup) throw new ConflictError('DUPLICATE_APPLICATION')

    // 시즌 내 다음 번호
    const max = await tx.select({ max: sql<number>`max(${applications.applicationNumber})` })
      .from(applications).where(eq(applications.seasonYear, seasonYear)).get()
    const nextNumber = (max?.max ?? 0) + 1

    const id = createId()
    await tx.insert(applications).values({
      id,
      applicationNumber: nextNumber,
      seasonYear,
      ...input,
      totalPriceKrw: input.desiredCount * 100_000,
    })
    return { id, applicationNumber: nextNumber }
  })
}
```

---

## 4. API Specification

### 4.1 Endpoint List (v0.4)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/applications` | 신청 접수 | Public + rate-limit |
| GET | `/api/applications/lookup` | **본인 조회** ⭐ 신규 | Public + rate-limit |
| GET | `/api/plots/availability` | 잔여 + 묶음 통계 | Public |
| GET | `/api/announcements` | **공지 목록** ⭐ 신규 | Public |
| POST | `/api/admin/auth/...` | NextAuth | - |
| GET | `/api/admin/applications` | 목록 | Admin |
| GET | `/api/admin/applications/[id]` | 상세 | Admin |
| POST | `/api/admin/applications/[id]/approve` | 자동 배정 | Admin |
| POST | `/api/admin/applications/[id]/assign` | 수동 배정 | Admin |
| POST | `/api/admin/applications/[id]/reject` | 거절 | Admin |
| POST | `/api/admin/applications/[id]/cancel` | 취소 | Admin |
| GET | `/api/admin/plots` | 구획 현황 | Admin |
| PATCH | `/api/admin/plots/[id]` | 메모/상태 수정 | Admin |
| POST | `/api/admin/settings/recruitment` | 모집 ON/OFF | Admin |
| GET/POST/PATCH/DELETE | `/api/admin/announcements/[id?]` | **공지 CRUD** ⭐ 신규 | Admin |

### 4.2 신규 핵심 API

#### `POST /api/applications`

**Auth**: Public, rate-limit IP당 5/시간, honeypot

**Request:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "email": "user@example.com",
  "desiredCount": 2,
  "experience": "텃밭 3년차",
  "memo": "주말 위주",
  "privacyAgreed": true,
  "website": ""
}
```

**Response (201):**
```json
{
  "id": "clxxx...",
  "applicationNumber": 1234,
  "status": "PENDING",
  "desiredCount": 2,
  "totalAreaPyeong": 10,
  "totalPriceKrw": 200000,
  "createdAt": "2027-01-05T10:23:00Z",
  "statusUrl": "https://yeowolfarm.netlify.app/apply/status",
  "bankInfo": "농축협 351-1352-647143 농업회사법인 (유)호정"
}
```

**Side Effects:**
1. Turso `applications` INSERT (applicationNumber 시즌 내 다음 번호 발급)
2. AuditLog (action=CREATE_APP, actor=user)
3. **메일 발송 없음**

---

#### `GET /api/applications/lookup` ⭐ 신규

**Auth**: Public, rate-limit IP당 5/분 + 누적 실패 시 잠금

**Request (Query):**
```
GET /api/applications/lookup?number=1234&email=user@example.com
```

**Response (200, 일치):**
```json
{
  "applicationNumber": 1234,
  "name": "홍길동",
  "status": "CONFIRMED",
  "desiredCount": 2,
  "totalAreaPyeong": 10,
  "totalPriceKrw": 200000,
  "assignedPlots": [
    { "plotNumber": 5 },
    { "plotNumber": 6 }
  ],
  "seasonYear": 2027,
  "createdAt": "2027-01-05T10:23:00Z",
  "approvedAt": "2027-01-07T14:00:00Z",
  "rejectionReason": null
}
```

**비공개 필드** (응답에서 제외):
- `id` (cuid)
- `phone`
- `memo`, `experience`, `adminNote`
- `plotIds`

**Errors:**
- `400 VALIDATION_FAILED` — number/email 형식 오류
- `404 NOT_FOUND` — applicationNumber+email 불일치 (보안상 "찾을 수 없음")
- `429 RATE_LIMITED`

**Cache**: ISR 30초 (status 변화 빠름) 또는 캐시 없음.

---

#### `GET /api/announcements` ⭐ 신규

**Response (200):**
```json
{
  "announcements": [
    {
      "id": "ann_xxx",
      "title": "2027 시즌 분양 시작",
      "content": "...",
      "isPinned": true,
      "createdAt": "..."
    }
  ]
}
```

**필터**: `isVisible=true`만 반환. `isPinned=true`가 먼저, 그 다음 `createdAt DESC`.

**Cache**: ISR 60초.

---

### 4.3 자동 배정 알고리즘 (Drizzle/Turso 버전)

```typescript
// lib/allocation.ts
import { drizzle } from 'drizzle-orm/libsql'
import { eq, and, asc } from 'drizzle-orm'
import { applications, plots, auditLogs } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'

export async function autoAllocate(applicationId: string): Promise<AllocationResult> {
  return await db.transaction(async (tx) => {
    const app = await tx.select().from(applications).where(eq(applications.id, applicationId)).get()
    if (!app) throw new ConflictError('NOT_FOUND')
    if (app.status === 'CONFIRMED') throw new ConflictError('ALREADY_CONFIRMED')
    if (app.plotIds && JSON.parse(app.plotIds).length > 0) throw new ConflictError('ALREADY_HAS_PLOTS')

    const n = app.desiredCount

    // 1. 가용 plot 정렬 조회 (SQLite는 SELECT FOR UPDATE 없으나 트랜잭션 격리로 충분)
    const available = await tx.select()
      .from(plots)
      .where(and(
        eq(plots.seasonYear, app.seasonYear),
        eq(plots.status, 'AVAILABLE')
      ))
      .orderBy(asc(plots.plotNumber))
      .all()

    const group = findContiguousGroup(available, n)
    if (!group) {
      await tx.update(applications)
        .set({ status: 'PAID' })
        .where(eq(applications.id, app.id))

      await tx.insert(auditLogs).values({
        id: createId(),
        action: 'NEED_MANUAL_ASSIGNMENT',
        targetType: 'Application',
        targetId: app.id,
        payload: JSON.stringify({ desiredCount: n }),
        actor: 'system',
      })
      return { success: false, needsManualAssignment: true }
    }

    // 2. 묶음 모든 plot 배정 + application CONFIRMED
    const now = Date.now()
    for (const p of group) {
      // 조건부 UPDATE (race 방지) — affected rows 검사
      const result = await tx.update(plots)
        .set({ status: 'OCCUPIED', applicationId: app.id, updatedAt: now })
        .where(and(eq(plots.id, p.id), eq(plots.status, 'AVAILABLE')))
        .returning()
        .all()
      if (result.length === 0) throw new ConflictError('RACE_CONDITION')
    }

    await tx.update(applications)
      .set({
        status: 'CONFIRMED',
        plotIds: JSON.stringify(group.map(g => g.id)),
        plotNumbers: JSON.stringify(group.map(g => g.plotNumber)),
        approvedAt: now,
      })
      .where(eq(applications.id, app.id))

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'APPROVE_AUTO',
      targetType: 'Application',
      targetId: app.id,
      payload: JSON.stringify({ plotNumbers: group.map(g => g.plotNumber) }),
      actor: 'admin',
    })

    return {
      success: true,
      assignedPlots: group.map(g => ({ plotNumber: g.plotNumber, areaPyeong: 5 })),
    }
  })
}

function findContiguousGroup<T extends { plotNumber: number }>(sorted: T[], n: number): T[] | null {
  if (sorted.length < n) return null
  for (let i = 0; i <= sorted.length - n; i++) {
    let ok = true
    for (let j = 1; j < n; j++) {
      if (sorted[i + j].plotNumber !== sorted[i + j - 1].plotNumber + 1) { ok = false; break }
    }
    if (ok) return sorted.slice(i, i + n)
  }
  return null
}
```

**SQLite/Turso 트랜잭션 특징:**
- libSQL은 SQLite WAL 모드로 동시 read 빠름, write는 순차 (BEGIN IMMEDIATE)
- 트랜잭션 외부 동시 변경 → SQLite의 BUSY 또는 우리 코드의 조건부 UPDATE로 잡힘
- 우리 규모(300명, 동시 승인 극히 드묾)에서 충돌 거의 없음

**테스트**: vitest + `:memory:` libSQL 인스턴스 또는 별도 테스트 DB

---

## 5. UI/UX Design (v0.4)

### 5.1 Sitemap

```
공개 영역                                어드민 영역 (NextAuth)
──────────────                          ──────────────────────
/                                       /admin/login
/plots          (분양 안내·가격)         /admin                  (대시보드)
/access         (오시는 길)              /admin/applications     (목록)
/about          (운영자 소개)            /admin/applications/[id] (상세)
/gallery                                /admin/plots            (구획 현황)
/faq                                    /admin/announcements    ⭐ (공지 CRUD)
/notice         ⭐ (공지 목록 페이지)     /admin/settings         (모집 ON/OFF)
/apply          (신청 폼)
/apply/success  (신청 완료, 신청번호+계좌)
/apply/status   ⭐ (본인 조회)
/privacy
/terms
```

### 5.2 핵심 신규 화면 와이어프레임

#### 5.2.1 신청 완료 (`/apply/success`)

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ 신청이 접수되었습니다                                      │
│                                                              │
│  신청번호:        #1234                                       │
│  이름:           홍길동                                       │
│  신청 면적:       10평 (2구획)                                │
│  결제 금액:       200,000원                                   │
│                                                              │
│  ─────────────────────────────────────────────────           │
│  📞 입금 안내                                                 │
│                                                              │
│  계좌: 농축협 351-1352-647143                                │
│  예금주: 농업회사법인 (유)호정                                │
│  금액: 200,000원                                              │
│  입금자명: 본인 이름                                          │
│                                                              │
│  ⓘ 입금 후 1~3일 내에 운영자가 확인하면                       │
│    인접한 2개 구획이 자동 배정됩니다.                         │
│                                                              │
│  ─────────────────────────────────────────────────           │
│  📌 신청 상태 확인                                            │
│                                                              │
│  신청번호 #1234 와 이메일로 언제든 확인 가능:                 │
│  https://yeowolfarm.netlify.app/apply/status                 │
│                                                              │
│  [📋 신청번호 복사]    [신청 조회로 이동 →]                   │
│                                                              │
│  ⓘ 문의: 운영자 010-XXXX-XXXX                                 │
└──────────────────────────────────────────────────────────────┘
```

#### 5.2.2 본인 조회 (`/apply/status`) ⭐ 신규

```
┌──────────────────────────────────────────────────────────────┐
│  신청 상태 조회                                               │
│                                                              │
│  신청번호  [#____]  (예: 1234)                              │
│  이메일    [_______________________]                         │
│                                                              │
│         [ 조회하기 ]                                         │
│                                                              │
│  ⓘ 신청번호는 신청 완료 시 화면에 표시되었습니다.            │
│   분실 시 운영자에게 문의해주세요.                            │
└──────────────────────────────────────────────────────────────┘

조회 성공 시 (status = CONFIRMED, 배정 완료):

┌──────────────────────────────────────────────────────────────┐
│  📋 신청 #1234                                                │
│                                                              │
│  이름:        홍길동                                          │
│  신청 면적:    10평 (2구획)                                  │
│  결제 금액:    200,000원                                      │
│                                                              │
│  상태:  ✅ 배정 완료                                          │
│                                                              │
│  ┌──────────────────────────────┐                          │
│  │  배정 구획                    │                           │
│  │  #5, #6 (인접 2개)            │                           │
│  │  총 10평                      │                           │
│  └──────────────────────────────┘                          │
│                                                              │
│  시즌: 2027년 3월 ~ 11월                                      │
│  배정일: 2027-01-07                                          │
│                                                              │
│  ⓘ 개장일: 2027-03-XX (정확한 날짜는 공지 참조)              │
│                                                              │
│  [📢 공지사항 보기]  [🗺️ 오시는 길]                          │
└──────────────────────────────────────────────────────────────┘

조회 성공 (status = PENDING):
│  상태: ⏳ 입금 대기 (입금 후 확인까지 1~3일)
│  계좌: 농축협 351-1352-647143 / (유)호정
│  금액: 200,000원

조회 성공 (status = PAID, 인접 묶음 없어 수동 대기):
│  상태: 🔄 운영자 배정 대기 (특별 처리)
│  사유: 인접한 구획 묶음을 찾는 중입니다. 곧 운영자가 직접 연락드립니다.

조회 성공 (status = REJECTED):
│  상태: ❌ 거절됨
│  사유: {rejectionReason}

조회 실패 (404):
│  "일치하는 신청을 찾을 수 없습니다.
│   신청번호와 이메일을 확인해주세요."
```

#### 5.2.3 공지 페이지 (`/notice`) ⭐ 신규

```
┌──────────────────────────────────────────────────────────────┐
│  공지사항                                                     │
│                                                              │
│  📌 [중요] 2027 시즌 분양 시작 안내           2027-01-01     │
│  ─────────────────────────────────────                      │
│  안녕하세요, 여월농장입니다.                                  │
│  2027 시즌 분양 신청을 1월 1일부터 시작합니다...              │
│                                                              │
│  ─────────────────────────────────────                      │
│  [일반] 시설 점검 안내                          2027-02-10   │
│  ─────────────────────────────────────                      │
│  ...                                                         │
│                                                              │
│  ─────────────────────────────────────                      │
│  (페이지네이션)                                               │
└──────────────────────────────────────────────────────────────┘
```

홈페이지 상단에 최근 핀고정 공지 1개 미리보기 + "더보기 →"

#### 5.2.4 어드민 공지 작성 (`/admin/announcements`) ⭐ 신규

```
┌──────────────────────────────────────────────────────────────┐
│  공지 관리                          [+ 새 공지 작성]          │
│                                                              │
│  ┌──┬───────────────────────┬───────┬────┬────────┐         │
│  │ID│제목                    │핀고정 │노출 │액션    │         │
│  ├──┼───────────────────────┼───────┼────┼────────┤         │
│  │1 │2027 시즌 분양 시작     │ 📌    │ ✅ │[수정]  │         │
│  │2 │시설 점검 안내          │       │ ✅ │[수정]  │         │
│  │3 │양지 영역 마감 임박     │       │ ❌ │[수정]  │         │
│  └──┴───────────────────────┴───────┴────┴────────┘         │
│                                                              │
│  편집 화면:                                                   │
│  제목   [______________]                                     │
│  내용                                                        │
│  ┌──────────────────────────────────────┐                   │
│  │ (markdown 또는 plain text)            │                   │
│  └──────────────────────────────────────┘                   │
│  ☐ 핀고정 (상단 노출)                                        │
│  ☑ 노출 (off하면 임시 비공개)                                │
│  [저장]  [삭제]                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Component List (v0.4 추가)

**신규 공개:**
| Component | Location | Responsibility |
|-----------|----------|----------------|
| `LookupForm` | components/public/ | `/apply/status` 입력 폼 |
| `ApplicationStatusCard` | components/public/ | 조회 결과 카드 |
| `AnnouncementList` | components/public/ | `/notice` 목록 |
| `AnnouncementBanner` | components/public/ | 홈 상단 핀고정 미리보기 |
| `ApplyCompletePage` | components/public/ | `/apply/success` (신청번호·계좌·안내) |
| `CopyButton` | components/public/ | 신청번호 클립보드 복사 |

**신규 어드민:**
| Component | Location | Responsibility |
|-----------|----------|----------------|
| `AnnouncementsTable` | components/admin/ | 공지 목록 |
| `AnnouncementEditor` | components/admin/ | 공지 작성/수정 |

---

## 6. Error Handling

### 6.1 Error Codes (추가)

| Code | HTTP | Message | 비고 |
|------|------|---------|------|
| (기존 유지) | | | |
| `LOOKUP_NOT_FOUND` | 404 | 일치하는 신청을 찾을 수 없습니다 | 보안상 "신청번호·이메일 중 어느 것이 틀렸는지" 노출 X |
| `LOOKUP_RATE_LIMITED` | 429 | 조회 시도가 너무 많습니다. 1분 후 다시 시도 | rate-limit |
| `ANNOUNCEMENT_NOT_FOUND` | 404 | - | 어드민용 |

### 6.2 본인 조회 보안

- **응답 일관성**: number 불일치 vs email 불일치 vs 둘 다 불일치 — 모두 동일한 404 응답
- **응답 시간 일관성**: 짧은 처리 시간 차이로 추측 못 하게 (constant-time 비교)
- Rate-limit: IP당 분당 5건. 시간당 누적 실패 20건 이상 시 1시간 잠금

---

## 7. Security Considerations

### 7.1 OWASP

(v0.3 동일 + 본인 조회 추가)

### 7.2 Turso 보안

- `TURSO_AUTH_TOKEN` 서버 ENV만, Git 미커밋
- libSQL connection은 SSL/TLS 자동
- Drizzle parameterized query (SQL Injection 차단)

### 7.3 본인 조회 페이지

- rate-limit (분 + 시간 누적)
- 응답 정보 최소화 (이름·면적·금액·상태·배정구획만)
- 비공개: phone, memo, experience, adminNote, plotIds, rejection details 상세
- 거절/취소된 신청은 사유 표시 가능 (운영자가 사용자 친화적 사유 입력)

### 7.4 어드민 보안

- NextAuth Credentials + bcrypt(12) ENV
- ID: `adminyeowol` / 해시는 `ADMIN_PASSWORD_HASH` ENV
- 로그인 실패 5회 → 15분 잠금
- 세션 12시간 httpOnly+secure+sameSite=lax

### 7.5 개인정보

- 수집 최소: 이름·연락처·이메일·구획수·동의
- 평문 저장 (Turso 자체 암호화 at rest)
- **파기**: 시즌 종료 + 1년 후 cron 스크립트 또는 수동 트리거
- DSR: 신청자가 운영자에게 메일/전화 요청 → 어드민에서 처리

---

## 8. Test Plan

| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest | findContiguousGroup, 가격 계산, zod, applicationNumber 발급 |
| Integration | Vitest + libSQL `:memory:` | autoAllocate 트랜잭션, lookup API |
| E2E | Playwright | 신청 → 어드민 승인 → 본인 조회 시나리오 |

핵심 테스트:
- 자동 배정 8케이스 (인접 묶음, 동시성, race condition)
- 본인 조회: 일치/불일치/rate-limit
- Announcement CRUD
- applicationNumber 시즌 내 시퀀스 정합성

---

## 9. Clean Architecture

| Layer | Location |
|-------|----------|
| Presentation | `app/`, `components/`, `hooks/` |
| Application | `lib/allocation.ts`, `lib/applications.ts`, `lib/announcements.ts`, `lib/pricing.ts` |
| Domain | `lib/schemas/` |
| Infrastructure | `db/index.ts` (Drizzle), `db/schema.ts`, `lib/rate-limit.ts` |

---

## 10. Coding Convention Reference

(v0.3 동일)

### 10.3 Environment Variables (v0.4 최종)

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | https://yeowolfarm.netlify.app | Client |
| `NEXT_PUBLIC_FARM_LAT` | 37.514173 | Client |
| `NEXT_PUBLIC_FARM_LNG` | 126.793019 | Client |
| `NEXT_PUBLIC_FARM_ADDRESS` | "경기도 부천시 오정구 여월동 112" | Client |
| `NEXT_PUBLIC_NAVER_MAP_PLACE_ID` | 2003003971 | Client |
| `NEXT_PUBLIC_GA_ID` | GA4 (선택) | Client |
| `TURSO_DATABASE_URL` | `libsql://yeowolgarden-xxx.turso.io` | Server |
| `TURSO_AUTH_TOKEN` | Turso 인증 토큰 | Server |
| `NEXTAUTH_URL` | https://yeowolfarm.netlify.app | Server |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Server |
| `ADMIN_ID` | `adminyeowol` | Server |
| `ADMIN_PASSWORD_HASH` | bcrypt 해시 | Server |
| `BANK_INFO_DISPLAY` | "농축협 351-1352-647143 농업회사법인 (유)호정" | Server |
| `OPERATOR_PHONE` | 운영자 연락처 (UI 표시용) | Server |

**제거된 ENV** (v0.3 → v0.4):
- ~~`FIREBASE_*` (전부)~~
- ~~`GMAIL_USER`, `GMAIL_APP_PASSWORD`~~
- ~~`OPERATOR_NOTIFY_EMAIL`~~
- ~~`RESEND_*`~~

---

## 11. Implementation Guide

### 11.1 File Structure (v0.4)

```
yeowolgarden/  (= C:\dev\yeowol garden\)
├── app/
│   ├── (public)/
│   │   ├── layout.tsx, page.tsx
│   │   ├── plots/, access/, about/, gallery/, faq/
│   │   ├── apply/
│   │   │   ├── page.tsx                  # 신청 폼
│   │   │   ├── success/page.tsx          # 신청 완료 (번호·계좌·안내)
│   │   │   └── status/page.tsx           ⭐ 본인 조회
│   │   ├── notice/page.tsx               ⭐ 공지 목록
│   │   ├── privacy/, terms/
│   ├── admin/
│   │   ├── layout.tsx, login/, page.tsx
│   │   ├── applications/, plots/, settings/
│   │   └── announcements/                ⭐ 공지 관리
│   ├── api/
│   │   ├── applications/route.ts
│   │   ├── applications/lookup/route.ts  ⭐
│   │   ├── plots/availability/route.ts
│   │   ├── announcements/route.ts        ⭐
│   │   ├── admin/...
│   │   └── admin/announcements/[id]/route.ts ⭐
│   ├── error.tsx, robots.ts, sitemap.ts, layout.tsx
├── components/{ui,public,admin}/
├── lib/
│   ├── db.ts                             # Drizzle + libSQL client
│   ├── auth.ts, rate-limit.ts
│   ├── allocation.ts                     # 자동 배정 (Drizzle 트랜잭션)
│   ├── applications.ts                   # 신청 생성·조회 헬퍼
│   ├── announcements.ts                  # 공지 CRUD 헬퍼
│   ├── pricing.ts, seo.ts
│   └── schemas/
├── db/
│   ├── schema.ts                         # Drizzle 스키마
│   └── migrations/                       # drizzle-kit 자동 생성
├── content/  data/  scripts/  public/  tests/
├── middleware.ts                         # 어드민 보호
├── drizzle.config.ts                     ⭐ Drizzle 설정
├── netlify.toml                          # Netlify 빌드
├── .env.example
├── next.config.ts, tailwind.config.ts, tsconfig.json, package.json

❌ 제거됨: emails/ (이메일 템플릿), prisma/, firebase 관련 파일
```

### 11.2 Implementation Order (v0.4 단순화)

| M | 기간 | 작업 |
|---|---|---|
| M1 | 1주 | Next.js + Tailwind + shadcn + **Turso/Drizzle 초기화** + Netlify 연결 |
| M2 | 3주 | 정적 페이지 + **공지 목록 페이지** |
| M3 | 2주 | 신청 폼 + API (Turso) + 신청 완료 화면 + **본인 조회 페이지** |
| M4 | 3주 | 어드민 (목록·상세·자동배정·공지 CRUD·구획 그리드) |
| M5 | 2주 | 테스트 + 최적화 |
| M6 | 2주 | Netlify 연결·SEO·매뉴얼 |
| M7 | - | 신청 개시 |

**이메일 제거 효과**: M3·M4에서 약 **1주 단축**.

---

## 12. Open Questions (v0.4 최신)

| ID | 질문 | 답변 | 상태 |
|----|---|---|---|
| Q-01~Q-18 | (v0.3 답변 유지) | | ✅ |
| Q-19 | 홈페이지 공지 의미 | **(c) 사이트 공지 + 개별 조회 페이지 + 배정 확인** | ✅ |
| Q-20 | DB 선택 | **Turso (SQLite + Drizzle)** | ✅ |
| Q-21 | 이메일 발송 | **없음** (어드민·홈페이지·조회페이지로 대체) | ✅ |
| Q-22 | 신청번호 형식 | **자동 증가 정수 #1, #2, ...** (시즌별 reset) | ✅ (가정 적용) |
| Q-23 | 본인 확인 방식 | **신청번호 + 이메일 일치** | ✅ (가정 적용) |
| Q-24 | 어드민 비밀번호 | **`jaeho6108!`** (운영 시점 변경 권장) | 🟡 임시 |
| Q-25 | Project name | **yeowolgarden** (GitHub repo 이름 반영) | ✅ |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-05-16 | 초안 — Supabase+Vercel+Resend |
| 0.2 | 2026-05-16 | Q-01~Q-11 — 균일 5평·인접 강제·desiredCount |
| 0.3 | 2026-05-16 | Netlify+Firebase(asia-northeast3)+Gmail SMTP+netlify.app |
| 0.4 | 2026-05-16 | **Turso 전환 + 이메일 제거**. Firebase 제거, Drizzle ORM. **본인 조회 페이지 + 공지 시스템** 추가. Announcement 테이블·applicationNumber 필드 신설. M3·M4 약 1주 단축 |
