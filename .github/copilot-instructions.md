# Copilot Instructions — 여월농장

> 이 문서는 GitHub Copilot / AI 코드 어시스턴트가 이 저장소에서 작업할 때 따라야 하는 컨텍스트를 정의합니다.
> 디자인 작업은 반드시 프로젝트 루트의 `.impeccable.md`와 함께 읽어야 합니다.
> 동기화 원본: `.impeccable.md` (2026-05-18, 컨셉 재정의)

---

## Project Snapshot

- **목적**: 부천 여월농장 2027 시즌 주말 텃밭 분양 모집·관리 사이트
- **데드라인**: 2026-12-31 라이브 → 2027-01-01 신청 접수 개시
- **스택**: Next.js 16 App Router · TypeScript strict · Tailwind 4 · shadcn/ui · Turso/Drizzle · NextAuth v5
- **상세 가이드**: 프로젝트 루트의 `CLAUDE.md` 참조

---

## Design Context

> 모든 UI 작업은 이 섹션을 참조한다. `.impeccable.md` 전문이 원본이며, 충돌 시 `.impeccable.md`가 우선한다.

### Design Direction: 일상 속 농장 (Everyday Farm)

여월농장은 1년에 단 한 번 가는 무거운 곳이 아니다. **지하철·버스로 가볍게, 평일 저녁이나 반나절에도 들러서 흙을 만지고 가는 곳**이다. 사용자는 SaaS 랜딩에 지친 도시인이지만 동시에 촌스러운 농장 홈페이지에도 마음을 못 준다. 우리가 만드는 화면은 그 사이의 골짜기에 있다: **도심 카페의 산뜻함 × 동네 농장의 정직함**.

핵심 네 가지:
- **가볍게(Light)** — 진지한 약속이 아니라 가벼운 일상. 활자·여백·모션이 무겁지 않다
- **가까이(Near)** — 멀고 특별한 곳이 아니라 가까운 일상. "차가 없어도 올 수 있다"가 척도
- **신선하게(Fresh)** — 산뜻한 종이톤·잎의 채도를 한 단 올린 그린. 단, SaaS 네온 그린은 절대 아님
- **정직하게(Honest)** — 영업 문장·과장·이모지·그라데이션 텍스트로 채우지 않는다

### Users

**Primary — 20-50대 수도권 도시 거주자 (확장)**
- 가족·솔로·커플·직장인을 동등한 무게로 다룬다. 5평이 4인 가족에게도, 부부 둘에게도 의미 있게 보여야 함
- 거주지 부천·서울 서남부·인천. **차량 없음 시나리오를 1순위**로 디자인
- 잡: "여월농장 5분 파악(가깝고 차 없어도 갈 만한가) → 5평 적정성 판단 → 신청 신뢰 확보 → 신청 후 내 구획 확인"

**Secondary — 호정 농업회사법인 운영자**
- 50~70대, 모바일·태블릿 중심. 어드민에서 신청 검토 → 입금 확인 → 배정 → 공지 작성
- 잡: 빠르고 실수 없이. 화려한 인터랙션·툴팁 폭격은 방해

### Brand Personality

**4-word**: 가볍게 · 가까이 · 신선하게 · 정직하게

- **친근한 존댓말**. "신청해보세요" OK, "지금 바로 신청하세요!" "놓치지 마세요!" 영업체 금지
- 숫자는 작은 글자로 숨기지 않고 본문 활자로 당당하게 노출
- "AI 보정", "최첨단", "프리미엄" 같은 미사여구·테크 용어 금지
- 한국어 사이트 안에 영문 약어(CTA, FAQ, SEASON) 노출 금지 — 메뉴·라벨 모두 한국어 우선
- 단호함은 줄이고 가벼움은 늘린다. "한 해 약속"은 본문은 OK, 헤드라인 X

### Aesthetic Direction

