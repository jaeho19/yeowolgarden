import { Hero } from '@/components/public/Hero'
import { RecruitmentNotice } from '@/components/public/RecruitmentNotice'
import { AnnouncementBanner } from '@/components/public/AnnouncementBanner'
import { SeasonalGallery } from '@/components/public/SeasonalGallery'

// AnnouncementBanner가 DB read이므로 dynamic.
// RecruitmentNotice는 정적이지만 일관성 위해 같이 dynamic 유지.
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <AnnouncementBanner />
      <Hero />
      <RecruitmentNotice />
      <SeasonalGallery />
    </>
  )
}
