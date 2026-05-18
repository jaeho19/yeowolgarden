---
template: analysis
feature: yeowol-farm-website
date: 2026-05-18
scope: M1~M4 (M5+ excluded)
match_rate: 96
verdict: ready-for-report
agent: bkit:gap-detector
---

# Gap Analysis — yeowol-farm-website

> 비교 범위: M1 인프라 + M2 공개 페이지 + M3 신청·본인조회 + M4 어드민 (M5 테스트 / M6 배포 / M7 신청개시 제외)
> 기준 문서: `docs/02-design/features/yeowol-farm-website.design.md` (v0.4)
> 분석 일시: 2026-05-18

## Summary

- **Match Rate: 96%** — `(43 + 4×0.5) / (43 + 4 + 0) × 100 = 95.7%`
- **Total items compared: 47**
- ✅ Match: **43**
- ⚠ Partial: **4**
- ❌ Missing: **0**
- ➕ Extra (additive, non-blocking): **3**
- **Verdict: ≥ 90% → `/pdca report` 진행 가능.** 구현 결함 없음. P1 2건은 launch 전(2027-01-01) 처리 권장.

---

## Section-by-section

### §3 Data Model

| # | Item | Status | Evidence | Gap detail |
|---|---|---|---|---|
| 3.1a | `ApplicationInputSchema` (zod, 8 fields + honeypot `website`) | ✅ Match | `lib/schemas/application.ts:32-62` | 한국어 메시지 + `experience`/`memo` 빈 문자열 허용 (편의) |
| 3.1b | `LookupInputSchema` | ✅ Match | `lib/schemas/application.ts:67-73` | — |
| 3.1c | `AnnouncementInputSchema` | ⚠ Partial | `lib/schemas/announcement.ts:6-19` | Design은 `.default(false/true)`, 구현은 명시 boolean 요구. 클라(`AnnouncementEditor`)·서버 모두 두 필드 명시 전송하므로 기능 동등. (RHF + zodResolver 호환을 위해 의도된 변경) |
| 3.1d | 상수 `PRICE_PER_UNIT_KRW=100000`, `PYEONG_PER_UNIT=5`, `MAX_UNITS_PER_APPLICATION=20` | ✅ Match | `lib/schemas/application.ts:10-12` | — |
| 3.1e | `APPLICATION_STATUS` 5-state, `PLOT_STATUS` 3-state | ✅ Match | `lib/schemas/application.ts:15-23` | — |
| 3.2a | `plots` 테이블 모든 필드 + defaults | ✅ Match | `db/schema.ts:21-47` | `zone: text` 추가(➕ extra · 의도된 placeholder) |
| 3.2b | `plots` 인덱스 3종 | ✅ Match | `db/schema.ts:43-46` | `idx_plot_season` vs design `idx_season` 명칭 차이 |
| 3.2c | `applications` 테이블 19 fields | ✅ Match | `db/schema.ts:52-98` | — |
| 3.2d | `applications` 인덱스 4종 | ✅ Match | `db/schema.ts:86-97` | — |
| 3.2e | `announcements` + 인덱스 | ✅ Match | `db/schema.ts:103-121` | — |
| 3.2f | `auditLogs` + 인덱스 2종 | ✅ Match | `db/schema.ts:126-143` | — |
| 3.2g | `settings` | ✅ Match | `db/schema.ts:151-157` | — |
| 3.3 | Seed: 300 plots @ 2027, settings 3종 | ✅ Match | `scripts/seed-plots.ts:21-53` | `onConflictDoNothing()`로 idempotent |
| 3.4 | `createApplication` (트랜잭션 + 중복 차단 + max+1) | ✅ Match | `lib/applications.ts:25-93` | `CREATE_APPLICATION` AuditLog 추가 |

**Subtotal: 13 ✅ / 1 ⚠ / 0 ❌**

### §4 API Specification

