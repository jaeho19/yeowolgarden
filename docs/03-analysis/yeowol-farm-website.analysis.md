---
template: analysis
feature: yeowol-farm-website
date: 2026-05-18
scope: M1~M4 (M5+ excluded)
agent: bkit:gap-detector
matchRate: 95
phase: check
iteration: 2
nextAction: report
previousMatchRate: 82
---

# Gap Analysis — yeowol-farm-website (Iteration 2)

> PDCA Check phase 재실행. Iteration 1차에서 P0 5건 중 4건 실수정 + 1건(F-1) false positive 정정.

- **분석 일시**: 2026-05-18
- **분석 에이전트**: bkit:gap-detector (read-only)
- **비교 범위**: M1 인프라 / M2 정적 페이지 / M3 신청·조회 / M4 어드민 (M5~M7 제외)
- **이번 iteration 변경**: `/privacy`·`/terms` 신규 생성, Header·MobileBottomCTA의 `backdrop-blur` 제거, `proxy.ts` 존재 확인 (Netlify Next Runtime 표준)

---

## Overall Match Rate: **95%**

이전 82% → 95% (+13pp). 잔존 갭은 모두 P1·P2이며 M5/M6 마일스톤 범위.

### 카테고리별 Match Rate

| # | 카테고리 | 이전 | 이번 | 상태 | 핵심 잔존 갭 |
|---|---|:---:|:---:|:---:|---|
| 1 | 기능 요구사항 (M1~M3) | 95% | 99% | OK | `/privacy`·`/terms` 신설 ✅. `app/error.tsx`·`robots.ts`·`sitemap.ts`만 잔존 (M6) |
| 2 | 기능 요구사항 (M4 어드민) | 90% | 100% | OK | `proxy.ts`로 Edge 보호 완비. 이전 F-1/C-1은 false positive |
| 3 | DB 스키마 정합 | 100% | 100% | OK | design §3.2 일치 |
| 4 | API 라우트 정합 | 98% | 98% | OK | 14개 엔드포인트 모두 구현 |
| 5 | 자동 배정 알고리즘 | 100% | 100% | OK | `lib/allocation.ts` |
| 6 | 본인 조회·rate-limit | 100% | 100% | OK | constant-time floor 100ms |
| 7 | 디자인 토큰 (impeccable) | 90% | 92% | OK | privacy/terms도 sub-page Hero 패턴 일관 적용 |
| 8 | Impeccable 금지 패턴 | 78% | 91% | OK | Header·MobileBottomCTA backdrop-blur 제거 ✅. GalleryGrid 라이트박스·shadcn dialog/sheet 잔존 |

---

## Iteration 1차에서 해결된 갭 (직전 분석 P0 5건)

| # | 항목 | 처리 결과 |
|---|---|---|
| F-1 | `middleware.ts` 어드민 라우트 보호 | **False Positive 정정** — Netlify Next Runtime은 `proxy.ts`를 사용. `proxy.ts:12-40`이 NextAuth v5 `auth()` + matcher로 처음부터 완비 |
| F-2 | `/privacy` 페이지 | ✅ 신규 생성. design §7.5 5개 항목 + `robots: noindex` + Sub-page Hero + dl/border-t |
| F-3 | `/terms` 페이지 | ✅ 신규 생성. 제1~5조 + 부칙. **제3조 환불 정책** 명시 |
| C-2 | Header `backdrop-blur` | ✅ 제거 → `bg-background` 솔리드 |
| C-3 | MobileBottomCTA `backdrop-blur` | ✅ 제거 → `border-t border-border bg-background` |

---

## 🔴 Missing Features — 잔존

| # | 항목 | 위치 | 우선순위 | 마일스톤 |
|---|---|---|:---:|:---:|
| F-4 | `app/error.tsx` Global Error UI | design §11.1 | P1 | M5 |
| F-5 | `app/robots.ts` | design §11.1 | P1 | M6 SEO |
| F-6 | `app/sitemap.ts` | design §11.1 | P1 | M6 SEO |
| F-7 | `tests/` 디렉토리 + 핵심 유닛 테스트 | design §8 | P1 | M5 진입 전 |
| F-8 | 신청 자료 보존 cron (시즌+1년) | design §7.5 | P2 | 운영 매뉴얼 |

---

## 🟡 Added Features (정상 확장)

| # | 항목 | 평가 |
|---|---|---|
| A-1 | `lib/admin-guard.ts` API 가드 | proxy.ts와 함께 다중 방어선 |
| A-2 | `lib/availability/settings/errors/pricing.ts` | design §9 Application 레이어 자연 편입 |
| A-3 | `plots.zone` nullable | design §3.1 예고 범위 |
| A-4 | 어드민 사이드바·모바일 네비 | UX 정합 |
| A-5 | `RecruitmentNotice.tsx`, `SeasonalGallery.tsx` | 정상 확장 |
| A-6 | `proxy.ts` (Netlify Next Runtime 미들웨어 entry) | **이전 분석 누락 자산** |

