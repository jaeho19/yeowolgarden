---
template: do
version: 1.0
feature: yeowolgarden
date: 2026-05-16
author: 운영자 + Claude
project: 여월농장 (Yeowol Farm)
status: In Progress (v0.3 - Turso/Drizzle + 이메일 제거 + 신청 조회 추가)
---

# 여월농장 홈페이지 + 분양 자동배정 시스템 Implementation Guide

> **Summary**: Next.js 14 + Tailwind + shadcn/ui + Turso(SQLite) + Drizzle ORM + Netlify. **이메일 없음**. M1~M7, 12월 라이브.
>
> **Project**: yeowolgarden (GitHub: jaeho19/yeowolgarden)
> **Version**: 0.3.0
> **Status**: In Progress (M1 ready)
> **Plan**: [yeowol-farm-website.plan.md v0.4](../../01-plan/features/yeowol-farm-website.plan.md)
> **Design**: [yeowol-farm-website.design.md v0.4](../../02-design/features/yeowol-farm-website.design.md)

---

## 0. Project Decisions (최종)

| 항목 | 값 |
|---|---|
| 프로젝트 루트 | `C:\dev\yeowol garden\` |
| GitHub repo | https://github.com/jaeho19/yeowolgarden |
| 패키지 매니저 | pnpm |
| Node | 20 LTS+ |
| 호스팅 | **Netlify** (https://yeowolfarm.netlify.app) |
| DB | **Turso (SQLite + libSQL)** |
| ORM | **Drizzle ORM** |
| Auth | NextAuth Credentials + bcrypt (`adminyeowol` / `jaeho6108!`) |
| 이메일 | **❌ 없음** — 본인 조회 페이지 + 사이트 공지로 대체 |
| 지도 | **Naver 지도 iframe 임베드** (37.514173, 126.793019) — API 가입 불필요 |

---

## 1. Pre-Implementation Checklist

### 1.1 Documents Verified

- [x] Plan v0.4
- [x] Design v0.4

### 1.2 Environment Ready (M1)

- [ ] Node.js 20 LTS
- [ ] pnpm (`npm i -g pnpm`)
- [ ] Git
- [ ] VS Code 확장 (ESLint, Prettier, Tailwind, SQLTools)

### 1.3 외부 서비스 계정

| # | 서비스 | 용도 | 무료 한도 | 상태 |
|---|---|---|---|---|
| 1 | **Netlify** | 호스팅 | 100GB BW/월 | ✅ 가입 완료 |
| 2 | **GitHub** | 코드 저장소 | 무료 private | ✅ repo 생성 완료 |
| 3 | **Turso** | DB (SQLite) | 9GB + 1B reads/월 | ☐ 가입 필요 |
| ~~4~~ | ~~Kakao Developers~~ | (제거됨, Naver iframe으로 대체) | - | ✅ 작업 없음 |
| 5 | Google Search Console | SEO | 무료 | ☐ (배포 후) |

---

## 2. Implementation Order (M1 ~ M7, v0.4 단순화)

| M | 기간 | 작업 | 상태 |
|---|---|---|---|
| **M1** | 5~7월 (1주) | Next.js + Tailwind + shadcn + **Turso/Drizzle** + Netlify | 🟢 **시작 가능** |
| M2 | 7~8월 (3주) | 정적 페이지 8개 + **공지 목록** + 공지 데이터 모델 | ⏳ |
| M3 | 8~9월 (2주) | 신청 폼 + 신청 완료 화면 + **본인 조회 페이지** + API | ⏳ |
| M4 | 9~10월 (3주) | 어드민 (목록·상세·자동배정·공지 CRUD·구획 그리드) | ⏳ |
| M5 | 10~11월 (2주) | 테스트 + 최적화 | ⏳ |
| M6 | 11~12월 (2주) | Netlify 연결·SEO·매뉴얼 | ⏳ |
| M7 | 12월~ | 신청 개시 | ⏳ |

이메일 제거로 **M3·M4 약 1주 단축**.

---

## 3. M1: 인프라 셋업

### 3.1 운영자 사전 작업 (3가지로 단축)

#### 1) Turso 가입 + DB 생성 (10분)

**Turso CLI 설치 (Windows):**
```powershell
# PowerShell에서 (관리자 권한 불필요)
irm get.tur.so/install.ps1 | iex
# 또는 npm으로
npm install -g @libsql/cli
```

또는 macOS:
```bash
brew install tursodatabase/tap/turso
```

**가입 + DB 생성:**
```bash
turso auth signup          # GitHub로 가입
turso auth login

