/**
 * 분양 자동/수동 배정.
 *
 * 핵심 보장:
 *  - 트랜잭션 내 1회 read → findContiguousGroup → 조건부 UPDATE
 *  - 조건부 UPDATE의 affected rows가 0이면 race condition → 트랜잭션 rollback
 *  - 모든 변경은 AuditLog로 기록
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §4.3
 */
import { and, asc, eq, inArray } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@/lib/db'
import { applications, auditLogs, plots, type Plot } from '@/db/schema'
import { ConflictError, NotFoundError } from '@/lib/errors'

export interface AllocationSuccess {
  success: true
  needsManualAssignment?: false
  assignedPlots: { plotNumber: number; areaPyeong: number }[]
}

export interface AllocationManualRequired {
  success: false
  needsManualAssignment: true
}

export type AllocationResult = AllocationSuccess | AllocationManualRequired

/**
 * 정렬된 가용 plot에서 연속한 n개를 찾는다 (greedy first-fit).
 * 가장 앞쪽의 묶음 선택 → 잔여 묶음이 잘게 쪼개지지 않도록.
 */
export function findContiguousGroup<T extends { plotNumber: number }>(
  sorted: T[],
  n: number
): T[] | null {
  if (n <= 0 || sorted.length < n) return null
  for (let i = 0; i <= sorted.length - n; i++) {
    let ok = true
    for (let j = 1; j < n; j++) {
      if (sorted[i + j].plotNumber !== sorted[i + j - 1].plotNumber + 1) {
        ok = false
        break
      }
    }
    if (ok) return sorted.slice(i, i + n)
  }
  return null
}

/**
 * 신청에 대한 자동 배정.
 *  - 인접 묶음 발견 → CONFIRMED + plot OCCUPIED
 *  - 묶음 못 찾음 → application status='PAID' (수동 대기) 표시
 *  - 이미 CONFIRMED 또는 plot 보유 → ConflictError
 */
export async function autoAllocate(
  applicationId: string
): Promise<AllocationResult> {
  return await db.transaction(async (tx) => {
    const app = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .get()
    if (!app) throw new NotFoundError('NOT_FOUND', '신청을 찾을 수 없습니다.')
    if (app.status === 'CONFIRMED') {
      throw new ConflictError(
        'ALREADY_CONFIRMED',
        '이미 배정 완료된 신청입니다.'
      )
    }
    if (app.status === 'REJECTED' || app.status === 'CANCELLED') {
      throw new ConflictError(
        'ALREADY_CONFIRMED',
        '거절 또는 취소된 신청은 배정할 수 없습니다.'
      )
    }
    if (app.plotIds && JSON.parse(app.plotIds).length > 0) {
      throw new ConflictError(
        'ALREADY_HAS_PLOTS',
        '이미 구획이 배정되어 있습니다.'
      )
    }

    const n = app.desiredCount

    // 1) 가용 plot 정렬 조회
    const available = await tx
      .select()
      .from(plots)
      .where(
        and(eq(plots.seasonYear, app.seasonYear), eq(plots.status, 'AVAILABLE'))
      )
      .orderBy(asc(plots.plotNumber))
      .all()

    const group = findContiguousGroup(available, n)

    if (!group) {
      // 수동 배정 대기 표시
      await tx
        .update(applications)
        .set({ status: 'PAID' })
        .where(eq(applications.id, app.id))

      await tx.insert(auditLogs).values({
        id: createId(),
        action: 'NEED_MANUAL_ASSIGNMENT',
        targetType: 'Application',
        targetId: app.id,
        payload: JSON.stringify({ desiredCount: n }),
        actor: 'system',
      })

      return { success: false as const, needsManualAssignment: true as const }
    }

    // 2) 묶음의 각 plot을 조건부로 OCCUPIED (race 방지)
    const now = new Date()
    for (const p of group) {
      const updated = await tx
        .update(plots)
        .set({
          status: 'OCCUPIED',
          applicationId: app.id,
          updatedAt: now,
        })
        .where(and(eq(plots.id, p.id), eq(plots.status, 'AVAILABLE')))
        .returning()
        .all()
      if (updated.length === 0) {
        // 누군가 먼저 점유 — 트랜잭션 rollback (throw)
        throw new ConflictError(
          'NO_CONTIGUOUS_GROUP',
          '배정 도중 다른 처리와 충돌했습니다. 다시 시도해주세요.'
        )
      }
    }

    // 3) Application CONFIRMED
    await tx
      .update(applications)
      .set({
        status: 'CONFIRMED',
        plotIds: JSON.stringify(group.map((g) => g.id)),
        plotNumbers: JSON.stringify(group.map((g) => g.plotNumber)),
        approvedAt: now,
      })
      .where(eq(applications.id, app.id))

    // 4) AuditLog
    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'APPROVE_AUTO',
      targetType: 'Application',
      targetId: app.id,
      payload: JSON.stringify({
        plotNumbers: group.map((g) => g.plotNumber),
      }),
      actor: 'admin',
    })

    return {
      success: true as const,
      assignedPlots: group.map((g) => ({
        plotNumber: g.plotNumber,
        areaPyeong: g.areaPyeong,
      })),
    }
  })
}

/**
 * 운영자 수동 배정.
 * - 운영자가 임의의 plot number 배열을 지정 (인접·균일 강제 안 함).
 * - 모든 plot이 동일 시즌 + AVAILABLE이어야 함.
 */
