/**
 * Zod 스키마 — 공지 입력 검증 (어드민 전용)
 */
import { z } from 'zod'

export const AnnouncementInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  content: z
    .string()
    .trim()
    .min(1, '내용을 입력해주세요')
    .max(5000, '내용은 5000자 이내로 입력해주세요'),
  isPinned: z.boolean().default(false),
  isVisible: z.boolean().default(true),
})

export type AnnouncementInput = z.infer<typeof AnnouncementInputSchema>
