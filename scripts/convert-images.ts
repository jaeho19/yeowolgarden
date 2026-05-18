/**
 * convert-images.ts — 정적 자산 사전 최적화
 *
 * public/gallery/illust-*.png (AI 일러스트, 각 ~2.3MB)을
 * webp로 변환해 모바일 LCP를 잡는다.
 *
 * 실행:
 *   pnpm tsx scripts/convert-images.ts
 *
 * 정책:
 * - 원본 PNG는 git에 그대로 보관 (rollback 가능)
 * - 출력 webp는 동일 경로에 .webp 확장자로
 * - 최대 가로 1600px (현재 원본 1024×1280 추정 → 그대로 유지)
 * - 품질 82 (잎/흙 디테일 유지 + 약 5-6배 압축)
 *
 * .impeccable.md 「일상 속 농장」 원칙:
 *   "AI 보정은 톤 보정·노출 보정 정도까지. 비현실적 채도·HDR 금지."
 *   → webp 변환은 무손실 톤 보정 범위.
 */
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const GALLERY_DIR = 'public/gallery'
const ILLUST_PATTERN = /^illust-.+\.png$/
const MAX_WIDTH = 1600
const WEBP_QUALITY = 82

interface Result {
  src: string
  dst: string
  beforeKB: number
  afterKB: number
}

async function convertOne(src: string, dst: string): Promise<Result> {
  const before = await stat(src)

  await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(dst)

  const after = await stat(dst)
  return {
    src,
    dst,
    beforeKB: Math.round(before.size / 1024),
    afterKB: Math.round(after.size / 1024),
  }
}

async function main() {
  const files = await readdir(GALLERY_DIR)
  const targets = files.filter((f) => ILLUST_PATTERN.test(f))

  if (targets.length === 0) {
    console.log('No illust-*.png files found in', GALLERY_DIR)
    return
  }

  console.log(`Converting ${targets.length} PNG → WebP (max ${MAX_WIDTH}px, q${WEBP_QUALITY})\n`)

  const results: Result[] = []
  for (const file of targets) {
    const src = join(GALLERY_DIR, file)
    const dst = src.replace(/\.png$/, '.webp')
    const r = await convertOne(src, dst)
    results.push(r)
    const ratio = ((1 - r.afterKB / r.beforeKB) * 100).toFixed(0)
    console.log(`  ${file}\n    ${r.beforeKB}KB → ${r.afterKB}KB (-${ratio}%)`)
  }

  const beforeTotal = results.reduce((s, r) => s + r.beforeKB, 0)
  const afterTotal = results.reduce((s, r) => s + r.afterKB, 0)
  const savedTotal = beforeTotal - afterTotal
  const ratio = ((savedTotal / beforeTotal) * 100).toFixed(0)
  console.log(`\nTotal: ${beforeTotal}KB → ${afterTotal}KB (saved ${savedTotal}KB, -${ratio}%)`)
}

main().catch((err) => {
  console.error('convert-images failed:', err)
  process.exit(1)
})
