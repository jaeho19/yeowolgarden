# yeowolgarden — 개발 가이드 (Claude/개발자용)

> 여월농장 홈페이지 + 분양 자동배정 시스템
> Plan/Design/Do 문서: `docs/01-plan/`, `docs/02-design/`, `docs/03-do/`

## 프로젝트 개요

- **목적**: 부천 여월농장의 2027 시즌 주말 텃밭 분양 모집·관리
- **데드라인**: 2026-12-31 라이브 → 2027-01-01 신청 접수 개시
- **핵심 기능**: 신청 폼 + 반자동 인접 구획 배정 + 본인 조회 + 사이트 공지
- **이메일 발송 없음** — 모든 안내는 사이트 공지 + 본인 조회 페이지로

## 기술 스택

| Layer | 선택 |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | Tailwind 4 + shadcn/ui (16 components, neutral base) |
| DB | Turso (libSQL/SQLite) + Drizzle ORM |
| Auth (어드민) | NextAuth v5 Credentials + bcrypt |
| Validation | zod + react-hook-form |
| Map | Naver 지도 iframe 임베드 (API 가입 X) |
| Hosting | Netlify (Next.js Runtime Plugin) |

## 명령어 Quick Reference

```bash
# 개발
pnpm dev                              # 로컬 dev (http://localhost:3000)
pnpm build                            # 프로덕션 빌드
pnpm lint                             # ESLint

# DB (Drizzle + Turso)
pnpm drizzle-kit generate             # schema 변경 → 마이그레이션 SQL 생성
pnpm drizzle-kit migrate              # Turso에 적용
pnpm drizzle-kit studio               # 브라우저 DB GUI

# 스크립트
pnpm tsx scripts/seed-plots.ts        # 시즌 plots 시드 (300개)
pnpm tsx scripts/check-db.ts          # DB 상태 검증
pnpm tsx scripts/hash-password.ts <pw> # 어드민 비번 해시 생성
```

## 디렉토리 구조

```
app/
  (public)/         # 공개 페이지 8개
    apply/
      success/      # 신청 완료 (신청번호·계좌 표시)
      status/       # 본인 조회 (신청번호+이메일)
  admin/            # 어드민 6개
  api/              # API Routes
db/
  schema.ts         # Drizzle 테이블 5개
  migrations/       # 자동 생성
components/{ui,public,admin}/
lib/
  db.ts             # Turso 클라이언트 (서버 전용)
  schemas/          # zod 스키마 (클라+서버 공유)
  allocation.ts     # 자동 배정 알고리즘 (M4에서 작성)
docs/               # PDCA 문서
사진/                # 운영자 제공 사진 9장
```

## 코딩 컨벤션

- **Naming**: 컴포넌트 PascalCase, 함수 camelCase, 상수 UPPER_SNAKE, 폴더 kebab-case
- **Import 순서**: react/next → 외부 → `@/...` → `./` → type
- **Server vs Client**: Server Component 우선, `'use client'`는 폼·지도·인터랙티브만
- **DB 접근**: `lib/db.ts`는 서버 전용. 클라이언트에서 import 금지 (TURSO_AUTH_TOKEN 노출)
- **zod 단일 소스**: `lib/schemas/`의 스키마를 클라+서버에서 공유

## 환경변수

`.env.example` 참조. 핵심:
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — DB
- `NEXTAUTH_SECRET` — 세션 암호화
- `ADMIN_ID`, `ADMIN_PASSWORD_HASH` — 어드민 단일 계정
- `BANK_INFO_DISPLAY` — 신청 완료 화면·공지에 표시

## 보안 원칙

- `.env.local` Git 미커밋 (`.gitignore` 처리됨)
- 모든 어드민 라우트 미들웨어 보호 (`middleware.ts` — M4에서)
- 본인 조회 API rate-limit + constant-time 비교
- 공개 응답 필드 화이트리스트 (운영자 메모·전화 비공개)

## 마일스톤 진행 상태

```
M1: 인프라 셋업          ✅
M2: 정적 페이지 8개      ⏳
M3: 신청 폼 + 본인 조회  ⏳
M4: 어드민 + 자동 배정   ⏳
M5: 테스트 + 최적화      ⏳
M6: Netlify 연결·매뉴얼  ⏳
M7: 신청 개시            ⏳
```

자세한 일정: `docs/03-do/features/yeowol-farm-website.do.md`
