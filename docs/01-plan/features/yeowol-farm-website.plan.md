---
template: plan
version: 1.2
feature: yeowol-farm-website
date: 2026-05-16
author: 운영자 (조경학과 교수)
project: 여월농장 (Yeowol Farm)
status: Approved (D-01~D-15 결정 완료, 인프라 전환)
---

# 여월농장(Yeowol Farm) 홈페이지 + 분양 자동배정 시스템 Planning Document

> **Summary**: 부천 여월농장 브랜드 사이트 + 27년 시즌 분양을 위한 **온라인 신청·반자동 배정 시스템** 구축 (Netlify + Firebase + Gmail SMTP)
>
> **Project**: yeowolgarden (GitHub: jaeho19/yeowolgarden)
> **Version**: 0.4.0 (D-16~D-22 반영: Turso 전환 + 이메일 제거 + 신청 조회·공지 추가)
> **Author**: 운영자 (서울시립대 조경학과 교수, 텍사스 A&M 박사)
> **Date**: 2026-05-16
> **Critical Deadline**: 2026-12-31 라이브 (2027년 1월 신청 접수 개시)
> **Status**: Approved — Design 단계 진입 가능

---

## 1. Overview

### 1.1 Purpose

부천 여월농장 브랜드 사이트를 구축하고, **2027년 시즌(1월 신청 → 3월 초 개장) 분양 모집을 온라인화**한다.

핵심 가치:
- **온라인 신청 + 반자동 구획 배정**: 사용자가 신청 → 입금 → 운영자가 어드민에서 입금 확인 후 "승인" 클릭 → 시스템이 사용자의 선호 영역(양지/그늘/입구/안쪽) 우선으로 빈 구획 자동 배정 → 확정 메일 발송
- **전문가 운영 브랜딩**: 농학·조경 박사·교수가 직영하는 학습형 텃밭
- **교통 접근성 강조**: 서울 인접 부천 입지를 지도+안내로 명확히 전달

### 1.2 Background

**비즈니스 컨텍스트:**
- 운영 형태: 주말 분양 텃밭 (マイファーム 모델 + 운영자 직영)
- 시즌 사이클: 1~2월 신청 → 3월 초 개장 → 11월 시즌 종료
- 현재 상황: 2026년 시즌은 이미 마감, **2027년 시즌이 첫 온라인 모집**
- 운영자 강점: 조경/농학 박사·교수, 텃밭 기술 자문 가능

**참고 사이트 분석 (사전):**

| 사이트 | 적합도 | 차용 요소 |
|---|---|---|
| myfarmer.jp/farms/95 | 매우 높음 | 정보 박스, 시설 아이콘, 교통 표기, 농원 개요 테이블 |
| THE FARM | 낮음 | 비주얼 톤 일부 |
| Farmhouse NaNa | 낮음 | 감성 카피 톤 |

### 1.3 Related Documents

