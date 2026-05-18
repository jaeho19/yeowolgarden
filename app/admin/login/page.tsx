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
            className="inline-flex items-center gap-2 text-lg font-semibold"
          >
            <span className="text-2xl" role="img" aria-hidden>
              🌱
            </span>
            여월농장
          </Link>
          <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
            Admin Console
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
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
