'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PlotEditDialog } from '@/components/admin/PlotEditDialog'
import type { PlotStatus } from '@/lib/schemas/application'

export interface PlotItem {
  id: string
  plotNumber: number
  status: PlotStatus
  notes: string | null
  application: {
    id: string
    applicationNumber: number
    name: string
  } | null
}

interface Props {
  plots: PlotItem[]
}

const STATUS_CLS: Record<PlotStatus, string> = {
  AVAILABLE: 'bg-stone-100 text-stone-800 hover:bg-stone-200 border-stone-200',
  RESERVED: 'bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-300',
  OCCUPIED: 'bg-brand-500 text-white hover:bg-brand-600 border-brand-600',
}

export function PlotsGrid({ plots }: Props) {
  const [selected, setSelected] = useState<PlotItem | null>(null)

  return (
    <>
      {/* 범례 */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend cls={STATUS_CLS.AVAILABLE} label="가용" />
        <Legend cls={STATUS_CLS.RESERVED} label="예약" />
        <Legend cls={STATUS_CLS.OCCUPIED} label="점유" />
      </div>

      {/* 그리드 — 컴팩트 정사각형. 모바일 셀 ≥ 52px(터치 타겟 44+ 여유 보장) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(56px,1fr))]">
        {plots.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p)}
            className={cn(
              'aspect-square rounded-md border text-[11px] font-mono leading-tight touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-xs',
              STATUS_CLS[p.status]
            )}
            title={
              p.application
                ? `#${p.plotNumber} · ${p.application.name} (#${p.application.applicationNumber})`
                : `#${p.plotNumber}`
            }
          >
            <span className="block font-bold">{p.plotNumber}</span>
            {p.application && (
              <span className="block truncate text-[9px] opacity-90">
                #{p.application.applicationNumber}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 점유 신청 목록 (편의용) */}
      {plots.some((p) => p.application) && (
        <details className="mt-6 rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium">
            점유 구획 → 신청 목록 보기
          </summary>
          <ul className="mt-3 space-y-1.5 text-sm">
            {plots
              .filter((p) => p.application)
              .map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-12 font-mono font-semibold">
                    #{p.plotNumber}
                  </span>
                  <Link
                    href={`/admin/applications/${p.application!.id}`}
                    className="text-brand-700 hover:underline"
                  >
                    #{p.application!.applicationNumber} {p.application!.name}
                  </Link>
                </li>
              ))}
          </ul>
        </details>
      )}

      <PlotEditDialog plot={selected} onClose={() => setSelected(null)} />
    </>
  )
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('inline-block size-4 rounded border', cls)} />
      {label}
    </span>
  )
}
