/**
 * Admin password hash 생성 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/hash-password.ts '<비밀번호>'
 *
 * 또는 tsx 없을 때 (Node 22+):
 *   node -e "console.log(require('bcryptjs').hashSync('<pw>', 12))"
 *
 * 출력된 해시 값을 .env.local의 ADMIN_PASSWORD_HASH에 저장하세요.
 */
import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('Usage: pnpm tsx scripts/hash-password.ts <password>')
  process.exit(1)
}

if (password.length < 8) {
  console.warn('⚠️  Warning: password length < 8 — consider stronger password')
}

const hash = bcrypt.hashSync(password, 12)
console.log('\nADMIN_PASSWORD_HASH=' + hash)
console.log('\n→ .env.local 파일에 위 라인을 복사하세요.')