# DB 생성 (Tokyo region, 한국에서 가장 가까움)
turso db create yeowolgarden --location nrt

# DB URL 확인
turso db show yeowolgarden --url
# 출력: libsql://yeowolgarden-<user>.turso.io

# 인증 토큰 발급
turso db tokens create yeowolgarden
# 출력: eyJ... (긴 문자열)
```

**결과물**:
- `TURSO_DATABASE_URL`: `libsql://yeowolgarden-<user>.turso.io`
- `TURSO_AUTH_TOKEN`: 발급된 JWT

#### 2) Netlify 사이트 클레임 (5분)

1. Netlify Dashboard → "Add new site" → "Import from Git"
2. GitHub 계정 연결 → `jaeho19/yeowolgarden` 선택
3. Build 설정: 자동 감지 (Next.js)
4. 사이트 생성 후 → Site settings → **Change site name** → `yeowolfarm`
5. 결과: `https://yeowolfarm.netlify.app`

**참고: 지도는 Naver iframe 임베드 사용 → API 키 발급 불필요.** `AccessMap.tsx` 컴포넌트가 운영자의 네이버 지도 페이지를 iframe으로 직접 표시.

**총 15분 (Turso 10 + Netlify 5).**

→ 완료 후 운영자가 알려줄 정보:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- Netlify 사이트 연결 확인 (자동)

### 3.2 Claude 코딩 작업

#### 3.2.1 Next.js 초기화

```bash
cd "C:\dev\yeowol garden"
# GitHub repo가 이미 있으니 clone 또는 git pull 후 작업
# 또는 빈 디렉토리에서 시작:
pnpm create next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --use-pnpm
```

#### 3.2.2 shadcn/ui

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card form input label textarea select checkbox dialog sheet sonner table tabs accordion alert badge separator
```

#### 3.2.3 의존성 (v0.3 단순화 — 이메일 제거, Turso 추가)

```bash
# Domain / Form
pnpm add zod react-hook-form @hookform/resolvers

# DB (Turso + Drizzle)
pnpm add @libsql/client drizzle-orm
pnpm add -D drizzle-kit

# Auth
pnpm add next-auth@beta bcryptjs
pnpm add -D @types/bcryptjs

# ID 생성
pnpm add @paralleldrive/cuid2

# 유틸
pnpm add date-fns date-fns-tz clsx tailwind-merge

# Markdown (공지에 사용)
pnpm add react-markdown

