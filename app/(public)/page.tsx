import { Hero } from '@/components/public/Hero'
import { ValueCards } from '@/components/public/ValueCards'
import { AvailabilityBadge } from '@/components/public/AvailabilityBadge'
import { AnnouncementBanner } from '@/components/public/AnnouncementBanner'
import { SeasonalGallery } from '@/components/public/SeasonalGallery'

// 잔여 통계·공지가 DB의 실시간 상태에 의존하므로 dynamic.
// (build-time prerender 차단 — Netlify 환경에서 DB 접근 불가 시에도 빌드 통과)
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <AnnouncementBanner />
      <Hero />
      <ValueCards />
      <AvailabilityBadge />
      <SeasonalGallery />
    </>
  )
}