- 사진 자료: `C:\dev\yeowol garden\사진\` (9장, KakaoTalk_20260516_*.jpg) — **AI 보정 후 사용**
- References: myfarmer.jp/farms/95, thefarm.co.jp

---

## 2. Scope

### 2.1 In Scope

**A. 정적 페이지 (브랜드 사이트)**
- [ ] 홈 — 히어로, 핵심 가치 3, 분양 미리보기, 오시는 길 미니, 갤러리, CTA
- [ ] 분양 안내 — 구획 정보, 가격, 시설, 농사 지원, 시즌 일정
- [ ] 오시는 길 — **Naver 지도 iframe 임베드** + 대중교통/자가용 경로 + 약도
- [ ] 농원 소개 — 운영자 프로필, 운영 철학
- [ ] 갤러리 — 사진 9장 AI 보정본
- [ ] FAQ — 분양/이용 관련 10+

**B. 신청·배정 시스템 (반자동)**
- [ ] 분양 신청 폼 — 이름, 연락처, 이메일, 선호 영역(양지/그늘/입구/안쪽 중 복수 선택), 구획 수, 농사 경험, 메모
- [ ] 신청 접수 → 자동 확인 메일 (입금 안내 포함)
- [ ] 운영자 어드민 페이지 (로그인 필수)
  - 신청 목록 조회/검색/필터
  - 입금 확인 후 "승인" 버튼
- [ ] **자동 배정 엔진** (승인 시 트리거)
  - 신청자의 선호 영역 우선
  - 해당 영역에서 빈 구획(plot_number 순) 자동 할당
  - 선호 영역 모두 마감 시 인접 영역에서 할당
  - 운영자가 수동 재배정 가능
- [ ] 배정 확정 시 사용자에게 자동 메일 (구획 번호, 위치, 개장일, 약도)
- [ ] 구획 현황 페이지 (어드민 전용) — 총 N / 배정 M / 가용 K, 영역별 통계
- [ ] **공개 잔여 구획 표시** (홈/분양 페이지) — 영역별 잔여 수만 표시 (개인정보 X)

**C. 인프라**
- [ ] Vercel 배포 + 커스텀 도메인 `yeowolfarm.kr` (우선) HTTPS
- [ ] DB (Supabase PostgreSQL — 무료 한도 충분)
- [ ] 이메일 발송 (Resend — 무료 100건/일)
- [ ] SEO 메타 + sitemap + OpenGraph
- [ ] 반응형(모바일 우선) + 한국어

### 2.2 Out of Scope

- 회원가입/로그인 (사용자 측) — 1회성 신청이므로 비회원 폼으로 충분
- PG 결제 시스템 (카드/즉시이체) — **1차는 계좌이체 + 수동 확인**, 2차 검토
- 다국어
- 블로그/일지
- 모바일 앱
- 게시판/커뮤니티
- CMS — MDX로 충분

---

## 3. Requirements

### 3.1 Functional Requirements

**브랜드 사이트:**

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 홈 히어로 (풀스크린 이미지 + H1/H2 + CTA 2개) | High | Pending |
| FR-02 | 분양 안내 (구획·가격·시설·시즌 일정) | High | Pending |
| FR-03 | 오시는 길 (Naver 지도 iframe 임베드 + 경로 안내 + 약도) | High | Pending |
| FR-04 | 운영자 프로필 페이지 | Medium | Pending |
| FR-05 | 갤러리 (AI 보정된 사진 9장 + 라이트박스) | Medium | Pending |
| FR-06 | FAQ (아코디언 UI) | Medium | Pending |
| FR-07 | SEO 메타 + OpenGraph + sitemap.xml | High | Pending |
| FR-08 | 모바일 햄버거 메뉴 + 하단 고정 CTA | Medium | Pending |

**신청·배정 시스템:**

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-09 | 분양 신청 폼 — zod 검증, 중복 신청 방지 (이메일 unique) | High | Pending |
| FR-10 | 신청 접수 시 사용자에게 자동 확인 메일 + 입금 안내 | High | Pending |
| FR-11 | 운영자 어드민 로그인 (환경변수 단일 계정) | High | Pending |
| FR-12 | 어드민 신청 목록 (상태별 필터, 검색, 정렬) | High | Pending |
| FR-13 | **자동 배정 엔진** — 승인 시 선호 영역 우선 빈 구획 자동 할당 | High | Pending |
| FR-14 | 배정 확정 메일 자동 발송 (구획 번호·위치·개장일) | High | Pending |
| FR-15 | 어드민 구획 현황 (총/배정/가용, 영역별 통계) | High | Pending |
| FR-16 | 공개 페이지에 영역별 잔여 구획 수 표시 | Medium | Pending |
| FR-17 | 어드민에서 수동 재배정/취소 기능 | Medium | Pending |
| FR-18 | 구획 시드 데이터 관리 (초기 구획 정의, 영역 분류) | High | Pending |
| FR-19 | 신청 마감 토글 (운영자가 어드민에서 모집 ON/OFF) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| Performance | Lighthouse Performance ≥ 90 (모바일), LCP ≤ 2.5s | Lighthouse CI |
| Accessibility | WCAG 2.1 AA, Lighthouse A11y ≥ 90 | Lighthouse |
| SEO | Lighthouse SEO ≥ 95, "부천 주말농장" 검색 노출 | Search Console |
| Security | HTTPS, 어드민 비밀번호 환경변수, 폼 honeypot+rate-limit, SQL Injection 방지(Prisma/Supabase 파라미터화) | 코드 리뷰 + 침투 테스트 |
| Reliability | 신청 폼 24/7 가용, DB 백업(Supabase 자동) | Vercel 상태 모니터링 |
| Cost | 운영비 월 0원 (Vercel + Supabase + Resend 무료 한도 내) | 청구서 확인 |
| Compliance | 개인정보(이름·연락처·이메일) 수집 동의 체크박스, 처리방침 페이지 | 법무 검토 권장 |

---

## 4. Architecture

### 4.1 Project Level: **Dynamic** (격상됨)

기존 Starter에서 격상. 이유:
- 백엔드 API + DB + 어드민 페이지 필요
- 자동 배정 로직(비즈니스 로직) 존재
- 인증(어드민) 필요

### 4.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | **Next.js 14 (App Router)** | SSR/SSG + API Routes 단일 코드베이스 |
| Language | **TypeScript strict** | 폼 스키마·도메인 타입 안전성 |
| Styling | **Tailwind + shadcn/ui** | 빠른 구현, 일관된 디자인 |
| **Database** | **Turso (SQLite + libSQL)** | Firebase 대신 더 단순한 선택. SQL 그대로, 무료 9GB+1B reads/월, 트랜잭션 안전 |
| **ORM** | **Drizzle ORM** | TypeScript 강타입 SQL 빌더, 마이그레이션 관리, Turso 1급 지원 |
| **Auth (어드민)** | **NextAuth Credentials + bcrypt ENV** | 운영자 1계정 (`adminyeowol`), 외부 의존 최소 |
| Form Validation | **zod + react-hook-form** | 클라이언트+서버 단일 스키마 |
| **Email** | **❌ 발송 없음** | 사이트 공지 + 신청 완료 화면 + 본인 조회 페이지로 대체 |
| **신청 상태 안내** | **본인 조회 페이지 `/apply/status`** | 신청번호 + 이메일로 본인 확인 후 상태·배정구획 표시 |
| **공지 시스템** | **어드민에서 작성, `/notice` 표시** | Announcement 테이블, 홈 핀고정 미리보기 |
| **Map** | **Naver 지도 iframe 임베드** | API 가입·카드 등록 불필요. 운영자가 알려준 네이버 지도 페이지를 그대로 임베드. 핀·길찾기는 네이버가 자동 처리 |
| Image | next/image + public/images + AI 보정본 | 사진 9장 |
| Content | MDX | 운영자 직접 수정 가능 |
| Analytics | **GA4** | Vercel/Netlify Analytics 대신 GA4 |
| **Deployment** | **Netlify** (Next.js Runtime Plugin) | 운영자 이미 가입. Vercel과 거의 동일한 기능 |
| **Site URL** | **https://yeowolfarm.netlify.app** (도메인 없음) | 1차 MVP는 Netlify 서브도메인. 추후 .kr 구매 시 연결 |

**Mapbox 등시선 보류 사유**: 운영자 답변 "지도 있으면 좋고, 오는길 안내 필요해" → 실용적 길찾기 우선.

**도메인 없는 트레이드오프**:
- ✗ 신뢰도 약간 약함 (.netlify.app 서브도메인)
- ✗ SEO 권위 축적 제한적
- ✗ Resend 등 인증 도메인 필요한 서비스 사용 불가
- ✓ 비용 0원
- ✓ 향후 도메인 구매 시 Netlify Dashboard에서 즉시 연결 가능 (코드 변경 거의 없음)

### 4.3 Folder Structure (Dynamic)

```
yeowol-farm-website/
├── app/
│   ├── (public)/                   # 공개 페이지
│   │   ├── page.tsx                # 홈
│   │   ├── plots/page.tsx          # 분양 안내
│   │   ├── access/page.tsx         # 오시는 길
│   │   ├── about/page.tsx          # 농원 소개
│   │   ├── gallery/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── apply/page.tsx          # 신청 폼
│   │   └── apply/success/page.tsx  # 접수 완료
│   ├── admin/                      # 어드민 (Auth 보호)
│   │   ├── login/page.tsx
│   │   ├── page.tsx                # 대시보드
│   │   ├── applications/page.tsx   # 신청 목록
│   │   ├── applications/[id]/page.tsx
│   │   └── plots/page.tsx          # 구획 현황
│   ├── api/
│   │   ├── applications/route.ts   # POST 신청
│   │   ├── admin/approve/route.ts  # POST 승인 → 자동 배정
│   │   └── admin/plots/route.ts
│   ├── sitemap.ts, robots.ts, layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── public/
│   │   ├── Hero.tsx, PlotInfoCard.tsx, ApplicationForm.tsx,
│   │   ├── AccessMap.tsx, SeasonalGallery.tsx, Footer.tsx
│   └── admin/
│       ├── ApplicationsTable.tsx, PlotGrid.tsx, ApproveButton.tsx
├── lib/
│   ├── db.ts                       # Prisma/Supabase client
│   ├── auth.ts                     # 어드민 인증
│   ├── allocation.ts               # 자동 배정 알고리즘
│   ├── email.ts                    # Resend 클라이언트 + 템플릿
│   ├── schemas/
│   │   ├── application.ts          # zod
│   │   └── plot.ts
│   └── seo.ts
├── emails/                         # React Email 템플릿
│   ├── ApplicationReceived.tsx
│   └── PlotAssigned.tsx
├── content/                        # MDX
│   ├── plots.mdx, faq.mdx, about.mdx
├── data/
│   └── plots.seed.json             # 초기 구획 시드
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
│       ├── hero/, gallery/, plots/ # AI 보정본
├── .env.example
├── tailwind.config.ts, tsconfig.json, package.json
```

### 4.4 Data Model (Turso/SQLite + Drizzle)

> 상세는 [Design v0.4 §3](../../02-design/features/yeowol-farm-website.design.md#3-data-model-tursosqlite--drizzle) 참조

**테이블 5개:**
- `plots` — plotNumber(1~300), seasonYear, areaPyeong(=5), status, applicationId, ...
- `applications` — **applicationNumber**(자동 증가 #1234), name, phone, email, desiredCount, totalPriceKrw, status, plotIds(JSON), plotNumbers(JSON), ...
- `announcements` — title, content, isPinned, isVisible, timestamps ⭐ 신규
- `auditLogs` — 모든 어드민 액션 기록
- `settings` (key,value) — RECRUITMENT_OPEN, CURRENT_SEASON_YEAR, PRICE_PER_UNIT_KRW

**핵심 인덱스:**
- `applications(applicationNumber, email)` — 본인 조회 최적화
- `applications(seasonYear, email)` UNIQUE — 중복 신청 차단
- `plots(status, plotNumber)` — 인접 묶음 탐색

**1차 MVP 단순화:**
- 모든 구획 5평 균일 (300개)
- `zone` 필드 1차 미사용 (추후 영역 도입 시)
- 가격: `desiredCount × 100,000원` 시즌 1회 결제

### 4.5 자동 배정 알고리즘 (Drizzle/Turso Transaction)

```
입력: applicationId (운영자 승인 시점)
처리 (db.transaction):
  1. applications SELECT + 상태 검증 (CONFIRMED 아닌지)
  2. plots SELECT WHERE seasonYear=X AND status='AVAILABLE' ORDER BY plotNumber
  3. findContiguousGroup(plots, desiredCount) — 연속 N개 묶음 탐색
  4-a. 묶음 있음:
       - 각 plot UPDATE WHERE status='AVAILABLE' (조건부 race 방지)
       - application UPDATE: status='CONFIRMED', plotIds JSON, plotNumbers JSON, approvedAt
       - auditLog 기록
       - ❌ 이메일 발송 없음 (사용자는 /apply/status에서 확인)
  4-b. 묶음 없음:
       - application UPDATE: status='PAID' (수동 대기)
       - 어드민에 시각적 표시