# Dev
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @playwright/test prettier prettier-plugin-tailwindcss @types/node
```

**제거된 의존성** (이전 v0.2와 비교):
- ~~`@prisma/client`, `prisma`~~
- ~~`firebase`, `firebase-admin`~~
- ~~`resend`, `nodemailer`, `@react-email/*`, `@types/nodemailer`~~

#### 3.2.4 Drizzle 초기화

`drizzle.config.ts`:
```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config
```

`db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})
export const db = drizzle(client, { schema })
```

`db/schema.ts`: Design §3.2의 코드 그대로

**마이그레이션 생성 + 적용:**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

#### 3.2.5 디렉토리 구조

```bash
mkdir -p app/api/{applications,admin,plots,announcements} \
         app/(public)/{plots,access,about,gallery,faq,apply,notice,privacy,terms} \
         app/(public)/apply/{success,status} \
         app/admin/{login,applications,plots,announcements,settings} \
         components/{ui,public,admin} \
         lib/schemas db scripts content tests/{unit,integration,e2e}
```

#### 3.2.6 환경변수 `.env.example`

```env
# ─── Public ───
NEXT_PUBLIC_SITE_URL=https://yeowolfarm.netlify.app
NEXT_PUBLIC_FARM_LAT=37.514173
NEXT_PUBLIC_FARM_LNG=126.793019
NEXT_PUBLIC_FARM_ADDRESS=경기도 부천시 오정구 여월동 112
NEXT_PUBLIC_NAVER_MAP_PLACE_ID=2003003971
NEXT_PUBLIC_GA_ID=

# ─── Turso DB ───
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# ─── Auth ───
NEXTAUTH_URL=https://yeowolfarm.netlify.app
NEXTAUTH_SECRET=
ADMIN_ID=adminyeowol
ADMIN_PASSWORD_HASH=

# ─── 사업 정보 (UI 표시) ───
BANK_INFO_DISPLAY=농축협 351-1352-647143 농업회사법인 (유)호정
OPERATOR_PHONE=
```

#### 3.2.7 어드민 비밀번호 해시 생성

`scripts/hash-password.ts`:
```typescript
import bcrypt from 'bcryptjs'

const pw = process.argv[2]
if (!pw) { console.error('Usage: pnpm tsx scripts/hash-password.ts <password>'); process.exit(1) }

const hash = bcrypt.hashSync(pw, 12)
console.log('ADMIN_PASSWORD_HASH=' + hash)
```

실행:
```bash
pnpm tsx scripts/hash-password.ts 'jaeho6108!'
# 출력: ADMIN_PASSWORD_HASH=$2b$12$...
# 이 값을 .env.local에 저장
```

#### 3.2.8 .gitignore

```
.env*.local
.env
!.env.example
/.next/
/node_modules/
/coverage/
/db/migrations/meta/_journal.json   # (선택, 협업 시 포함 권장)
*.log
```

#### 3.2.9 Netlify 빌드 설정

`netlify.toml`:
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "8"
```

Netlify Dashboard → Site settings → Environment variables에 `.env.local`의 모든 키를 복사·붙여넣기 (값들).

#### 3.2.10 CLAUDE.md

프로젝트 루트에 코딩 컨벤션 작성 (Design §10 기반).

### 3.3 M1 완료 기준

- [ ] `pnpm dev` → localhost:3000 동작
- [ ] `pnpm build` 0 에러
- [ ] Drizzle 마이그레이션 적용 OK
- [ ] Turso에 plots/applications/announcements/auditLogs/settings 테이블 생성 확인
- [ ] Netlify preview 자동 배포 OK
- [ ] `.env.example` ↔ `.env.local` 키 일치

---

## 4. M2~M7 (개요)

Design §11.2와 동일. 핵심 변경:

### M2 추가 작업
- `/notice` 페이지 (Announcement 목록)
- 홈 상단 `AnnouncementBanner` 컴포넌트 (핀고정 1개 미리보기)

### M3 추가 작업
- **`/apply/status` 페이지** + `LookupForm` 컴포넌트
- `GET /api/applications/lookup` API + rate-limit + constant-time 비교
- `applicationNumber` 자동 발급 로직 (시즌 내 시퀀스)
- 신청 완료 화면에 신청번호·계좌·조회 URL 표시 + `CopyButton`

### M4 추가 작업
- `/admin/announcements` 페이지 (목록 + 작성/수정 에디터)
- Announcement CRUD API

---

## 5. Dependencies (전체 요약 v0.3)

```bash
# Runtime
pnpm add \
  zod react-hook-form @hookform/resolvers \
  @libsql/client drizzle-orm \
  next-auth@beta bcryptjs \
  @paralleldrive/cuid2 \
  date-fns date-fns-tz clsx tailwind-merge \
  react-markdown

# Dev
pnpm add -D \
  drizzle-kit \
  vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom \
  @playwright/test \
  prettier prettier-plugin-tailwindcss \
  @types/bcryptjs @types/node \
  netlify-cli
```

---

## 6. Implementation Notes

### 6.1 Key Patterns

**Drizzle 쿼리:**
```ts
import { db } from '@/db'
import { applications } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const app = await db.select().from(applications).where(eq(applications.id, id)).get()
```

**Drizzle 트랜잭션 (자동 배정):**
```ts
await db.transaction(async (tx) => {
  const app = await tx.select()...
  // ...
  await tx.update(plots).set({ status: 'OCCUPIED' }).where(...)
})
```

**본인 조회 (rate-limit + constant-time):**
```ts
// app/api/applications/lookup/route.ts
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!(await rateLimit(`lookup:${ip}`, { limit: 5, window: 60 }))) {
    return Response.json({ error: { code: 'LOOKUP_RATE_LIMITED' } }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = LookupInputSchema.safeParse({
    applicationNumber: Number(searchParams.get('number')),
    email: searchParams.get('email'),
  })
  if (!parsed.success) return Response.json({ error: { code: 'VALIDATION_FAILED' } }, { status: 400 })

  // 시즌은 settings에서 가져옴
  const season = await getCurrentSeasonYear()

  const app = await db.select().from(applications)
    .where(and(
      eq(applications.applicationNumber, parsed.data.applicationNumber),
      eq(applications.email, parsed.data.email),
      eq(applications.seasonYear, season),
    )).get()

  if (!app) {
    // 보안: 처리 시간 일정하게
    await new Promise(r => setTimeout(r, 100))
    return Response.json({ error: { code: 'LOOKUP_NOT_FOUND' } }, { status: 404 })
  }

  // 공개 필드만
  return Response.json({
    applicationNumber: app.applicationNumber,
    name: app.name,
    status: app.status,
    desiredCount: app.desiredCount,
    totalAreaPyeong: app.desiredCount * 5,
    totalPriceKrw: app.totalPriceKrw,
    assignedPlots: app.plotNumbers ? JSON.parse(app.plotNumbers).map((n: number) => ({ plotNumber: n })) : [],
    seasonYear: app.seasonYear,
    createdAt: app.createdAt,
    approvedAt: app.approvedAt,
    rejectionReason: app.rejectionReason,
  })
}
```

### 6.2 Avoid

- ❌ Prisma, Firebase, Nodemailer, Resend (모두 제거)
- ❌ 이메일 발송 코드 (전혀 작성하지 말 것)
- ❌ 사용자에게 본인 외 다른 신청 정보 노출 (다른 신청자 이름·전화번호 등)
- ❌ 공지 본문에 사용자 개인정보 포함 (관리자 실수 방지 안내 문구)
- ❌ Service Account JSON, App Password 등의 키 Git 커밋

### 6.3 Security Checklist

- [ ] `TURSO_AUTH_TOKEN` 서버 ENV만, Git 미커밋
- [ ] 본인 조회 rate-limit 활성화
- [ ] 본인 조회 응답 시간 일정 (100ms 지연 추가)
- [ ] 본인 조회 응답 필드 화이트리스트
- [ ] 어드민 미들웨어 모든 `/admin/*`·`/api/admin/*` 보호
- [ ] bcrypt cost 12
- [ ] 어드민 비밀번호 운영 전 변경

---

## 7. Testing

| Type | Target | Tool |
|------|--------|------|
| Unit | findContiguousGroup, 가격, applicationNumber 발급 | Vitest |
| Integration | autoAllocate, lookup API, announcements CRUD | Vitest + libSQL `:memory:` |
| E2E | 신청 → 어드민 승인 → 본인 조회 → 배정 확인 | Playwright |

**libSQL in-memory 테스트:**
```ts
import { createClient } from '@libsql/client'
const client = createClient({ url: ':memory:' })
// drizzle 인스턴스 + 마이그레이션 적용 후 테스트
```

---

## 8. Progress Tracking

| Milestone | 시작 | 종료 | 상태 |
|---|---|---|---|
| M1 인프라 | - | - | 🟢 Ready (운영자 3가지 완료 후 즉시 가능) |
| M2~M7 | - | - | ⏳ |

---

## 9. Ready for Check Phase

M1~M6 완료 후:
```bash
/pdca analyze yeowolgarden
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-05-16 | Vercel+Supabase+Resend |
| 0.2 | 2026-05-16 | Netlify+Firebase+Gmail App Password |
| 0.3 | 2026-05-16 | **Turso(SQLite)+Drizzle 전환, 이메일 제거**. 운영자 사전 작업 50분→25분. 의존성 Firebase·Nodemailer 제거. 본인 조회 페이지·공지 CRUD 페이지 추가. 프로젝트명 yeowolgarden |
| 0.3.1 | 2026-05-16 | **Kakao Maps → Naver iframe 임베드** 전환. Kakao Developers 가입·API 키 발급 단계 제거. 운영자 사전 작업 25분→15분 |
