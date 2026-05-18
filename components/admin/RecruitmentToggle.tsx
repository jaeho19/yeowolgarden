'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  initialOpen: boolean
}

export function RecruitmentToggle({ initialOpen }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(initialOpen)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  const toggle = async () => {
    const next = !open
    if (!confirm(`정말로 모집을 ${next ? '시작' : '마감'}하시겠어요?`)) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings/recruitment', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ open: next }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error?.message ?? '변경 실패')
        return
      }
      setOpen(next)
      startTransition(() => router.refresh())
    } catch {
      setError('네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            현재 모집 상태
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {open ? '🟢 모집 중' : '🔴 모집 마감'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            마감 상태에서는 신청 페이지(/apply)가 안내 화면으로 전환됩니다.
          </p>
        </div>
        <Button
          variant={open ? 'destructive' : 'default'}
          size="lg"
          onClick={toggle}
          disabled={loading}
        >
          {loading ? '변경 중...' : open ? '모집 마감하기' : '모집 시작하기'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
