import Link from 'next/link'

export function Footer() {
  const farmAddress =
    process.env.NEXT_PUBLIC_FARM_ADDRESS ?? '경기도 부천시 오정구 여월동 112'

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 농원 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl" role="img" aria-hidden>
                🌱
              </span>
              <span className="font-semibold">여월농장</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              사업자: 농업회사법인 (유)호정
              <br />
              주소: {farmAddress}
            </p>
          </div>

          {/* 사이트 메뉴 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/plots"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  분양 안내
                </Link>
              </li>
              <li>
                <Link
                  href="/access"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  오시는 길
                </Link>
              </li>
              <li>
                <Link
                  href="/notice"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  공지사항
                </Link>
              </li>
              <li>
                <Link
                  href="/apply/status"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  신청 조회
                </Link>
              </li>
            </ul>
          </div>

          {/* 약관 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">정책</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} 여월농장 (농업회사법인 (유)호정). All
          rights reserved.
        </div>
      </div>
    </footer>
  )
}