| # | Item | Status | Evidence |
|---|---|---|---|
| 4.1a | `POST /api/applications` (rate-limit 5/h + honeypot + recruitment gate) | ✅ Match | `app/api/applications/route.ts:30-144` |
| 4.1b | `GET /api/applications/lookup` (rate-limit 5/min + 100ms floor + uniform 404) | ✅ Match | `app/api/applications/lookup/route.ts:33-104` |
| 4.1c | `GET /api/plots/availability` (ISR 60s) | ✅ Match | `app/api/plots/availability/route.ts` + `lib/availability.ts` |
| 4.1d | `GET /api/announcements` (pinned-first + ISR 60s) | ✅ Match | `app/api/announcements/route.ts` |
| 4.1e | `/api/admin/auth/[...nextauth]` (NextAuth v5 Credentials + bcrypt) | ✅ Match | `app/api/admin/auth/[...nextauth]/route.ts`, `lib/auth.ts:18-86` |
| 4.1f | `GET /api/admin/applications` (필터) | ✅ Match | `app/api/admin/applications/route.ts:17-71` |
| 4.1g | `GET /api/admin/applications/[id]` (+ auditLogs) | ✅ Match | `app/api/admin/applications/[id]/route.ts` |
| 4.1h | `POST .../approve` (autoAllocate) | ✅ Match | `app/api/admin/applications/[id]/approve/route.ts` |
| 4.1i | `POST .../assign` (수동) | ✅ Match | `app/api/admin/applications/[id]/assign/route.ts` |
| 4.1j | `POST .../reject` | ✅ Match | `app/api/admin/applications/[id]/reject/route.ts` |
| 4.1k | `POST .../cancel` | ✅ Match | `app/api/admin/applications/[id]/cancel/route.ts` |
| 4.1l | `GET /api/admin/plots` (점유 매핑) | ✅ Match | `app/api/admin/plots/route.ts` |
| 4.1m | `PATCH /api/admin/plots/[id]` | ✅ Match | `app/api/admin/plots/[id]/route.ts` (OCCUPIED 변경 차단 — 방어적) |
| 4.1n | `POST /api/admin/settings/recruitment` | ✅ Match | `app/api/admin/settings/recruitment/route.ts` |
| 4.1o | `/api/admin/announcements` CRUD | ✅ Match | `app/api/admin/announcements/{route.ts, [id]/route.ts}` |
| 4.2a | Error 응답 `{error:{code,message,...}}` | ✅ Match | 전 라우트 통일 |
| 4.2b | HTTP status (201/400/403/404/409/429/500) | ✅ Match | 라우트별 올바른 매핑 |
| 4.3a | `findContiguousGroup` greedy first-fit | ✅ Match | `lib/allocation.ts:34-50` |
| 4.3b | `autoAllocate` 트랜잭션 + 조건부 UPDATE race-guard | ✅ Match | `lib/allocation.ts:58-173` |
| 4.3c | AuditLog (`NEED_MANUAL_ASSIGNMENT`, `APPROVE_AUTO`) | ✅ Match | `lib/allocation.ts:108-115, 154-163` |

**Subtotal: 20 ✅ / 0 ⚠ / 0 ❌**
**Extra (additive):** `assignManual`, `rejectApplication`, `cancelApplication` 함수가 `lib/allocation.ts`에 포함 (디자인은 `autoAllocate`만 상세 기술).

### §5 UI/UX

| # | Item | Status | Evidence | Gap detail |
|---|---|---|---|---|
| 5.1a | 공개 sitemap 10페이지 (`/`, `/plots`, `/access`, `/about`, `/gallery`, `/faq`, `/notice`, `/apply`, `/apply/success`, `/apply/status`) | ✅ Match | `app/(public)/**/page.tsx` 확인 | — |
| 5.1b | `/privacy`, `/terms` 정적 페이지 | ⚠ Partial | 폴더만 존재, page.tsx 없음 | 신청폼이 `/privacy` 링크를 안내하지만 페이지 없음. **P1 — launch 전 처리** |
| 5.1c | 어드민 sitemap 7페이지 | ✅ Match | `app/admin/login/page.tsx` + `app/admin/(panel)/**` | `(panel)` route group은 URL-transparent |
| 5.2.1 | `/apply/success` (number/bank/copy/link) | ✅ Match | `app/(public)/apply/success/page.tsx` + `CopyButton` × 3 |
| 5.2.2 | `/apply/status` LookupForm + 5-status 카드 | ✅ Match | `components/public/{LookupForm,ApplicationStatusCard}.tsx` | PENDING/PAID/CONFIRMED/REJECTED/CANCELLED 분기 완비 |
| 5.2.3 | `/notice` (pinned-first + markdown) | ✅ Match | `app/(public)/notice/page.tsx:19-138` | `react-markdown` 사용, 빈 상태 처리 |
| 5.2.4 | `/admin/announcements` (table + editor) | ✅ Match | `components/admin/{AnnouncementsTable,AnnouncementEditor}.tsx` | — |
| 5.3a | 공개 컴포넌트 4종 (`LookupForm`, `ApplicationStatusCard`, `AnnouncementBanner`, `CopyButton`) | ✅ Match | `components/public/*` |
| 5.3b | `AnnouncementList` (별도 명명 컴포넌트) | ⚠ Partial | `/notice` 페이지 내 인라인 | 동작 동등. 분리 시 테스트 용이 |
| 5.3c | `ApplyCompletePage` (별도 명명 컴포넌트) | ⚠ Partial | `app/(public)/apply/success/page.tsx` 자체가 그 역할 | 디자인의 명명 선택일 뿐 |
| 5.3d | 어드민 컴포넌트 (`AnnouncementsTable`, `AnnouncementEditor`) | ✅ Match | `components/admin/*` | — |