---

## 🔵 Changed / Inconsistent — 잔존

| # | 항목 | Implementation | 영향 | 우선순위 |
|---|---|---|:---:|:---:|
| C-4 | 공개 페이지 `font-mono` (success URL) | `apply/success/page.tsx:117` `<code className="font-mono">` | Low — `<code>` 시맨틱 정당화 여지 | P1 |
| C-5 | GalleryGrid 라이트박스 nav 버튼 `backdrop-blur` | `GalleryGrid.tsx:118,126` `bg-white/10 ... backdrop-blur` — **이전 분석 누락 잔존** | Medium | P1 |
| C-6 | `ⓘ` 글리프 | `ApplyForm.tsx:183`, `LookupForm.tsx:141`, `access/page.tsx:146` (Unicode enclosed alphanumeric, 회색지대) | Low | P2 |
| C-7 | shadcn `dialog.tsx`·`sheet.tsx` `backdrop-blur` | 라이브러리 기본 — 모달·시트 오버레이용 | Low | P2 |
| C-8 | 어드민 `font-mono` | `applications/page.tsx` 등 — 운영자 전용 영역 | Low | P2 |

---

## ✅ 잘 구현된 부분

1. **proxy.ts (Netlify Next Runtime 미들웨어)** — NextAuth v5 `auth()` 콜백 단일 진입점. matcher·예외 분기·401 JSON / 페이지 redirect 분기 완비. **이전 분석에서 놓친 핵심 자산.**
2. **/privacy·/terms 페이지** — design §7.5 5개 항목 + 약관 5개 조항 + 부칙. Sub-page Hero(`bg-secondary border-b`) + `dl > div.border-t` 종이톤 미니멀룰 100% 준수. 이모지·그라데이션·`text-center` Hero·`backdrop-blur` BAN 패턴 0건.
3. **약관 제3조 환불 정책** — 시즌 개장 전 전액 / 이후 협의 분기 명시. 신청자 분쟁 예방 + 운영자 보호.
4. **backdrop-blur 제거 후속 처리** — Header·MobileBottomCTA 모두 `border-t border-border bg-background` 깔끔 대체. impeccable "단단함" personality 강화.
5. **DB 스키마·자동 배정·API·rate-limit·디자인 토큰** — iteration 1차 동안 회귀 0건.

---

## Sitemap·API 정합

### Sitemap — **12/12 ✅**
- `/privacy`, `/terms` 신설 완료 → 이전 분석의 누락 2건 해소

### API 라우트 — **14/14 ✅** (변동 없음)

---

## Recommended Next Action

### Match Rate 95% → **`/pdca report yeowol-farm-website` 권장**

근거:
1. 90% 기준선 5pp 초과
2. 잔존 P0 결손 0건 (`middleware.ts`는 false positive 정정)
3. 잔존 갭 5건 모두 P1·P2 — M5/M6 마일스톤 자연스러운 후행:
   - F-4(`error.tsx`)·F-7(`tests/`) → M5 테스트·최적화
   - F-5(`robots.ts`)·F-6(`sitemap.ts`) → M6 Netlify·SEO
   - C-4·C-5·C-6·C-7·C-8 → 회색지대 또는 외부 라이브러리, 별도 사이클
4. 추가 iteration의 한계 효용 < report로 M4 마감 + M5 신규 사이클 진입 효용

### 대안 — `/pdca iterate` 3차 진행 시 다룰 항목 (선택)

- C-5 GalleryGrid `backdrop-blur` 2곳 제거 (라이트박스 nav는 `bg-black/40` 단색 fallback 가능)
- C-4 success page URL `font-mono` → `tabular-nums`
- `app/not-found.tsx`·`error.tsx` 스텁 추가

이 3개 처리 시 Match Rate 97~98% 예상. 단 M5/M6 자산이 잔존하는 한 100% 도달은 마일스톤 정의상 불가.

---

## 변경 파일 경로

핵심:
- `proxy.ts` — Netlify Next Runtime 미들웨어 entry (이전 누락)
- `app/(public)/privacy/page.tsx` — 신규
- `app/(public)/terms/page.tsx` — 신규
- `components/public/Header.tsx` — backdrop-blur 제거
- `components/public/MobileBottomCTA.tsx` — backdrop-blur 제거

잔존 갭:
- `components/public/GalleryGrid.tsx:118,126` — backdrop-blur
- `app/(public)/apply/success/page.tsx:117` — font-mono URL
- `components/public/ApplyForm.tsx:183`, `LookupForm.tsx:141`, `access/page.tsx:146` — ⓘ
- `components/ui/dialog.tsx:34`, `sheet.tsx:31` — shadcn 기본 backdrop-blur
