/**
 * 신청(application) CRUD 헬퍼 (서버 전용).
 *
 * 핵심:
 *  - createApplication: 트랜잭션 내 시즌 내 다음 applicationNumber 발급
 *    - uq_season_email로 중복 신청 차단 (DB unique constraint)
 *  - findByLookup: 신청번호 + 이메일 + 현재 시즌 일치 검사
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §3.4, §6.2
 */
import { and, eq, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@/lib/db'
import { applications, auditLogs } from '@/db/schema'
import { totalPriceKrw } from '@/lib/pricing'
import { ConflictError } from '@/lib/errors'
import type { ApplicationInput } from '@/lib/schemas/application'

export interface CreateApplicationResult {
  id: string
  applicationNumber: number
  totalPriceKrw: number
}

export async function createApplication(
  input: ApplicationInput,
  seasonYear: number
): Promise<CreateApplicationResult> {
  const price = totalPriceKrw(input.desiredCount)

  return await db.transaction(async (tx) => {
    // 1) 시즌 내 이메일 중복 차단 (uq_season_email로 DB 레벨에서도 보호되지만 명시 에러)
    const dup = await tx
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.seasonYear, seasonYear),
          eq(applications.email, input.email)
        )
      )
      .get()
    if (dup) {
      throw new ConflictError(
        'DUPLICATE_APPLICATION',
        '이미 같은 이메일로 신청한 내역이 있습니다. 본인 조회 페이지에서 확인해주세요.'
      )
    }

    // 2) 시즌 내 다음 번호 발급
    const maxRow = await tx
      .select({
        max: sql<number>`coalesce(max(${applications.applicationNumber}), 0)`,
      })
      .from(applications)
      .where(eq(applications.seasonYear, seasonYear))
      .get()
    const nextNumber = (maxRow?.max ?? 0) + 1

    // 3) INSERT
    const id = createId()
    await tx.insert(applications).values({
      id,
      applicationNumber: nextNumber,
      seasonYear,
      name: input.name,
      phone: input.phone,
      email: input.email,
      desiredCount: input.desiredCount,
      totalPriceKrw: price,
      experience: input.experience || null,
      memo: input.memo || null,
      privacyAgreed: input.privacyAgreed,
      status: 'PENDING',
    })

    // 4) AuditLog
    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'CREATE_APPLICATION',
      targetType: 'Application',
      targetId: id,
      payload: JSON.stringify({
        applicationNumber: nextNumber,
        desiredCount: input.desiredCount,
        totalPriceKrw: price,
      }),
      actor: 'user',
    })

    return { id, applicationNumber: nextNumber, totalPriceKrw: price }
  })
}

/* ─── 본인 조회 ─── */

export interface LookupResult {
  applicationNumber: number
  name: string
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  desiredCount: number
  totalAreaPyeong: number
  totalPriceKrw: number
  assignedPlots: { plotNumber: number }[]
  seasonYear: number
  createdAt: string
  approvedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
}

/**
 * 신청번호 + 이메일 + 시즌 일치 조회.
 * 일치하지 않으면 null. 호출자가 404로 변환.
 *
 * 응답 필드는 화이트리스트 — phone, memo, experience, adminNote, plotIds(cuid)은 노출 X.
 */
export async function findByLookup(
  applicationNumber: number,
  email: string,
  seasonYear: number
): Promise<LookupResult | null> {
  const app = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.applicationNumber, applicationNumber),
        eq(applications.email, email),
        eq(applications.seasonYear, seasonYear)
      )
    )
    .get()

  if (!app) return null

  const plotNumbers: number[] = app.plotNumbers
    ? (JSON.parse(app.plotNumbers) as number[])
    : []

  return {
    applicationNumber: app.applicationNumber,
    name: app.name,
    status: app.status,
    desiredCount: app.desiredCount,
    totalAreaPyeong: app.desiredCount * 5,
    totalPriceKrw: app.totalPriceKrw,
    assignedPlots: plotNumbers.map((n) => ({ plotNumber: n })),
    seasonYear: app.seasonYear,
    createdAt: app.createdAt.toISOString(),
    approvedAt: app.approvedAt ? app.approvedAt.toISOString() : null,
    rejectedAt: app.rejectedAt ? app.rejectedAt.toISOString() : null,
    rejectionReason: app.rejectionReason,
  }
}