동시성: SQLite WAL 모드 + 조건부 UPDATE로 race 방지
```

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **R1: 12월 라이브 데드라인 빠듯함** (자동 배정 시스템 포함) | High | Medium | MVP 엄격 통제. 11월 말 베타 라이브, 12월 운영자 내부 테스트. 단계적 배포 |
| **R2: 자동 배정 동시성 버그** — 동일 구획에 동시 배정 | High | Low | DB 트랜잭션 + UNIQUE 제약. QA 단계에서 부하 테스트 |
| **R3: 입금 확인 누락** — 운영자가 입금됐는데 승인 안 함 | Medium | High | 입금 후 일정 시간 자동 리마인더 메일(운영자에게) |
| **R4: 인기 영역 편중** — 양지 zone 신청 몰림 | Medium | High | 신청 폼에 영역별 잔여 실시간 표시, "복수 선택 권장" 안내 |
| **R5: 사진 AI 보정 품질 한계** — 사람·계절·동선 사진 부재 | Medium | High | 보정은 색감/하늘/배경 정돈만. 사람 합성 금지. 메인 비주얼은 식물/풍경 중심으로 구성 |
| **R6: 개인정보 처리방침 미비** — 법적 리스크 | Medium | Medium | 처리방침 페이지 작성, 동의 체크박스 필수. 보관 기간 명시(시즌 종료+1년) |
| **R7: 스팸 신청** | Medium | High | honeypot + rate limit (IP당 시간당 N건) + reCAPTCHA v3 |
| **R8: Turso 무료 한도 초과** | Low | Low | 9GB + 1B reads/월. 300명 규모는 1% 미만 사용. 모니터링 |
| **R9: 시즌 종료 후 데이터 처리** | Low | Medium | plots 테이블 새 시즌으로 재시드, applications 1년 후 자동 파기 스크립트 |
| **R10: PG 미보유로 즉시 결제 불가** → 이탈률 ↑ | Medium | Medium | 신청 완료 화면에 계좌 정보 친절히 표시. 2027 시즌 후 토스페이먼츠 검토 |
| **R11: 도메인 없음** → 신뢰도 약화, SEO 권위 제한 | Medium | Medium | 1차는 .netlify.app 수용. 분양 본격화 시점에 yeowolfarm.kr 검토 |
| **R12: 신청자가 신청번호 분실** — 본인 조회 불가 | Medium | Medium | 신청 완료 화면에 "신청번호 복사" 버튼 + 신청 시 신청번호 강조 표시. 분실 시 운영자에게 전화 문의 |
| **R13: 본인 조회 페이지 무차별 대입** — 누군가 #1, #2, ... 시도 | Medium | Medium | rate-limit (분당 5회 + 시간당 누적 잠금) + 이메일 일치 필수 |
| **R14: 이메일 없는 안내 → 사용자 혼란** — 분양 진행 상황을 능동적으로 받지 못함 | Medium | Medium | 사이트 공지로 단체 안내 + 신청 완료 화면에 조회 URL 명시 + 운영자가 큰 변동 시 직접 연락 |

---

## 6. Convention Prerequisites

### 6.1 신규 프로젝트 (현재 미구성)

- [ ] Next.js 초기화 시 자동 생성: ESLint, TypeScript, Prettier
- [ ] CLAUDE.md 작성 (코딩 컨벤션)
- [ ] `docs/01-plan/conventions.md` (Phase 2 산출물)
- [ ] Prisma 스키마 (`prisma/schema.prisma`)

### 6.2 환경변수 (요약, 상세는 Design §10.3)

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | https://yeowolfarm.netlify.app | Client |
| `NEXT_PUBLIC_FARM_LAT` | 37.514173 | Client |
| `NEXT_PUBLIC_FARM_LNG` | 126.793019 | Client |
| `NEXT_PUBLIC_GA_ID` | GA4 ID (선택) | Client |
| `TURSO_DATABASE_URL` | libsql://yeowolgarden-xxx.turso.io | Server |
| `TURSO_AUTH_TOKEN` | Turso 토큰 | Server |
| `ADMIN_ID` | adminyeowol | Server |
| `ADMIN_PASSWORD_HASH` | bcrypt 해시 | Server |
| `NEXTAUTH_SECRET` | 세션 암호화 | Server |
| `DATABASE_URL` | Supabase Postgres | Server |
| `DIRECT_URL` | Supabase direct (Prisma migration) | Server |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase 어드민 | Server |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` | 어드민 단일 계정 (bcrypt) | Server |
| `NEXTAUTH_SECRET` | 세션 암호화 | Server |
| `RESEND_API_KEY` | 이메일 발송 | Server |
| `RESEND_FROM_EMAIL` | 발신자 (yeowolfarm.kr 도메인 인증 필요) | Server |
| `OPERATOR_NOTIFY_EMAIL` | 운영자 알림 수신 메일 | Server |
| `BANK_ACCOUNT_INFO` | 입금 안내 메일에 노출할 계좌 정보 | Server |

