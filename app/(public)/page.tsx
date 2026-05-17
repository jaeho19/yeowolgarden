import { Hero } from '@/components/public/Hero'
import { ValueCards } from '@/components/public/ValueCards'
import { AvailabilityBadge } from '@/components/public/AvailabilityBadge'
import { AnnouncementBanner } from '@/components/public/AnnouncementBanner'
import { SeasonalGallery } from '@/components/public/SeasonalGallery'

// 60초마다 잔여 통계·공지 갱신 (ISR)
export const revalidate = 60

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
