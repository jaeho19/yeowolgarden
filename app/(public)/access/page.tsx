import type { Metadata } from 'next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '오시는 길 — 경기 부천시 오정구 여월동 112',
  description:
    '여월농장 위치·교통 안내. 서울에서 차로 약 30분, 부천역에서 버스로 약 20분.',
}

const FARM_ADDRESS =
  process.env.NEXT_PUBLIC_FARM_ADDRESS ?? '경기도 부천시 오정구 여월동 112'
const FARM_LAT = process.env.NEXT_PUBLIC_FARM_LAT ?? '37.514173'
const FARM_LNG = process.env.NEXT_PUBLIC_FARM_LNG ?? '126.793019'
const NAVER_PLACE_ID =
  process.env.NEXT_PUBLIC_NAVER_MAP_PLACE_ID ?? '2003003971'

const NAVER_DIRECTIONS = `https://map.naver.com/p/directions/-/-/-/${FARM_LNG},${FARM_LAT},여월농장,${NAVER_PLACE_ID},PLACE_POI/-/transit`
const KAKAO_MAP_URL = `https://map.kakao.com/?q=여월농장`
const TMAP_URL = `tmap://search?name=여월농장`

const CAR_GUIDE = [
  {
    from: '서울 강서구·양천구',
    via: '경인고속도로 → 부천 IC → 약 30분',
  },
  {
    from: '인천',
    via: '경인로 / 봉오대로 → 약 25분',
  },
  {
    from: '일산·고양',
    via: '제2경인고속도로 → 부천 IC → 약 40분',
  },
] as const

const TRANSIT_GUIDE = [
  {
    from: '지하철 1호선 부천역',
    via: '북측 정류장 — 부천 75-1번 버스 → 여월동 하차 도보 5분 (약 20분)',
  },
  {
    from: '지하철 7호선 까치울역',
    via: '도보 약 25분 또는 마을버스 환승',
  },
] as const

export default function AccessPage() {
  return (
    <>
      {/* Hero — 풀폭 사진 + 명조 표제 + 정보 띠 (홈 Hero와 동일 패턴) */}
      <section className="relative bg-background" aria-labelledby="access-hero-heading">
        <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden bg-muted sm:h-[58vh] sm:min-h-[460px]">
          <img
            src="/gallery/KakaoTalk_20260516_150830179_07.jpg"
            alt="여월농장 가는 길"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
              <p className="text-sm font-medium text-white/90">오시는 길</p>
              <h1
                id="access-hero-heading"
                className="mt-3 max-w-3xl font-heading text-display font-bold leading-[1.08] tracking-tight text-white"
              >
                서울에서 30분,
                <br />
                부천 여월동
              </h1>
            </div>
          </div>
        </div>

        <div className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10 lg:px-8">
            <dl className="grid grid-cols-3 gap-x-8 gap-y-1.5 text-sm sm:gap-x-12">
              <dt className="text-muted-foreground">주소</dt>
              <dt className="text-muted-foreground">자가용</dt>
              <dt className="text-muted-foreground">대중교통</dt>
              <dd className="font-medium text-foreground">{FARM_ADDRESS}</dd>
              <dd className="font-medium text-foreground">서울 30분 · 인천 25분</dd>
              <dd className="font-medium text-foreground">부천역 + 75-1번 20분</dd>
            </dl>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <LinkButton href={NAVER_DIRECTIONS} target="_blank" rel="noreferrer" size="lg">
                네이버 길찾기 →
              </LinkButton>
              <LinkButton href={KAKAO_MAP_URL} target="_blank" rel="noreferrer" variant="outline" size="lg">
                카카오맵
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* 지도 + 길찾기 CTA */}
      <section className="py-10" aria-labelledby="map-heading">
        <h2 id="map-heading" className="sr-only">
          지도
        </h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Naver 지도 iframe 임베드 */}
            <iframe
              title="여월농장 위치 (네이버 지도)"
              src={`https://map.naver.com/p/entry/place/${NAVER_PLACE_ID}?c=15.00,0,0,0,dh`}
              className="h-[400px] w-full sm:h-[500px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Hero 정보 띠에 네이버·카카오 길찾기가 있으므로 여기는 T-map(모바일 전용)만 노출 */}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <LinkButton href={TMAP_URL} variant="outline">
              T-map으로 길찾기 (모바일)
            </LinkButton>
          </div>
        </div>
      </section>

      {/* 자가용 안내 */}
      <section className="py-12" aria-labelledby="car-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 id="car-heading" className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            자가용으로
          </h2>
          <ul className="mt-5 space-y-3">
            {CAR_GUIDE.map((g) => (
              <li
                key={g.from}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:gap-4"
              >
                <span className="font-semibold sm:w-44 shrink-0">{g.from}</span>
                <span className="text-sm text-muted-foreground">{g.via}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            ⓘ 농원 입구에 무료 주차장 (약 20대 수용). 주말 오전 10시 전 권장.
          </p>
        </div>
      </section>

      {/* 대중교통 */}
      <section className="bg-secondary py-12" aria-labelledby="transit-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 id="transit-heading" className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            대중교통으로
          </h2>
          <ul className="mt-5 space-y-3">
            {TRANSIT_GUIDE.map((g) => (
              <li
                key={g.from}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:gap-4"
              >
                <span className="font-semibold sm:w-52 shrink-0">{g.from}</span>
                <span className="text-sm text-muted-foreground">{g.via}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 주의사항 */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertTitle>방문 시 안내사항</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>주말·공휴일 오전 10시 ~ 오후 5시 운영 (시즌 중 상시 출입 가능)</li>
                <li>편한 옷·장갑·모자 착용 권장. 농기구는 무료 대여.</li>
                <li>반려동물 동반은 가능하나, 다른 분에게 피해 없도록 리드줄 필수.</li>
                <li>흡연·취사는 지정 장소에서만. 화재 위험 주의.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-8 text-center">
            <LinkButton href="/apply" size="lg">
              분양 신청하기 →
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}