### 6.3 Pipeline Integration

| Phase | Status | Notes |
|-------|:------:|-------|
| Phase 1 (Schema) | 필수 | Firestore 컬렉션 정의 |
| Phase 2 (Convention) | 필수 | 코딩 컨벤션 |
| Phase 3 (Mockup) | 필수 | 7개 공개 페이지 + 어드민 페이지 와이어프레임 |
| Phase 4 (API) | 필수 | `/api/applications`, `/api/admin/approve` 등 |
| Phase 5 (Design System) | 권장 | shadcn/ui 기반 |
| Phase 6 (UI Integration) | 필수 | |
| Phase 7 (SEO/Security) | 필수 | 개인정보 처리방침 포함 |
| Phase 9 (Deployment) | 필수 | Netlify + Firebase 연결 |

---

## 7. Timeline (7개월, 데드라인 2026-12-31)

| 시기 | 주요 작업 | 산출물 |
|---|---|---|
| **2026-05~06 (2개월)** | 콘텐츠 정리(가격·FAQ·프로필), 사진 AI 보정, Netlify 사이트 생성(yeowolfarm.netlify.app), Firebase 프로젝트(asia-northeast3) + Service Account 키, Kakao Map 키 발급, 운영용 Gmail 신설 + App Password | 콘텐츠 시트, 사진 9장 보정본, 외부 키 일체 |
| **2026-07** | Phase 1(Schema) + Phase 2(Convention) + Phase 3(Mockup) | DB 스키마, 컨벤션 문서, 와이어프레임 |
| **2026-08** | 정적 페이지 구현 (홈/분양/오시는 길/소개/갤러리/FAQ) | 공개 페이지 6개 |
| **2026-09** | 신청 폼 + 백엔드 API + DB 연동 + 이메일 발송 | 신청 → 접수 → 메일 동작 |
| **2026-10** | 어드민 페이지 + 자동 배정 엔진 + 구획 현황 | 반자동 배정 동작 |
| **2026-11** | 통합 테스트 + Firebase Emulator 부하 테스트 + 보안 점검 + 콘텐츠 최종 + SEO | 베타 라이브 |
| **2026-12** | Netlify 연결 + 운영자 내부 검증 + 검색 콘솔 등록 | **공식 라이브** |
| **2027-01** | 신청 접수 개시 + 운영자 어드민 사용 | 운영 |
| **2027-03** | 개장 | — |