- **Theme**: 라이트 모드 단일. 다크 모드 미지원
- **Palette**: 채도 한 단 부스트한 잎(`leaf-500` chroma 0.105, hue 132) + 흙(`soil-*` 황톳빛) + 종이(`paper` 따뜻한 오프화이트) + 잉크(`ink` 따뜻한 검정)
  - 기존 `brand-*` 유틸리티는 클래스명 호환을 위해 유지하되 값은 새 leaf 톤으로 교체
  - **채도 상한선**: leaf-500의 `oklch(0.52 0.105 132)`가 천장. 이보다 채도 높이면 SaaS 그린
  - 순백·순흑 금지. 중성색은 brand hue 방향으로 미세 틴트(chroma 0.005~0.012)
- **Typography**: 표제 `Gowun Batang`(본명조) + 본문 `Pretendard Variable` + 숫자 `tabular-nums tracking-tight`
  - 사용감을 가볍게: Display/H1에 `tracking-[-0.01em]` + `leading-[1.2]`로 활자 사이 공기 보강
- **Type scale**: fluid clamp 기반 5단계, 단계 간 1.25 이상 비율
- **Spacing**: 섹션 사이 여백 `py-20~24`(기존 `py-16`보다 한 단 넓힘). "가볍게"의 핵심 표현
- **Hero pattern**: 풀폭 16:9 사진 + 사진 위 좌측 정렬 표제 + 아래 dl 띠(시즌·날짜·위치). `text-center` Hero·article header 패턴 금지
- **Photography**: `사진/` 폴더 9장이 핵심 자산. 미사용 = 사이트가 영원히 AI 슬롭처럼 보임

### Key Messages (사이트 카피의 원천 3문장)

Hero·About·시설 헤드라인은 이 셋의 변형에서만 나온다:
1. "**멀리 가지 않아도 자연을 느낄 수 있다**" — 도심 근접성·일상성
2. "**차가 없어도 올 수 있다**" — 교통 접근성
3. "**반나절만 내도 충분히 힐링할 수 있다**" — 가벼운 시간 단위

### Design Principles (모든 결정의 척도)

1. **활자가 먼저, 장식이 나중** — 폰트·타입 스케일·여백으로 위계가 안 서면 카드·보더·그라데이션을 더하지 말고 활자를 다시 본다
2. **사진은 그라데이션·일러스트·이모지를 대체한다** — placeholder 그라데이션은 임시 사진보다 나쁘다. 사진이 없으면 자리를 비워라
3. **신선함은 채도가 아니라 여백에서 온다** — 색을 더하기 전에 여백을 더한다. leaf-500의 0.105 chroma가 천장
4. **카드는 마지막 수단** — 정보를 묶으려 할 때 카드부터 떠올렸다면 잘못된 출발이다
5. **가볍게 = 즉시 보임** — "가볍게"는 느릿한 페이드 인이 아니라 빠른 도착이다. 스크롤 인뷰 자동 모션 금지
6. **한국어 사용자에게 정직하게** — 영문 SaaS 패턴(uppercase 라벨, tracking-wider, "Get started" 버튼)을 한국어에 옮기지 않는다
7. **AI 슬롭 + 촌스러움 이중 테스트** — 화면을 만든 후 두 번 묻는다: ① "AI가 만들었다고 하면 믿을까?" ② "운영자(50-70대)가 촌스럽다고 할까?" 둘 다 No여야 통과

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
- 스크롤 인뷰 페이드 인/슬라이드 인 자동 트리거
- 영문 약어 라벨(SEASON / LOCATION / CONTACT)

---

## Coding Conventions (요약 — 상세는 CLAUDE.md)

- **Naming**: 컴포넌트 PascalCase, 함수 camelCase, 상수 UPPER_SNAKE, 폴더 kebab-case
- **Import 순서**: react/next → 외부 → `@/...` → `./` → type
- **Server vs Client**: Server Component 우선, `'use client'`는 폼·지도·인터랙티브만
- **DB 접근**: `lib/db.ts`는 서버 전용. 클라이언트에서 import 금지
- **zod 단일 소스**: `lib/schemas/`의 스키마를 클라+서버에서 공유

---

## When in doubt

도심 카페 창가에서 종이 메뉴판을 펼친 장면을 떠올린다. 거기에 그라데이션·이모지·glassmorphism이 없고, 동시에 "본점 직영" 같은 촌스러운 띠지도 없다. 화면도 그래야 한다.
