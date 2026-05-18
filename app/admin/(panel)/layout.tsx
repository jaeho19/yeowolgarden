import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminMobileNav } from '@/components/admin/AdminMobileNav'

/**
 * /admin/* 공통 레이아웃.
 * /admin/login은 자체 레이아웃을 사용하므로 여기서 분기 처리는 하지 않고,
 * 로그인 페이지가 자체 <main>로 전체 화면을 차지하도록 한다.
 *
 * 인증 검사는 middleware.ts가 처리. 여기서는 UI만.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <AdminMobileNav />
      <AdminSidebar />
      <div className="flex-1 overflow-x-auto">{children}</div>
    </div>
  )
}
