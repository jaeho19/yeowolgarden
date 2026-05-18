---
template: design
version: 1.2
feature: mobile-responsive-optimization
date: 2026-05-18
author: 운영자 + Claude
project: 여월농장 (Yeowol Farm)
status: Draft
---

# 모바일 반응형 강화 + 성능 최적화 Design Document

> **Summary**: 기존 사이트(Next.js 16 / Tailwind 4 / Turso) 위에서 **next/image 마이그레이션 + AI 일러스트 WebP 변환 + next/font 도입 + 폼 enterKeyHint 보강 + 어드민 모바일 카드형 패턴**을 더해 시즌 트래픽(모바일 80%+) 대응 가능 상태로 끌어올린다.
>
> **Project**: yeowolgarden
> **Version**: 0.5.0
> **Author**: 운영자 + Claude
> **Date**: 2026-05-18
> **Status**: Draft — Do 단계 진입 전
> **Planning Doc**: [mobile-responsive-optimization.plan.md](../../01-plan/features/mobile-responsive-optimization.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 (Schema) | — | N/A (DB 스키마 변경 없음) |
| Phase 2 (Convention) | `CLAUDE.md` + `.impeccable.md` | ✅ |
| Phase 3 (Mockup) | — | N/A (기존 UI 개선) |
| Phase 4 (API Spec) | — | N/A (API 변경 없음) |

---

## 1. Overview

### 1.1 Design Goals

| 목표 | 측정 가능한 결과 |
|---|---|
| 모바일 LCP 단축 | < 2.5s (모바일 4G simulation) |
| 이미지 first paint 용량 | < 1.5MB (현재 ~12MB 자산) |
| `<img>` warning 제거 | lint `@next/next/no-img-element` 0건 |
| 폼 모바일 키보드 흐름 | 모든 input에 `inputMode` + `autoComplete` + `enterKeyHint` |
| 어드민 모바일 작업 가능 | `/admin/applications`·`/admin/plots` 핵심 작업 모바일에서 완료 가능 |
| `.impeccable.md` 원칙 무위반 | gradient text/side-stripe border/text-center hero/영문 라벨 0건 유지 |

### 1.2 Design Principles

- **데이터 변경 0, 시각 일관성 유지** — 디자인 컨텍스트("일상 속 농장") 변경 없음. 토큰/컴포넌트 구조 보존하면서 모바일 시각 회귀만 잡는다.
- **next 권장 패턴 우선** — `next/image`·`next/font`·`unoptimized: false` 표준 path. 커스텀 loader 도입 X.
- **이미지는 원본을 먼저 줄이고 next/image에 맡긴다** — 2.3MB PNG를 next/image conversion만 의존하면 빌드·서버 비용·LCP 모두 손해.
- **폼은 키보드 흐름을 끊지 않는다** — `enterKeyHint`로 마지막 필드까지 한 손가락으로 진행 가능.
- **어드민 모바일은 작업 효율 우선** — 운영자(50-70대)가 태블릿/모바일로 신청 검토·승인을 안정적으로 수행.

---

## 2. Architecture

### 2.1 변경 컴포넌트 맵

```
[변경 대상]
┌──────────────────────────────────────────────┐
│ 공개 사이트                                   │
│   Hero.tsx               ── <img> → next/image│
│   SeasonalGallery.tsx    ── <img> ×2 → next/image│
│   ApplyForm.tsx          ── enterKeyHint 보강 │
│   LookupForm.tsx         ── enterKeyHint 보강 │
│   MobileBottomCTA.tsx    ── safe-area 보강    │
│                                              │
│ 어드민                                        │
│   ApplicationsTable.tsx  ── md:table + 모바일 카드│
│   PlotsGrid.tsx          ── 터치 타겟·줌 검토 │
│                                              │
│ 글로벌                                        │
│   app/layout.tsx         ── next/font 도입    │
│   public/gallery/        ── PNG → WebP 변환   │
└──────────────────────────────────────────────┘

[변경 없음] (이미 next/image)
  app/(public)/about/page.tsx
  components/public/GalleryGrid.tsx
```

### 2.2 Data Flow (변경 없음)

기존 신청 흐름·DB 스키마·API 변경 없음.

### 2.3 새 의존성

| 패키지 | 용도 | 사이즈 영향 |
|---|---|---|
| `sharp` (devDependency, 빌드/스크립트용) | PNG → WebP 사전 변환 | 0 (devDep) |
| `next/font/google` (built-in) | Gowun Batang self-host | 0 (Next.js 내장) |
| `pretendard` (npm) **또는 self-host woff2** | Pretendard Variable self-host | 1 woff2 ~150-200KB (subset 후) |

---

## 3. Data Model

변경 없음. 기존 Drizzle schema 그대로(applications / plots / announcements / admin_settings / system_state).

---

## 4. API Specification

변경 없음. 기존 라우트 그대로.

---

## 5. UI/UX Design

### 5.1 모바일 viewport 검증 매트릭스

| viewport | 디바이스 예시 | 검증 항목 |
|---|---|---|
| **320px** | iPhone SE 1st (구형) | Hero h1 줄바꿈, dl 띠 3열 가로 스크롤 없음 |
| **375px** | iPhone SE 2nd/3rd, iPhone 12 mini | 표준 |
| **414px** | iPhone Plus 시리즈 | 큰 모바일 |
| **768px** | iPad portrait | 태블릿 |
| **1024px** | iPad landscape, 작은 데스크탑 | sm:/md: 경계 |

### 5.2 Hero — `next/image` 마이그레이션

**Before**:
```tsx
<img src={HERO_IMAGE} alt="…" className="editorial-photo absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high" />
```

**After**:
```tsx
<Image
  src={HERO_IMAGE}
  alt="여월농장의 텃밭 풍경"
  fill
  sizes="100vw"
  priority
  className="editorial-photo object-cover"
  quality={85}
/>
```

핵심: `fill` + `sizes="100vw"` + `priority`. fetchPriority는 next/image가 자동 처리.

### 5.3 SeasonalGallery — `next/image` 마이그레이션

**Big (4:5)**:
```tsx
<Image src={BIG_IMAGE.src} alt={BIG_IMAGE.alt} fill sizes="(max-width: 640px) 100vw, 60vw"
       className="editorial-photo object-cover" />
```

**Small (1:1)**:
```tsx
<Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 50vw, 25vw"
       className="editorial-photo object-cover" loading="lazy" />
```

→ `sizes` 정확히 명시해서 srcset 최적 candidate 생성.

### 5.4 이미지 자산 변환 워크플로

**AI 일러스트 PNG (3장 × 2.3MB) → WebP**:

| 단계 | 도구 | 출력 |
|---|---|---|
| 1. 원본 보관 | `사진/ChatGPT *.png` (이미 git) | 변경 없음 |
| 2. 픽셀 다운샘플 | sharp (스크립트) | max 1600px 긴 변 (현재 1024×1280 추정 → 그대로) |
| 3. WebP 변환 | sharp `.webp({ quality: 82 })` | `public/gallery/illust-*.webp` |
| 4. 컴포넌트 src 변경 | About/SeasonalGallery에서 `.png` → `.webp` | 약 350-450KB/장 예상 |

**실사 JPG (9장 × 400-900KB)**:
- 이미 적정 용량. next/image의 자동 변환에만 맡김.
- 만약 next/image가 webp/avif 자동 변환 안 한다면 미리 webp 사전 변환(별도 작업).

**스크립트**: `scripts/convert-images.ts` 신규 — sharp로 png → webp 일괄.

### 5.5 폰트 로딩 전략

**현재**: globals.css에서 system font fallback 명시. Pretendard·Gowun Batang은 CDN 로딩으로 추정 — preload 없음.

**결정**: Pretendard는 `pretendard` npm + woff2 self-host, Gowun Batang은 `next/font/google`.

**구현 (`app/layout.tsx`)**:
```tsx
import { Gowun_Batang } from 'next/font/google'
import localFont from 'next/font/local'

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
})

const gowun = Gowun_Batang({
  weight: ['400', '700'],
  subsets: ['latin'], // 한글 subset은 별도 결정(아래)
  variable: '--font-gowun',
  display: 'swap',
})
```

**한글 subset 처리**:
- Gowun Batang은 한글 글리프 1.5MB+. subset 필수.
- 옵션 A: 사이트에 실제 사용된 한글 글자만 추출(`subset-font`/`fonttools pyftsubset`)
- 옵션 B: Gowun Batang을 표제(H1/H2)만 사용 → 자주 쓰이는 한글 600자 subset (실사용 약 200자)
- **결정 (Do 단계 확정)**: subset 글자 셋을 `scripts/build-font-subset.ts`로 만들고 woff2 압축 → `public/fonts/gowun-batang-ko.woff2` (예상 80-150KB)

globals.css 토큰 수정:
```css
--font-sans: var(--font-pretendard), Pretendard, ...;
--font-heading: var(--font-gowun), 'Gowun Batang', ...;
```

### 5.6 폼 — `enterKeyHint` 보강

**ApplyForm.tsx**:
| 필드 | inputMode | autoComplete | enterKeyHint |
|---|---|---|---|
| 신청자 이름 | (default) | `name` | `next` |
| 연락처 | `tel` | `tel` | `next` |
| 이메일 | `email` | `email` | `next` |
| 희망 구좌 수 | `numeric` | — | `next` |
| 선호 메모 (textarea) | — | — | (textarea — Enter는 줄바꿈) |
| 약관 동의 (checkbox) | — | — | — |
| 신청 버튼 (submit) | — | — | `send` (마지막 input에 적용) |

**LookupForm.tsx**:
| 필드 | enterKeyHint |
|---|---|
| 신청번호 | `next` |
| 이메일 | `search` |

**AdminLoginForm.tsx**:
| 필드 | enterKeyHint |
|---|---|
| 아이디 | `next` |
| 비밀번호 | `go` |

### 5.7 MobileBottomCTA — safe-area 보강

iOS 노치/홈 인디케이터 대응:
```tsx
<div className="pb-[env(safe-area-inset-bottom)] ...">
```

표시 시점: 현재 로직 점검 후 — Hero를 지나면 표시, Footer 영역 진입 시 숨김.

### 5.8 어드민 모바일 카드형 패턴

**ApplicationsTable.tsx 현재**: 데스크탑 `<table>` 구조 추정.

**After (반응형)**:
```tsx
<>
  {/* md 이상: 테이블 */}
  <table className="hidden md:table ...">
    {/* 기존 thead/tbody */}
  </table>

  {/* md 미만: 카드 stack */}
  <ul className="md:hidden space-y-3">
    {applications.map(app => (
      <li key={app.id} className="rounded-md border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{app.applicantName}</span>
          <span className="text-meta text-muted-foreground">{app.applicationNumber}</span>
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">연락처</dt>
          <dd>{app.phone}</dd>
          <dt className="text-muted-foreground">희망 구좌</dt>
          <dd>{app.desiredCount}</dd>
          <dt className="text-muted-foreground">상태</dt>
          <dd>{statusLabel[app.status]}</dd>
        </dl>
        <div className="mt-3 flex gap-2">
          <LinkButton href={`/admin/applications/${app.id}`} size="sm">상세</LinkButton>
        </div>
      </li>
    ))}
  </ul>
</>
```

**PlotsGrid.tsx**: 300구획 그리드. 모바일 핀치 줌·터치 패닝 가능하도록 컨테이너 `overflow-auto` + `touch-action: pan-x pan-y`.

### 5.9 Component List 요약

| Component | Location | 변경 내용 |
|---|---|---|
| `Hero` | `components/public/` | `<img>` → next/image |
| `SeasonalGallery` | `components/public/` | `<img>` ×2 → next/image |
| `ApplyForm` | `components/public/` | `enterKeyHint` 보강 |
| `LookupForm` | `components/public/` | `enterKeyHint` 보강 |
| `AdminLoginForm` | `components/admin/` | `enterKeyHint` 보강 |
| `MobileBottomCTA` | `components/public/` | safe-area-inset |
| `ApplicationsTable` | `components/admin/` | md:table + 모바일 카드 |
| `PlotsGrid` | `components/admin/` | touch-action + 터치 줌 |
| `app/layout.tsx` | `app/` | next/font 도입 |
| `app/globals.css` | `app/` | `--font-*` 변수 next/font 변수로 |

---

## 6. Error Handling

변경 없음.

---

## 7. Security Considerations

- [x] 이미지·폰트 변경은 보안 민감 영역 외 — 별도 검증 불요
- [x] next/font self-host로 외부 CDN 의존성 감소 → 약간의 보안 개선
- [ ] 어드민 모바일 카드 패턴 추가 시 권한 체크 회귀 없는지 점검(`ApplicationsTable` import 경로 그대로)

---

## 8. Test Plan

### 8.1 Baseline 측정 (Do 시작 전)

| 측정 | 도구 | 출력 위치 |
|---|---|---|
| Lighthouse Mobile (`/`, `/apply`) | Chrome DevTools Lighthouse | `docs/03-analysis/baseline-{date}.md` |
| 이미지 first paint 용량 | DevTools Network 패널 | 동일 |
| Pretendard·Gowun Batang 로딩 시점 | DevTools Performance | 동일 |

### 8.2 회귀 테스트 (Do 완료 후)

| 항목 | 방법 | 통과 기준 |
|---|---|---|
| Hero LCP | Lighthouse | < 2.5s |
| CLS | Lighthouse | < 0.1 |
| INP | Lighthouse | < 200ms |
| 모바일 viewport 5종 | 시각 검토 + DevTools Device Mode | 가로 스크롤 0, 텍스트 잘림 0 |
| 폼 키보드 흐름 | iOS Safari + Android Chrome | 마지막 필드까지 `Next` 연결 |
| 어드민 모바일 작업 | 실기기 1대 이상 | 신청 검토 → 승인 → 배정 완료 가능 |
| lint warning | `pnpm lint` | `<img>` warning 0건 |
| 빌드 | `pnpm build` | exit 0 |

### 8.3 E2E (선택)

- Playwright 도입 결정은 별도. 이번 사이클은 시각·수동 검증 우선.

---

## 9. Clean Architecture

이번 사이클은 신규 layer/feature 추가 없음. 기존 구조 유지:

- `Presentation`: `components/public/`, `components/admin/`, `app/`
- `Infrastructure`: `public/fonts/`, `public/gallery/` (정적 자산)

새 의존성 `sharp`는 빌드 스크립트(`scripts/`)에서만 사용 → Presentation/Infrastructure 어디에도 import 안 됨.

---

## 10. Coding Convention Reference

### 10.1 본 사이클 보강 컨벤션

| 항목 | 규칙 |
|---|---|
| 이미지 사용 | `<img>` 사용 금지. 모두 `next/image`. `sizes`·`alt` 필수. |
| 이미지 자산 | WebP 우선 (`.webp`). 원본은 `사진/` 보관. |
| 폼 input | `inputMode`·`autoComplete`·`enterKeyHint` 3종 세트 강제. |
| 터치 타겟 | 최소 44×44px. Tailwind `min-h-11` (44px) 또는 충분한 padding. |
| 모바일 카드형 | 어드민 테이블은 `hidden md:table` + `md:hidden` 모바일 카드 ul 패턴. |
| safe-area | 화면 하단 고정 요소는 `pb-[env(safe-area-inset-bottom)]`. |

### 10.2 ESLint 보강 (선택)

`@next/next/no-img-element` 이미 활성 — `<img>` warning 0건 달성 후 `error`로 승격 검토.

---

## 11. Implementation Guide

### 11.1 파일 변경 요약

```
app/
  layout.tsx                       ── next/font 도입 + body className
  globals.css                       ── --font-* 변수 next/font 변수 참조

components/public/
  Hero.tsx                          ── <img> → <Image fill>
  SeasonalGallery.tsx               ── <img> ×2 → <Image fill>
  ApplyForm.tsx                     ── enterKeyHint
  LookupForm.tsx                    ── enterKeyHint
  MobileBottomCTA.tsx               ── safe-area-inset

components/admin/
  AdminLoginForm.tsx                ── enterKeyHint
  ApplicationsTable.tsx             ── md:table + 모바일 카드
  PlotsGrid.tsx                     ── touch-action

public/
  fonts/PretendardVariable.woff2    ── (new) self-host
  fonts/gowun-batang-ko.woff2       ── (new) subset
  gallery/illust-*.webp             ── (new) AI 일러스트 WebP 변환본

scripts/
  convert-images.ts                 ── (new) sharp PNG → WebP 일괄
  build-font-subset.ts              ── (new, optional) Gowun Batang 한글 subset

docs/03-analysis/
  baseline-2026-05-18.md            ── (new) before 측정
```

### 11.2 구현 순서

| # | 작업 | 추정 영향 |
|---|---|---|
| 1 | Baseline 측정 — `/` `/apply` Lighthouse Mobile 점수 기록 | 0 (측정만) |
| 2 | 이미지 변환 — `scripts/convert-images.ts` 작성·실행 → `illust-*.webp` 생성 | 자산 ~7MB → ~1.2MB |
| 3 | Hero·SeasonalGallery — `<img>` → next/image + `<Image>` src를 webp로 | LCP·CLS·로딩 큰 개선 |
| 4 | next/font 도입 — `app/layout.tsx` 수정, globals.css `--font-*` 토큰 매핑 | FOIT 제거 |
| 5 | Gowun Batang subset 생성 — `scripts/build-font-subset.ts` 또는 외부 도구 → `public/fonts/gowun-batang-ko.woff2` | 폰트 1.5MB → 100-150KB |
| 6 | 폼 `enterKeyHint` 보강 — 3개 폼 컴포넌트 | UX 개선 |
| 7 | MobileBottomCTA safe-area | iOS UX 개선 |
| 8 | 어드민 ApplicationsTable 모바일 카드 + PlotsGrid touch-action | 어드민 모바일화 |
| 9 | 시각 회귀 검증 — 5종 viewport 디바이스 모드 + 실기기 1대 | 회귀 잡기 |
| 10 | Lighthouse Mobile 재측정 — before/after 비교 | 목표 달성 확인 |

### 11.3 의존성 설치

```bash
pnpm add -D sharp
pnpm add pretendard         # 또는 woff2 수동 다운로드
# next/font는 next 내장
```

### 11.4 작업 시간 추정

| 단계 | 예상 |
|---|---|
| 1 baseline 측정 | 15분 |
| 2 이미지 변환 스크립트 + 실행 | 30분 |
| 3 Hero·SeasonalGallery 마이그레이션 | 30분 |
| 4 next/font 도입 | 30분 |
| 5 Gowun Batang subset | 30분 |
| 6 폼 enterKeyHint | 15분 |
| 7 safe-area | 10분 |
| 8 어드민 카드 + PlotsGrid | 60분 |
| 9 시각 회귀 검증 | 30분 |
| 10 Lighthouse 재측정 + 보고 | 15분 |
| **합계** | **약 4-5시간** |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-18 | 초안 — Hero/SeasonalGallery next/image + WebP + next/font + 어드민 카드 + enterKeyHint | 운영자 + Claude |
