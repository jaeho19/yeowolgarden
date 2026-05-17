import { Card, CardContent } from '@/components/ui/card'

const VALUES = [
  {
    icon: '🚇',
    title: '교통 편리',
    description:
      '서울 강서·양천에서 차로 약 30분. 부천역에서 가까워 대중교통도 가능합니다.',
  },
  {
    icon: '🎓',
    title: '전문가 운영',
    description:
      '조경학 박사가 직접 운영하는 학습형 텃밭. 작물·재배 자문을 받을 수 있습니다.',
  },
  {
    icon: '🌾',
    title: '자연 속 일상',
    description:
      '봄에 씨 뿌리고 가을에 수확하는 사계절의 즐거움. 가족 단위 추천.',
  },
] as const

export function ValueCards() {
  return (
    <section
      className="bg-muted/30 py-16 sm:py-20"
      aria-labelledby="value-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="value-heading"
          className="text-center text-2xl font-bold sm:text-3xl"
        >
          여월농장의 세 가지 약속
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} className="border-brand-100/60">
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="text-4xl" role="img" aria-hidden>
                  {v.icon}
                </span>
                <h3 className="text-lg font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