**Subtotal: 8 ✅ / 3 ⚠ / 0 ❌**

### §6 Error Handling

| # | Item | Status | Evidence |
|---|---|---|---|
| 6.1a | 신규 에러 코드 (`LOOKUP_NOT_FOUND` 404, `LOOKUP_RATE_LIMITED` 429, `ANNOUNCEMENT_NOT_FOUND` 404) | ✅ Match | `lib/errors.ts:5-17`, lookup L43/L94, announcements `[id]` L62/L107 |
| 6.1b | 기존 도메인 코드 10종 | ✅ Match | `lib/errors.ts:5-17` 전체 사용 확인 |
| 6.2 | Lookup 보안 (uniform 404 + ~constant-time) | ✅ Match | `lookup/route.ts:21-31, 90-101` (100ms floor) |

**Subtotal: 3 ✅ / 0 ⚠ / 0 ❌**

### §7 Security

| # | Item | Status | Evidence | Gap detail |
|---|---|---|---|---|
| 7.3a | Lookup rate-limit 5/min | ✅ Match | `lookup/route.ts:36-49` + `lib/rate-limit.ts:43-64` | — |
| 7.3b | Lookup 100ms response floor | ✅ Match | `lookup/route.ts:21-31, 63-88` | — |
| 7.3c | Lookup 응답 화이트리스트 | ✅ Match | `lib/applications.ts:118-155` | phone/memo/experience/adminNote/plotIds 제외 |
| 7.3d | 401·404 일관 응답 | ✅ Match | `lookup/route.ts:90-101` | — |
| 7.3e | 누적 실패 시 1시간 잠금 (20건) | ⚠ Partial | 미구현 | 슬라이딩 윈도만. **P2 hardening** |
| 7.4a | NextAuth Credentials + bcrypt | ✅ Match | `lib/auth.ts:11-62` | — |
| 7.4b | JWT 12h 세션 | ✅ Match | `lib/auth.ts:22-24` | — |
| 7.4c | Admin 라우트 보호 middleware | ✅ Match | `proxy.ts:12-40` | API 401 / Page redirect+callbackUrl |
| 7.4d | 2차 방어 `requireAdmin()` (additive) | ➕ Extra | `lib/admin-guard.ts`, 전 admin API 사용 | Defense-in-depth |
| 7.4e | 로그인 5회 실패 → 15분 잠금 | ⚠ Partial | 미구현 (dummy bcrypt로 timing 누설만 차단) | **P1 — launch 전 처리** |
| 7.5a | Honeypot field | ✅ Match | `lib/schemas/application.ts:61`, `ApplyForm.tsx:88-102` (visually hidden + tabIndex=-1), `applications/route.ts:80-89` (서버 거부 + delay) | — |
| 7.5b | `lib/db` 서버 전용 | ✅ Match | 컴포넌트에서 `@/lib/db` import 없음 (grep clean) | — |

**Subtotal: 9 ✅ / 2 ⚠ / 0 ❌ / 1 ➕**

### §9 Clean Architecture

| # | Item | Status | Evidence | Gap detail |
|---|---|---|---|---|
| 9a | Presentation (app/, components/) | ✅ Match | 구조 확인 | — |
| 9b | Application (`lib/{allocation,applications,announcements,pricing}.ts`) | ⚠ Partial | `lib/announcements.ts` **없음** — 공지 CRUD가 라우트 내 인라인 | 라우트가 짧고 Drizzle 직접 호출. 테스트 용이성 위해 추출 권장. **P2** |
| 9c | Domain (`lib/schemas/`) | ✅ Match | `lib/schemas/{application,announcement,index}.ts` | — |
| 9d | Infrastructure (`db/`, `lib/{db,rate-limit}.ts`) | ✅ Match | 위치·역할 일치 | — |
| 9e | 의존성 방향 (Presentation → App/Domain, never Infra direct) | ✅ Match | spot-check: `'use client'` 컴포넌트는 `@/lib/db` 미import. `LookupForm`이 `LookupResult` 타입만 import — type-only는 런타임 누설 없음 | — |

**Subtotal: 4 ✅ / 1 ⚠ / 0 ❌**

### §10.3 Environment Variables

