'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ApplicationStatus } from '@/lib/schemas/application'

interface Props {
  applicationId: string
  status: ApplicationStatus
  desiredCount: number
}

/**
 * 어드민 신청 액션 버튼 묶음.
 * - 승인(자동배정), 수동배정, 거절, 취소
 */
export function ApplicationActions({
  applicationId,
  status,
  desiredCount,
}: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = () => startTransition(() => router.refresh())

  const post = async (path: string, body?: object) => {
    setError(null)
    setInfo(null)
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error?.message ?? '처리 중 오류가 발생했습니다.')
        return false
      }
      // autoAllocate가 needsManualAssignment 응답을 줄 수 있음
      if (json?.needsManualAssignment) {
        setInfo(
          '인접한 묶음을 찾지 못해 수동 배정 대기 상태로 변경되었습니다.'
        )
      }
      refresh()
      return true
    } catch {
      setError('네트워크 오류가 발생했습니다.')
      return false
    }
  }

  const canApprove =
    status === 'PENDING' || status === 'PAID' || status === 'CONFIRMED'
      ? status !== 'CONFIRMED'
      : false
  const canReject = status !== 'CANCELLED' && status !== 'REJECTED'
  const canCancel = status !== 'CANCELLED'

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {info && (
        <Alert>
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {/* 자동 배정 */}
        {canApprove && (
          <Button
            onClick={() =>
              post(`/api/admin/applications/${applicationId}/approve`)
            }
            disabled={isPending}
          >
            자동 배정 (승인)
          </Button>
        )}

        {/* 수동 배정 */}
        {canApprove && (
          <ManualAssignDialog
            applicationId={applicationId}
            desiredCount={desiredCount}
            onSubmit={(numbers) =>
              post(`/api/admin/applications/${applicationId}/assign`, {
                plotNumbers: numbers,
              })
            }
            disabled={isPending}
          />
        )}

        {/* 거절 */}
        {canReject && (
          <RejectDialog
            onSubmit={(reason, adminNote) =>
              post(`/api/admin/applications/${applicationId}/reject`, {
                reason,
                adminNote: adminNote || undefined,
              })
            }
            disabled={isPending}
          />
        )}

        {/* 취소 */}
        {canCancel && (
          <CancelDialog
            onSubmit={(adminNote) =>
              post(`/api/admin/applications/${applicationId}/cancel`, {
                adminNote: adminNote || undefined,
              })
            }
            disabled={isPending}
          />
        )}
      </div>
    </div>
  )
}

/* ─── 다이얼로그 컴포넌트 ─── */

function ManualAssignDialog({
  desiredCount,
  onSubmit,
  disabled,
}: {
  applicationId: string
  desiredCount: number
  onSubmit: (numbers: number[]) => Promise<boolean>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const handleConfirm = async () => {
    const numbers = parsePlotNumbers(text)
    if (numbers.length === 0) return
    const ok = await onSubmit(numbers)
    if (ok) {
      setOpen(false)
      setText('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
      >
        수동 배정
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>수동 배정</DialogTitle>
        <DialogDescription>
          정확히 <strong>{desiredCount}개</strong>의 구획 번호를 쉼표로 구분해
          입력하세요. 예: <code>5, 6, 7</code>
        </DialogDescription>
        <div className="mt-4 space-y-2">
          <Label htmlFor="manual-plots" className="text-sm font-medium">
            구획 번호
          </Label>
          <Input
            id="manual-plots"
            placeholder="5, 6, 7"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={disabled}
          >
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={disabled || !text.trim()}>
            배정 확정
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RejectDialog({
  onSubmit,
  disabled,
}: {
  onSubmit: (reason: string, adminNote?: string) => Promise<boolean>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  const handleConfirm = async () => {
    if (!reason.trim()) return
    const ok = await onSubmit(reason.trim(), note.trim() || undefined)
    if (ok) {
      setOpen(false)
      setReason('')
      setNote('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-9 items-center justify-center rounded-md border border-destructive/40 bg-background px-4 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
      >
        거절
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>신청 거절</DialogTitle>
        <DialogDescription>
          거절 사유는 신청자가 본인 조회 시 표시되므로 정중하게 작성해주세요.
          배정된 구획이 있다면 자동으로 해제됩니다.
        </DialogDescription>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              사유 (필수, 신청자에게 표시)
            </Label>
            <Textarea
              id="reject-reason"
              className="mt-1.5"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 모집 정원이 마감되어 다음 시즌을 기다려주세요."
            />
          </div>
          <div>
            <Label htmlFor="reject-note" className="text-sm font-medium">
              내부 메모 (선택, 신청자에게 비공개)
            </Label>
            <Textarea
              id="reject-note"
              className="mt-1.5"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={disabled}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={disabled || !reason.trim()}
          >
            거절 확정
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({
  onSubmit,
  disabled,
}: {
  onSubmit: (adminNote?: string) => Promise<boolean>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  const handleConfirm = async () => {
    const ok = await onSubmit(note.trim() || undefined)
    if (ok) {
      setOpen(false)
      setNote('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
      >
        취소 처리
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>신청 취소</DialogTitle>
        <DialogDescription>
          신청자가 환불 요청 등으로 취소된 경우 사용합니다. 배정된 구획이 있다면
          자동으로 해제됩니다.
        </DialogDescription>
        <div className="mt-4">
          <Label htmlFor="cancel-note" className="text-sm font-medium">
            내부 메모 (선택)
          </Label>
          <Textarea
            id="cancel-note"
            className="mt-1.5"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 환불 처리 완료 (2026-12-15)"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={disabled}
          >
            돌아가기
          </Button>
          <Button onClick={handleConfirm} disabled={disabled}>
            취소 확정
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function parsePlotNumbers(text: string): number[] {
  return text
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
}
