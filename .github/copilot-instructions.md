# Copilot Instructions — 여월농장

> 이 문서는 GitHub Copilot / AI 코드 어시스턴트가 이 저장소에서 작업할 때 따라야 하는 컨텍스트를 정의합니다.
> 디자인 작업은 반드시 프로젝트 루트의 `.impeccable.md`와 함께 읽어야 합니다.
> 동기화 원본: `.impeccable.md` (2026-05-18)

---

## Project Snapshot

- **목적**: 부천 여월농장 2027 시즌 주말 텃밭 분양 모집·관리 사이트
- **데드라인**: 2026-12-31 라이브 → 2027-01-01 신청 접수 개시
- **스택**: Next.js 16 App Router · TypeScript strict · Tailwind 4 · shadcn/ui · Turso/Drizzle · NextAuth v5
- **상세 가이드**: 프로젝트 루트의 `CLAUDE.md` 참조

---

## Design Context

> 모든 UI 작업은 이 섹션을 참조한다. `.impeccable.md` 전문이 원본이며, 충돌 시 `.impeccable.md`가 우선한다.

### Design Direction: 흙냄새 미니멀 (Earthy Minimalist)

여월농장은 SaaS 스타트업이 아니다. 30년 가까이 운영된 부천 외곽의 텃밭이다.
사용자가 1년에 단 한 번 무겁지 않지만 신중하게 결정을 내리는 곳 — 그 결정의 무대는 "트렌디한 그린 그라데이션 랜딩"이 아니라 **종이 위에 적힌 단단한 안내문**에 가까워야 한다.

핵심 세 가지:
- **톤 다운된 컬러** — 채도를 낮춘 흙·잎·황톳빛
- **단단한 명조 표제** — 본명조(세리프) 한국어 표제 + Pretendard 본문
- **실물 사진 중심** — 그라데이션·일러스트·이모지로 채우지 않는다

### Users

**Primary — 주말 텃밭 신청자**
- 35~60대 가족(부천·서울 서남부·인천), 1월 초 시즌 1회 방문
- 잡: "여월농장이 어떤 곳인지 5분 안에 파악 → 5평 적정성 판단 → 신청 신뢰 확보 → 신청 후 내 구획 위치 확인"

**Secondary — 호정 농업회사법인 운영자**
- 50~70대, 모바일·태블릿 중심. 어드민에서 신청 검토 → 입금 확인 → 배정 → 공지 작성
- 잡: 빠르고 실수 없이. 화려한 인터랙션·툴팁 폭격은 방해

### Brand Personality

**3-word**: 단단함 · 흙냄새 · 한 해 약속

- 존댓말, 단호한 문장. 영업 문체("지금 신청하세요!" "놓치지 마세요!") 금지
- 숫자는 작은 글자로 숨기지 않고 본문 활자로 당당하게 노출
- "AI 보정", "최첨단" 같은 미사여구·테크 용어 금지
- 한국어 사이트 안에 영문 약어(CTA, FAQ, JTBD) 노출 최소화

### Aesthetic Direction

- **Theme**: 라이트 모드만. 다크 모드 미지원(이 프로젝트엔 추가하지 않는다)
- **Palette**: 채도 낮춘 잎(`leaf-*`, chroma 0.05~0.09) + 흙(`soil-*`, 황톳빛) + 종이(`paper`, 따뜻한 오프화이트) + 잉크(`ink`, 따뜻한 검정)
  - 기존 `brand-*` Tailwind 유틸리티는 클래스명 호환을 위해 유지하되 **값은 톤다운된 leaf 톤**으로 교체됨
  - 순백·순흑 금지. 중성색은 brand hue 방향으로 미세 틴트(chroma 0.005~0.012)
- **Typography**: 표제 `Gowun Batang`(본명조) + 본문 `Pretendard Variable` + 숫자 `tabular-nums tracking-tight`
- **Type scale**: fluid clamp 기반 5단계, 단계 간 1.25 이상 비율
- **Photography**: `사진/` 폴더 9장이 핵심 자산. 미사용 = 사이트가 영원히 AI 슬롭처럼 보임

### Design Principles (모든 결정의 척도)

1. **활자가 먼저, 장식이 나중** — 폰트·타입 스케일·여백으로 위계가 안 서면 카드·보더·그라데이션을 더하지 말고 활자를 다시 본다
2. **사진은 그라데이션·일러스트·이모지를 대체한다** — placeholder 그라데이션은 임시 사진보다 나쁘다. 사진이 없으면 자리를 비워라
3. **채도는 의심하고 시작한다** — 컬러를 더하기 전에 "이게 톤다운된 흙·잎·종이 안에서 의미를 가지나?"를 묻는다
4. **카드는 마지막 수단** — 정보를 묶으려 할 때 카드부터 떠올렸다면 잘못된 출발이다
5. **한국어 사용자에게 정직하게** — 영문 SaaS 패턴(uppercase 라벨, tracking-wider, "Get started" 식 버튼)을 한국어에 그대로 옮기지 않는다
6. **AI 슬롭 테스트** — 모든 화면을 만든 후 "AI가 만들었다고 하면 믿을까?"를 묻는다. 믿긴다면 처음으로 돌아간다

---

## Implementation Banned List (CSS·코드 레벨)

다음 패턴이 PR에 등장하면 반려:

- `bg-gradient-to-*` Hero 또는 배경(`brand-700 to brand-300` 류)
- `backdrop-blur` (Header 포함 전체)
- `border-left: 3px+ solid <color>` 또는 우측 컬러 스트라이프 (impeccable BAN 1)
- `background-clip: text` 그라데이션 텍스트 (impeccable BAN 2)
- `text-center` Hero (예외: `/apply/success` 같은 결과 페이지만 허용)
- 한국어 텍스트에 `uppercase` 클래스
- `font-mono`를 "기술적 느낌"으로 사용 (계좌번호는 `tabular-nums`)
- 이모지를 아이콘·라벨·로고로 사용
- 페이지 안에 동일 구조 카드 4개 이상 grid 반복

---

## Coding Conventions (요약 — 상세는 CLAUDE.md)

- **Naming**: 컴포넌트 PascalCase, 함수 camelCase, 상수 UPPER_SNAKE, 폴더 kebab-case
- **Import 순서**: react/next → 외부 → `@/...` → `./` → type
- **Server vs Client**: Server Component 우선, `'use client'`는 폼·지도·인터랙티브만
- **DB 접근**: `lib/db.ts`는 서버 전용. 클라이언트에서 import 금지
- **zod 단일 소스**: `lib/schemas/`의 스키마를 클라+서버에서 공유

---

## When in doubt

종이 위에 손으로 적힌 안내문을 떠올린다. 거기에 그라데이션·이모지·glassmorphism이 없다면 화면에도 없어야 한다.