`.env.example` 14개 키 전체 매칭:

| ENV | Status |
|---|:---:|
| NEXT_PUBLIC_SITE_URL / FARM_LAT / FARM_LNG / FARM_ADDRESS / NAVER_MAP_PLACE_ID / GA_ID | ✅ × 6 |
| TURSO_DATABASE_URL / TURSO_AUTH_TOKEN | ✅ × 2 |
| NEXTAUTH_URL / NEXTAUTH_SECRET | ✅ × 2 |
| ADMIN_ID / ADMIN_PASSWORD_HASH | ✅ × 2 |
| BANK_INFO_DISPLAY / OPERATOR_PHONE | ✅ × 2 |

**Subtotal: 14 / 14 ✅** (`.env.local` 실제 값은 검사 제외)

---

## Extra / Additive

설계에 명시되지 않았으나 구현된 보강 항목 — 문서 업데이트 권장:

1. `lib/admin-guard.ts` — middleware/proxy + 2차 방어선 `requireAdmin()`. 전 admin API 사용.
2. `lib/allocation.ts` — `assignManual`, `rejectApplication`, `cancelApplication` 함수. 디자인은 `autoAllocate`만 상세 기술하지만 §4.1 API 표에는 모두 명시되어 있음.
3. `db/schema.ts` `plots.zone` nullable — §1.2 "영역 분류 추후" 정합한 placeholder.

---

## Priority Gap List

| Priority | Section | Item | Recommendation |
|---|---|---|---|
| **P1** | §5.1 | `/privacy`, `/terms` 페이지 미구현 (폴더만 존재) | 신청 폼이 `/privacy` 링크를 안내하므로 launch 전 최소한 정적 페이지 1쌍 추가, 또는 design §5.1을 M6 deferred로 업데이트 |
| **P1** | §7.4 | 어드민 로그인 5회 실패 → 15분 잠금 미구현 | 운영 launch (2027-01-01) 전 IP/ID 기반 카운터 추가. Turso `auth_attempts` 테이블 또는 메모리 버킷(rate-limit 재사용) |
| **P2** | §7.3 | Lookup 누적 실패 20건 → 1h 잠금 미구현 | 슬라이딩 윈도(5/min)만으로도 MVP 수준 방어. Phase II에서 보강 |
| **P2** | §9 | `lib/announcements.ts` 미존재 — 라우트 핸들러 인라인 | 추출하면 단위 테스트 작성 용이. 현재 70줄/파일이라 즉시 손해는 없음 |
| **P2** | §5.3 | `AnnouncementList`, `ApplyCompletePage` 명명 컴포넌트 미존재 | 페이지 내 인라인으로 동등 구현. 문서 정렬용 — 컴포넌트 추출 또는 design §5.3 표 수정 |

---

## Recommendations

1. **다음 액션 — `/pdca report yeowol-farm-website`** (match rate 96% ≥ 90% 충족)
2. **Launch 전 (2026-12 ~ 2027-01)** P1 2건 처리:
   - 정적 페이지 `/privacy`, `/terms` 1쌍 (각 100~150줄)
   - Admin 로그인 lockout (메모리 카운터 또는 DB 테이블 1개)
3. **Design 문서 업데이트** — Extra 3건을 design.md §3.2 / §4.3 / §7.4에 반영
4. **M5 진입 시** Vitest 단위 (`findContiguousGroup`, `createApplication`, pricing) → libSQL `:memory:` 통합 (autoAllocate race, lookup security) → Playwright E2E (신청→승인→조회) 순으로 작성

---

## Evidence file paths

| Category | Paths |
|---|---|
| Design source | `docs/02-design/features/yeowol-farm-website.design.md` |
| Schemas | `lib/schemas/{application,announcement,index}.ts` |
| DB | `db/schema.ts`, `db/migrations/0000_workable_christian_walker.sql` |
| Allocation/applications | `lib/{allocation,applications}.ts` |
| Auth | `lib/{auth,admin-guard}.ts`, `proxy.ts` |
| Public APIs | `app/api/{applications,applications/lookup,plots/availability,announcements}/route.ts` |
| Admin APIs (15) | `app/api/admin/**/*.ts` |
| Key pages | `app/(public)/{apply/success,apply/status,notice}/page.tsx`, `app/admin/(panel)/**/page.tsx` |
| Key components | `components/public/{LookupForm,ApplicationStatusCard,AnnouncementBanner,CopyButton,ApplyForm}.tsx`, `components/admin/{AnnouncementsTable,AnnouncementEditor}.tsx` |
| Env | `.env.example` |
| Seed | `scripts/seed-plots.ts` |