**Critical Path**: 9~10월 백엔드/어드민 구현이 가장 빡빡. 8월까지 정적 페이지 완료가 마일스톤.

---

## 8. Content Strategy

### 8.1 사진 자산 (현재 9장, AI 보정 예정)

위치: `C:\dev\yeowol garden\사진\`

| 파일 | 활용 (예상) | AI 보정 방향 |
|---|---|---|
| KakaoTalk_20260516_150830179.jpg ~ _08.jpg (9장) | 갤러리 메인, 분양 페이지, 히어로 후보 | 색감 통일(따뜻한 그린), 하늘 톤 조정, 배경 정돈, 현수막 영역 정리 |

**AI 보정 원칙** (사전 분석 반영):
- ✅ 색감/대비/하늘/배경 정돈
- ✅ 현수막/사이니지 노이즈 제거
- ❌ 사람 합성 금지 (신뢰도 하락)
- ❌ 계절 변경 금지 (부자연스러움)

### 8.2 콘텐츠 작성 항목 (운영자)

| 우선순위 | 항목 | 데드라인 |
|:---:|---|---|
| P0 | 분양 가격 / 구획 수 / 영역 분류 / 면적 | 6월 |
| P0 | 시즌 일정 (신청 1~2월, 개장 3월, 종료 11월 등 정확한 날짜) | 6월 |
| P0 | 입금 계좌 정보 / 이용 약관 / 개인정보 처리방침 | 7월 |
| P0 | FAQ 10개 | 6월 |
| P0 | 운영자 프로필 (학력/경력/철학) | 6월 |
| P0 | 시설 목록 (주차장, 수도, 화장실, 농기구, 비료 등) | 6월 |
| P0 | 농원 주소 + 좌표 + 대중교통 안내 | 6월 |

---

## 9. Success Criteria

### 9.1 Definition of Done

- [ ] 모든 공개 페이지 라이브 + 한국어 정상 표시
- [ ] 신청 폼 제출 → DB 저장 → 사용자/운영자 메일 수신 E2E 동작
- [ ] 어드민 로그인 → 승인 클릭 → 자동 배정 → 사용자 확정 메일 E2E 동작
- [ ] 어드민 구획 현황 통계 정확
- [ ] Lighthouse 4개 카테고리 ≥ 90 (모바일)
- [ ] yeowolfarm.netlify.app HTTPS 동작 (Netlify 자동 SSL)
- [ ] 구글 검색 콘솔 등록 + sitemap 제출
- [ ] 개인정보 처리방침 + 동의 체크박스 동작
- [ ] 운영자 매뉴얼 (어드민 사용법) 작성

### 9.2 Quality Criteria

- [ ] TypeScript strict, 빌드 타입 에러 0
- [ ] ESLint 경고 0
- [ ] 자동 배정 단위 테스트 (선호 영역 매칭, 동시성, 마감 처리)
- [ ] 어드민 페이지 인증 우회 불가 (E2E 테스트)
- [ ] 환경변수 .env.example 동기화, Git 미커밋

---

## 10. Decision Items (확정 완료)

| ID | 결정 사항 | 옵션 | **확정** |
|----|---|---|---|
| D-01 | 분양 신청 방식 | (a)온라인 폼 (b)전화/이메일 | **(a) 온라인 + 반자동 자동 배정** |
| D-01-1 | 자동화 수준 | 반자동 / 완전자동 / 수동 | **반자동** (운영자 입금 확인 후 승인 → 시스템 자동 배정) |
| D-01-2 | 구획 선택 방식 | 영역/면적/자동 | **면적만 표시** (5평 단위, 영역 분류는 추후) |
| D-01-3 | 사업자·결제 | 사업자있음/PG없음 | **사업자등록증 있음, PG 미보유** → 1차 계좌이체 + 수동 확인 |
| D-02 | 다국어 | 한국어/다국어 | **한국어만** |
| D-03 | 블로그/일지 | 포함/미포함 | **미포함** |
| D-04 | 도메인 | yeowolfarm.com / .kr / **없음** | **없음 (Netlify 서브도메인 yeowolfarm.netlify.app)** — 추후 .kr 검토 |
| D-05 | 지도 | Mapbox / Kakao / **Naver iframe** | **Naver 지도 iframe 임베드** (API 가입 불필요) |
| D-06 | 일정 | 4주/6~8주 | **7개월(2026-12 라이브)** — 시즌 데드라인 |
| D-07 | 사진 | 추가 촬영/AI 보정 | **기존 9장 AI 보정** (위치: `C:\dev\yeowol garden\사진\`) |
| D-08 | 면적 단위 | 시즌/월 | **시즌 1회 결제** (3~11월 9개월) |
| D-09 | 5평/10평 혼합 | 혼합 가능 / 1구획만 | **5평 단위 묶음** (5/10/15/20평 = 1/2/3/4구획) |
| D-10 | 신청당 구획 수 제한 | 무제한 / N개 | **무제한** (운영자 재량 거절) |
| D-11 | 거절/취소 메일 | 발송/안 함 | **자동 발송** (5종 템플릿) |
| D-12 | 호스팅 | Vercel / Netlify | **Netlify** (운영자 이미 가입) |
| D-13 | DB·Auth | Supabase / Firebase / **Turso** | **Turso (SQLite + libSQL)** + Drizzle ORM |
| D-14 | 이메일 | Resend / Gmail / **없음** | **❌ 없음** — 사이트 공지 + 본인 조회 페이지로 대체 |
| D-15 | GPS 좌표 | - | **37.514173, 126.793019** |
| D-16 | GitHub repo | - | **github.com/jaeho19/yeowolgarden** |
| D-17 | 어드민 계정 | - | **ID: adminyeowol** / PW는 bcrypt 해시로 ENV (운영 전 변경) |
| D-18 | 본인 조회 페이지 | 있음/없음 | **있음** `/apply/status` — 신청번호+이메일로 본인 조회 |
| D-19 | 사이트 공지 시스템 | 있음/없음 | **있음** Announcement 테이블 + 어드민 CRUD + `/notice` 페이지 |
| D-20 | 신청번호 형식 | 정수/랜덤 | **자동 증가 정수 #1, #2, ...** (시즌별 reset) |
| D-21 | 본인 확인 수단 | 이메일+번호 / token / 전화 | **신청번호 + 이메일 일치** + rate-limit |
| D-22 | 배정 결과 노출 | 메일 / 화면 | **본인 조회 페이지에서 배정구획 확인** |

---

## 11. Next Steps

### 즉시 (이번 주)
1. [ ] 사진 9장 미리보기 → AI 보정 방향 합의
2. [x] **GitHub repo 생성**: github.com/jaeho19/yeowolgarden ✅ 완료
3. [x] **Netlify 가입** ✅ 완료 — 사이트 이름 `yeowolfarm` 클레임
4. [ ] **Turso 가입 + DB 생성** (`turso db create yeowolgarden`) + 토큰 발급

→ Firebase·Gmail·Kakao API·도메인은 **모두 불필요** (Naver 지도는 iframe만 사용)

### 다음 단계 (6월)
6. [ ] 콘텐츠 시트 작성 (P0 항목 7개)
7. [ ] **Design 문서 작성**: `/pdca design yeowol-farm-website`
8. [ ] 사진 AI 보정 진행 + 결과 검토

### 7월 이후
9. [ ] Phase 1 (Schema) — DB 스키마 확정
10. [ ] Phase 2 (Convention) — 코딩 규칙
11. [ ] Phase 3 (Mockup) — 와이어프레임
12. [ ] 구현 단계 진입

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-16 | 초안 — 참고 사이트 분석, 기술 스택, 리스크 | 운영자 + Claude |
| 0.2 | 2026-05-16 | D-01~D-07 결정 반영. **Starter → Dynamic 격상**. 자동 배정 시스템·어드민·DB·이메일 추가. 데드라인 2026-12-31 확정. Mapbox→Kakao 변경 | 운영자 + Claude |
| 0.3 | 2026-05-16 | **인프라 전환** (D-12~D-15). Vercel→Netlify, Supabase→Firebase(Firestore+Auth, asia-northeast3), Resend→Nodemailer+Gmail App Password, 도메인 없이 yeowolfarm.netlify.app. GPS 좌표 확정 | 운영자 + Claude |
| 0.4 | 2026-05-16 | **추가 단순화** (D-16~D-22). Firebase→Turso(SQLite+Drizzle), **이메일 발송 제거** → 사이트 공지·본인 조회 페이지로 대체. Announcement 테이블·applicationNumber 필드 신설. 프로젝트명 yeowolgarden 확정. 어드민 계정 결정 | 운영자 + Claude |
| 0.4.1 | 2026-05-16 | **Kakao Map → Naver 지도 iframe 임베드**로 변경 (D-05 갱신). 운영자 사전 작업 STEP 2개로 단축(Netlify + Turso) | 운영자 + Claude |