export async function assignManual(
  applicationId: string,
  plotNumbers: number[]
): Promise<AllocationSuccess> {
  if (plotNumbers.length === 0) {
    throw new ConflictError(
      'NO_CONTIGUOUS_GROUP',
      '배정할 구획을 선택해주세요.'
    )
  }

  // 중복 제거
  const unique = [...new Set(plotNumbers)].sort((a, b) => a - b)

  return await db.transaction(async (tx) => {
    const app = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .get()
    if (!app) throw new NotFoundError('NOT_FOUND', '신청을 찾을 수 없습니다.')
    if (app.status === 'CONFIRMED') {
      throw new ConflictError(
        'ALREADY_CONFIRMED',
        '이미 배정 완료된 신청입니다.'
      )
    }
    if (app.status === 'REJECTED' || app.status === 'CANCELLED') {
      throw new ConflictError(
        'ALREADY_CONFIRMED',
        '거절 또는 취소된 신청은 배정할 수 없습니다.'
      )
    }
    if (unique.length !== app.desiredCount) {
      throw new ConflictError(
        'NO_CONTIGUOUS_GROUP',
        `신청 구좌 수(${app.desiredCount})와 배정 구획 수(${unique.length})가 일치하지 않습니다.`
      )
    }

    // 대상 plot 조회 (현재 시즌)
    const targetPlots: Plot[] = await tx
      .select()
      .from(plots)
      .where(
        and(
          eq(plots.seasonYear, app.seasonYear),
          inArray(plots.plotNumber, unique)
        )
      )
      .all()
    if (targetPlots.length !== unique.length) {
      throw new ConflictError(
        'NO_CONTIGUOUS_GROUP',
        '선택한 구획 중 일부를 찾을 수 없습니다.'
      )
    }
    const unavailable = targetPlots.filter((p) => p.status !== 'AVAILABLE')
    if (unavailable.length > 0) {
      throw new ConflictError(
        'NO_CONTIGUOUS_GROUP',
        `구획 #${unavailable.map((p) => p.plotNumber).join(', #')} 은(는) 이미 점유된 상태입니다.`
      )
    }

    // 조건부 UPDATE
    const now = new Date()
    for (const p of targetPlots) {
      const updated = await tx
        .update(plots)
        .set({
          status: 'OCCUPIED',
          applicationId: app.id,
          updatedAt: now,
        })
        .where(and(eq(plots.id, p.id), eq(plots.status, 'AVAILABLE')))
        .returning()
        .all()
      if (updated.length === 0) {
        throw new ConflictError(
          'NO_CONTIGUOUS_GROUP',
          '배정 도중 다른 처리와 충돌했습니다. 다시 시도해주세요.'
        )
      }
    }

    await tx
      .update(applications)
      .set({
        status: 'CONFIRMED',
        plotIds: JSON.stringify(targetPlots.map((p) => p.id)),
        plotNumbers: JSON.stringify(targetPlots.map((p) => p.plotNumber)),
        approvedAt: now,
      })
      .where(eq(applications.id, app.id))

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'APPROVE_MANUAL',
      targetType: 'Application',
      targetId: app.id,
      payload: JSON.stringify({
        plotNumbers: targetPlots.map((p) => p.plotNumber),
      }),
      actor: 'admin',
    })

    return {
      success: true as const,
      assignedPlots: targetPlots.map((p) => ({
        plotNumber: p.plotNumber,
        areaPyeong: p.areaPyeong,
      })),
    }
  })
}

/**
 * 거절 — 사유 필수.
 * 이미 배정된 plot이 있다면 해제 (방어적).
 */
export async function rejectApplication(
  applicationId: string,
  reason: string,
  adminNote?: string
): Promise<void> {
  if (!reason || reason.trim().length === 0) {
    throw new ConflictError('VALIDATION_FAILED', '거절 사유를 입력해주세요.')
  }
  await db.transaction(async (tx) => {
    const app = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .get()
    if (!app) throw new NotFoundError('NOT_FOUND', '신청을 찾을 수 없습니다.')

    // 이미 배정된 plot 해제
    const plotIds: string[] = app.plotIds
      ? (JSON.parse(app.plotIds) as string[])
      : []
    if (plotIds.length > 0) {
      const now = new Date()
      await tx
        .update(plots)
        .set({ status: 'AVAILABLE', applicationId: null, updatedAt: now })
        .where(inArray(plots.id, plotIds))
    }

    const now = new Date()
    await tx
      .update(applications)
      .set({
        status: 'REJECTED',
        rejectedAt: now,
        rejectionReason: reason.trim(),
        adminNote: adminNote?.trim() || app.adminNote,
        plotIds: null,
        plotNumbers: null,
      })
      .where(eq(applications.id, app.id))

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'REJECT',
      targetType: 'Application',
      targetId: app.id,
      payload: JSON.stringify({ reason }),
      actor: 'admin',
    })
  })
}

/**
 * 취소 — 신청자가 환불 요청한 경우 등.
 * plot은 자동 해제.
 */
export async function cancelApplication(
  applicationId: string,
  adminNote?: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const app = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .get()
    if (!app) throw new NotFoundError('NOT_FOUND', '신청을 찾을 수 없습니다.')

    const plotIds: string[] = app.plotIds
      ? (JSON.parse(app.plotIds) as string[])
      : []
    if (plotIds.length > 0) {
      const now = new Date()
      await tx
        .update(plots)
        .set({ status: 'AVAILABLE', applicationId: null, updatedAt: now })
        .where(inArray(plots.id, plotIds))
    }

    const now = new Date()
    await tx
      .update(applications)
      .set({
        status: 'CANCELLED',
        cancelledAt: now,
        adminNote: adminNote?.trim() || app.adminNote,
        plotIds: null,
        plotNumbers: null,
      })
      .where(eq(applications.id, app.id))

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'CANCEL',
      targetType: 'Application',
      targetId: app.id,
      payload: '{}',
      actor: 'admin',
    })
  })
}
