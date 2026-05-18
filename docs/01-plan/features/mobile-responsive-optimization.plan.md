---
template: plan
version: 1.2
feature: mobile-responsive-optimization
date: 2026-05-18
author: 운영자 + Claude
project: 여월농장 (Yeowol Farm)
status: Draft
---

# 모바일 반응형 강화 + 성능 최적화 Planning Document

> **Summary**: 2027년 1월 신청 개시를 앞두고 — 모바일 사용성을 시즌 트래픽 수준까지 끌어올리고, 이미지·폰트·번들을 LCP/CLS/INP 기준에 맞게 최적화한다.
>
> **Project**: yeowolgarden (GitHub: jaeho19/yeowolgarden)
> **Version**: 0.5.x (디자인 컨텍스트 '일상 속 농장' 적용 후)
> **Date**: 2026-05-18
> **Status**: Draft — Design 단계 진입 전

---

## 1. Overview

### 1.1 Purpose

여월농장 사이트는 1년에 단 한 번(1월 초) 집중 트래픽을 받는다. **신청자의 80% 이상이 모바일에서 접속**할 것으로 예상되며(부모/직장인이 출퇴근 중 또는 가족 회의 중 폼 작성), 모바일 사용성이 곧 신청 전환율이다.

또 사이트는 사진 12MB(AI 일러스트 3장 ×2.3MB + 실사 9장 ×0.5MB) 자산을 그대로 노출 중이라 모바일 데이터로 첫 화면이 뜨기까지 LCP가 위험 수준이다. 첫 시즌이라 운영자도 신청자도 사이트 첫인상 한 번에 신뢰가 결정된다.

이 PDCA 사이클의 목표는 **사이트 전체를 "모바일 우선·시즌 트래픽 대응 가능" 상태로 끌어올리는 것**이다.

### 1.2 Background

**비즈니스 컨텍스트:**
- 라이브 데드라인: 2026-12-31 / 신청 개시: 2027-01-01
- 예상 트래픽: 신청 개시 직후 1-2주에 집중. 동시 접속 수십~수백 명.
- 사용자 디바이스: 모바일 비중 압도적. 부천·서울 서남부·인천 거주자, 출퇴근 시간·저녁 시간대 접속.
- 현재 상태: 데스크탑 우선 디자인. 모바일 디테일(폼 키보드 타입, hero h1 줄바꿈, 그리드 깨짐 등) 검증 미흡.

**기술 현황 (사전 진단):**

| 항목 | 현재 | 위험 |
|---|---|---|
| 이미지 합계 | ~12MB (AI 일러스트 3×2.3MB + 실사 9×0.5MB) | 모바일 데이터로 첫 화면 진입 무거움 |
| 이미지 컴포넌트 | `<img>` 직접 사용 (Hero, SeasonalGallery, GalleryGrid) | next/image 미적용 → webp/avif·반응형 srcset·lazy 미작동 |
| 폰트 | Pretendard Variable + Gowun Batang (Google Fonts 추정) | preload/font-display·self-host 검토 필요 |
| 타입 스케일 | 최근 한 단 부스트 — display max 92px, body 18px | 모바일에서 clamp로 줄어들지만 작은 viewport(320-375px) 시각 검증 미흡 |
| viewport meta | `app/layout.tsx` `export const viewport` 존재 | 설정 적정성 검토 필요 |
| `force-dynamic` 페이지 | home(`/`) DB read 있음 | TTFB 영향 검토 |
| 폼 입력 타입 | react-hook-form + zod | 모바일 키보드 타입(`inputMode`, `autocomplete`) 적정성 미점검 |
| `MobileBottomCTA` | 컴포넌트 존재 | 모바일 전용 CTA 동작·표시 시점 점검 필요 |

### 1.3 Related Documents

- 이전 사이클: `docs/01-plan/features/yeowol-farm-website.plan.md` (전체 기능 구축)
- 디자인 컨텍스트: `.impeccable.md` (일상 속 농장 — 모바일 1순위 가이드 명시)
- 프로젝트 가이드: `CLAUDE.md`

---

## 2. Scope

### 2.1 In Scope

#### 반응형 강화
- [ ] 공개 페이지(`/`, `/about`, `/plots`, `/access`, `/gallery`, `/faq`, `/notice`, `/apply`, `/apply/success`, `/apply/status`, `/privacy`, `/terms`) 모바일 viewport(320 / 375 / 414px) 시각 검증
- [ ] Hero 모바일 — h1 줄바꿈·sub 카피·dl 띠 3열 그리드 점검
- [ ] SeasonalGallery 모바일 — 2x2 그리드 + 비대칭 매거진 단일 컬럼 점검
- [ ] 폼(/apply, /apply/status) — 입력 타입·키보드·터치 타겟·라벨 위치
- [ ] 네비/푸터/MobileBottomCTA — 안전 영역(safe-area-inset) 대응

