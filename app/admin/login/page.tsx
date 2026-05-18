import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export const metadata: Metadata = {
  title: '관리자 로그인',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight text-foreground"
          >
            여월농장
          </Link>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            어드민 콘솔
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-6 sm:p-8">
          <h1 className="text-xl font-bold">관리자 로그인</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            운영자 전용 페이지입니다.
          </p>
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="h-48 animate-pulse rounded-lg bg-muted/40" />
              }
            >
              <AdminLoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  )
}
