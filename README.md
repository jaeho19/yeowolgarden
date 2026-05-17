# 여월농장 (yeowolgarden)

부천 여월농장의 2027 시즌 주말 텃밭 분양 모집·관리 시스템.

- 사이트: https://yeowolfarm.netlify.app
- 농원 주소: 경기도 부천시 오정구 여월동 112
- 운영: 농업회사법인 (유)호정

## 주요 기능

- 7개 공개 페이지 (홈/분양/오시는길/소개/갤러리/FAQ/공지)
- 온라인 분양 신청 폼 + 신청번호 자동 발급
- **본인 조회 페이지** — 신청번호 + 이메일로 신청·배정 상태 확인
- 어드민 페이지 — 신청 관리, 입금 승인 시 인접 구획 자동 배정
- 사이트 공지 시스템

## 기술 스택

Next.js 16 / TypeScript / Tailwind 4 / shadcn/ui / Turso(SQLite) + Drizzle ORM / NextAuth v5 / Netlify

## 빠른 시작

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 편집 후 실제 값 입력

# DB 마이그레이션 + 시드
pnpm drizzle-kit migrate
pnpm tsx scripts/seed-plots.ts

# 개발 서버
pnpm dev
# → http://localhost:3000
```

자세한 가이드는 [CLAUDE.md](./CLAUDE.md) 참조.

## 문서

- [Plan](./docs/01-plan/features/yeowol-farm-website.plan.md)
- [Design](./docs/02-design/features/yeowol-farm-website.design.md)
- [Implementation Guide](./docs/03-do/features/yeowol-farm-website.do.md)