#### 성능 최적화
- [ ] 이미지 — `<img>` → `next/image` 마이그레이션(Hero·SeasonalGallery·GalleryGrid 3곳)
- [ ] 이미지 압축 — AI 일러스트 PNG 3장(2.3MB) → WebP 또는 적정 해상도 JPEG
- [ ] 폰트 로딩 — Pretendard/Gowun Batang preload·subset·`font-display: swap`
- [ ] LCP element 식별 후 우선 로딩 (Hero 사진 `priority` + `fetchPriority="high"`)
- [ ] 번들 크기 — production build 분석(`@next/bundle-analyzer` 임시 도입 검토)
- [ ] `force-dynamic` 페이지 — DB 캐시 전략 점검(공지·모집 토글)

#### 어드민 모바일 사용성 (운영자 50-70대)
- [ ] `/admin/applications` 목록 — 모바일 테이블 카드형 또는 가로 스크롤 대응
- [ ] `/admin/plots` 그리드 — 줌·터치 적정성
- [ ] 어드민 폼 — 입력 타입·키보드·터치 타겟

### 2.2 Out of Scope

- 데스크탑 신규 디자인 (디자인 컨텍스트 적용으로 충분)
- 새 페이지/기능 추가
- 다국어(영문) 지원
- PWA(Progressive Web App) 전환
- 어드민 신기능(통계·필터 추가 등)
- 결제 시스템(은행 이체 유지)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 | 상태 |
|----|---|---|---|
| FR-01 | 모든 공개 페이지가 360px viewport에서 가로 스크롤 없이 표시 | High | Pending |
| FR-02 | 신청 폼의 모든 input이 모바일 키보드 타입에 맞게 설정 (`inputMode`, `autocomplete`, `enterKeyHint`) | High | Pending |
| FR-03 | 모든 `<img>`가 `next/image`로 마이그레이션 (lint warning 0) | High | Pending |
| FR-04 | AI 일러스트 3장이 WebP로 변환되어 용량 ≤ 500KB/장 | High | Pending |
| FR-05 | 폰트 self-host 또는 preload로 FOIT/FOUT 최소화 | Medium | Pending |
| FR-06 | 어드민 페이지가 모바일·태블릿에서 핵심 작업(신청 검토·승인·배정) 가능 | Medium | Pending |
| FR-07 | MobileBottomCTA가 스크롤 컨텍스트에 맞게 표시·숨김 | Low | Pending |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s (모바일 4G simulation) | Lighthouse Mobile / WebPageTest |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse Mobile |
| INP (Interaction to Next Paint) | < 200ms | Lighthouse Mobile / Chrome DevTools |
| Lighthouse Mobile Performance | ≥ 90 | Lighthouse Mobile, 홈(`/`) + 신청(`/apply`) |
| Lighthouse Mobile Accessibility | ≥ 95 | Lighthouse Mobile |
| Lighthouse Mobile SEO | ≥ 95 | Lighthouse Mobile |
| 이미지 총량 (first paint) | < 1.5MB | DevTools Network |
| Touch target | ≥ 44×44px (WCAG 2.5.5) | 시각 검토 |
| 접근성 | WCAG 2.1 AA | axe-core 자동 + 수동 검토 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR-01~FR-07 항목 구현 완료
- [ ] 모든 NFR 기준 통과 (Lighthouse Mobile 90+, LCP < 2.5s)
- [ ] 실제 디바이스(iOS Safari + Android Chrome) 1대 이상에서 핸드온 검증
- [ ] `pnpm build` + `pnpm lint` 통과 (lint warning 0 — 현재 8건의 `<img>` warning 모두 제거)
- [ ] PR + 코드 리뷰 후 main 머지

### 4.2 Quality Criteria

- [ ] 모바일 320/375/414/768/1024px에서 시각 회귀 없음
- [ ] `.impeccable.md` 원칙 위반 0건 (gradient 텍스트, side-stripe border, 텍스트 센터 hero, 영문 라벨 등)
- [ ] gap analysis (`/pdca analyze`) 90% 이상

---

## 5. Risks and Mitigation

