import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { MobileBottomCTA } from '@/components/public/MobileBottomCTA'

/**
 * 공개 영역 (홈/분양/소개/FAQ 등) 공통 레이아웃.
 * Route Group (public) — URL에 영향 없음.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomCTA />
    </>
  )
}
