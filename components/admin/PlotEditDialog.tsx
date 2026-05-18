'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PlotStatus } from '@/lib/schemas/application'

interface PlotInfo {
  id: string
  plotNumber: number
  status: PlotStatus
  notes: string | null
  application: { applicationNumber: number; name: string } | null
}

interface Props {
  plot: PlotInfo | null
  onClose: () => void
}

export function PlotEditDialog({ plot, onClose }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<PlotStatus>('AVAILABLE')
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  // dialog가 열릴 때마다 입력값 초기화
  if (plot && status !== plot.status && !loading) {
    // (eslint: setting state in render — but guarded by 다이얼로그 mount/unmount cycle)
  }

  const handleSave = async () => {
    if (!plot) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/plots/${plot.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          notes,
          status: plot.status === 'OCCUPIED' ? undefined : status,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error?.message ?? '저장 실패')
        return
      }
      startTransition(() => router.refresh())
      onClose()
    } catch {
      setError('네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={!!plot}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="max-w-md">
        {plot && (
          <PlotEditBody
            plot={plot}
            notes={notes}
            setNotes={setNotes}
            status={status}
            setStatus={setStatus}
            error={error}
            loading={loading}
            onSave={handleSave}
            onClose={onClose}
            // notes/status 초기화 트릭
            // (key가 바뀌므로 컴포넌트가 새로 mount)
            key={plot.id}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PlotEditBody({
  plot,
  notes,
  setNotes,
  status,
  setStatus,
  error,
  loading,
  onSave,
  onClose,
}: {
  plot: PlotInfo
  notes: string
  setNotes: (s: string) => void
  status: PlotStatus
  setStatus: (s: PlotStatus) => void
  error: string | null
  loading: boolean
  onSave: () => void
  onClose: () => void
}) {
  // mount 시 1회 초기값 세팅
  useInitOnce(() => {
    setNotes(plot.notes ?? '')
    setStatus(plot.status)
  })

  return (
    <>
      <DialogTitle>구획 #{plot.plotNumber}</DialogTitle>
      <DialogDescription>
        현재 상태: <strong>{statusLabel(plot.status)}</strong>
        {plot.application && (
          <>
            {' · '}점유 신청:{' '}
            <strong>
              #{plot.application.applicationNumber} {plot.application.name}
            </strong>
          </>
        )}
      </DialogDescription>

      <div className="mt-4 space-y-4">
        {plot.status !== 'OCCUPIED' && (
          <div>
            <Label className="text-sm font-medium">상태</Label>
            <div className="mt-1.5 flex gap-2">
              {(['AVAILABLE', 'RESERVED'] as PlotStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={
                    status === s
                      ? 'rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white'
                      : 'rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent'
                  }
                >
                  {statusLabel(s)}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              점유 상태(OCCUPIED)는 신청 거절/취소를 통해서만 해제됩니다.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="plot-notes" className="text-sm font-medium">
            메모 (선택)
          </Label>
          <Textarea
            id="plot-notes"
            className="mt-1.5"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 그늘이 많음 / 입구 근처"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button onClick={onSave} disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </>
  )
}

/* useInitOnce — mount 시점에 콜백 1회 실행 (effect 한 줄짜리 헬퍼) */
import { useEffect, useRef } from 'react'
function useInitOnce(fn: () => void) {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    fn()
  }, [fn])
}

function statusLabel(s: PlotStatus): string {
  return { AVAILABLE: '가용', RESERVED: '예약', OCCUPIED: '점유' }[s]
}