| 리스크 | 영향 | 가능성 | 완화 |
|---|---|---|---|
| AI 일러스트 PNG WebP 변환 시 화질 손상 | Medium | Medium | 수동 품질 점검 + WebP/AVIF 듀얼 + 원본 보관 |
| `next/image` 마이그레이션 시 레이아웃 시프트 발생 | Medium | High | 명시적 `width/height` 지정 + `sizes` 속성 정확히 |
| 폰트 self-host 시 라이선스 이슈 | High | Low | Pretendard·Gowun Batang 둘 다 SIL OFL — 안전. 사전 확인 |
| 어드민 모바일 작업 도중 데이터 손실 위험 | High | Low | 어드민은 confirm dialog + optimistic UI 절제 |
| 작은 viewport(320px)에서 Hero h1 92px → clamp 후에도 큼 | Medium | Medium | 모바일 전용 break 줄바꿈 + 최소 사이즈 재조정 |
| 시즌 트래픽(1월 초 1-2주) 부하 | High | Medium | Netlify CDN 캐싱 + DB(Turso) read replica 검토(별도 사이클) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | 특성 | 추천 대상 | 선택 |
|-------|---|---|:---:|
| **Starter** | 단순 구조 | 정적 사이트 | ☐ |
| **Dynamic** | feature 단위 모듈 | 백엔드 있는 웹앱·SaaS MVP | ☑ |
| **Enterprise** | 엄격한 계층 분리 | 대규모 시스템 | ☐ |

→ 기존 결정 유지(Dynamic). 이번 사이클은 기존 컴포넌트 개선이지 구조 변경 아님.

### 6.2 핵심 아키텍처 결정 (기존 유지)

| 결정 | 옵션 | 선택 | 비고 |
|---|---|---|---|
| Framework | Next.js / React / Vue | **Next.js 16 App Router** | 기존 |
| Image | next/image / `<img>` / custom loader | **next/image** | 이번 사이클 마이그레이션 핵심 |
| Styling | Tailwind / CSS Modules | **Tailwind 4** | 기존 |
| Form | react-hook-form / formik | **react-hook-form + zod** | 기존, mobile input 속성 보강 |
| Font | Google CDN / self-host | **검토 후 결정** | 이번 사이클 design 단계에서 |

---

## 7. Convention Prerequisites

### 7.1 기존 컨벤션

- [x] `CLAUDE.md` 코딩 컨벤션 섹션 존재
- [x] `.impeccable.md` 디자인 컨텍스트 — 모바일 1순위 명시
- [x] ESLint (`eslint.config.mjs`) — `@next/next/no-img-element` 활성
- [x] TypeScript strict
- [ ] 반응형 가이드라인 — **이번 사이클 design 단계에서 추가**

### 7.2 정의/확인할 컨벤션

| 카테고리 | 현재 | 정의할 사항 | 우선순위 |
|---|---|---|:---:|
| 브레이크포인트 | Tailwind sm/md/lg/xl 기본 | 모바일 우선 검증 사이즈(320/375/414/768/1024) 명시 | High |
| 이미지 사용 패턴 | `<img>` 혼재 | `next/image` 강제 + `sizes`/`priority` 규칙 | High |
| 폼 입력 모바일 속성 | 미명세 | `inputMode`/`autocomplete`/`enterKeyHint` 표준 | High |
| Touch target | 미명세 | 최소 44×44px | Medium |
| 폰트 로딩 | Google CDN 추정 | self-host or `next/font` 사용 결정 | Medium |

### 7.3 환경변수 (변경 없음)

이번 사이클은 인프라/시크릿 변경 없음. 기존 `.env.example` 그대로.

---

## 8. Next Steps

1. [ ] **Design 단계** (`/pdca design mobile-responsive-optimization`)
   - 측정 baseline (현재 Lighthouse Mobile 점수) 기록
   - 컴포넌트별 마이그레이션 plan (Hero·SeasonalGallery·GalleryGrid·ApplyForm·MobileBottomCTA)
   - 이미지 자산 변환 워크플로(PNG → WebP, JPEG 재압축)
   - 폰트 로딩 전략 결정 (self-host vs `next/font`)
   - 어드민 모바일 카드형 변환 컴포넌트 설계
2. [ ] **Do 단계** — 마이그레이션 구현 + 이미지 변환 + 폼 속성 보강
3. [ ] **Check 단계** — `/pdca analyze`로 design ↔ 구현 갭 측정 + Lighthouse 재측정
4. [ ] **Act 단계** — gap < 90%면 반복 개선
5. [ ] **Report** — 최종 Lighthouse 점수·LCP·CLS·INP before/after 비교

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-18 | 초안 — 모바일 반응형 + 성능 최적화 PDCA 사이클 시작 | 운영자 + Claude |
