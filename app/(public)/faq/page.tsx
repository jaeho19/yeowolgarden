import type { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: 'FAQ — 자주 묻는 질문',
  description:
    '여월농장 분양·이용·결제·취소 관련 자주 묻는 질문 모음.',
}

interface FaqItem {
  q: string
  a: string
}

interface FaqGroup {
  title: string
  items: FaqItem[]
}

const FAQS: readonly FaqGroup[] = [
  {
    title: '분양 신청',
    items: [
      {
        q: '신청은 언제부터 가능한가요?',
        a: '매년 2월부터 온라인 신청을 받습니다. 자세한 시작일은 공지사항에서 안내합니다.',
      },
      {
        q: '구획은 어떻게 배정되나요?',
        a: '입금 확인 후 운영자가 인접한 구획을 자동 배정합니다. 여러 구좌를 신청하면 같은 줄·인접한 자리로 묶여 배정되므로 가족·동호회 단위로 함께 이용하실 수 있습니다.',
      },
      {
        q: '신청한 구획 위치를 미리 고를 수 있나요?',
        a: '올해는 첫 시즌이라 선택 분양 대신 자동 배정 방식으로 운영합니다. 신청 메모란에 희망 사항(예: 입구 근처 / 그늘 적은 곳)을 적어주시면 가능한 범위에서 반영합니다.',
      },
      {
        q: '한 사람이 여러 구좌를 신청할 수 있나요?',
        a: '네, 가능합니다. 단, 동일 이메일·시즌 기준 1회만 접수되므로 한 번에 원하시는 구좌 수를 모두 신청해주세요.',
      },
    ],
  },
  {
    title: '결제·환불',
    items: [
      {
        q: '결제는 어떻게 하나요?',
        a: '신청 완료 후 화면에 안내되는 계좌(농축협 351-1352-647143, 농업회사법인 (유)호정)로 신청 금액을 1회 일시 이체합니다. 카드 결제는 지원하지 않습니다.',
      },
      {
        q: '입금자명을 본인이 아닌 가족 명의로 해도 되나요?',
        a: '가능합니다. 신청 시 메모란에 입금자명을 기재해주시면 운영자가 매칭하여 처리합니다.',
      },
      {
        q: '환불은 가능한가요?',
        a: '시즌 개장(3월 초) 이전에는 전액 환불됩니다. 개장 이후 환불은 이용약관을 참조하시거나 운영자에게 직접 문의해주세요.',
      },
    ],
  },
  {
    title: '시설·이용',
    items: [
      {
        q: '농원 운영시간은 어떻게 되나요?',
        a: '오전 6시부터 오후 8시까지 주중·주말 동일하게 운영합니다. 운영시간 외에는 도난 방지를 위해 번호 자물쇠로 출입문을 잠가둡니다. 마지막으로 나오시는 분은 꼭 문을 닫아주시기 바랍니다.',
      },
      {
        q: '농기구는 가져와야 하나요?',
        a: '네, 호미·삽·물뿌리개 등 농기구는 본인이 지참해주세요. 농원에서는 별도로 대여하지 않습니다.',
      },
      {
        q: '물은 어디서 쓰나요?',
        a: '농원에서는 지하수를 끌어 씁니다. 구획 근처에 수도와 호스가 비치되어 있어 무료로 자유롭게 사용하실 수 있습니다.',
      },
      {
        q: '주차는 가능한가요?',
        a: '농원 입구에 무료 주차장이 있습니다(약 20대 수용). 주말 오전에는 혼잡할 수 있으니 가급적 일찍 방문해주세요.',
      },
      {
        q: '아이나 반려동물을 데려가도 되나요?',
        a: '가족 단위 방문을 환영합니다. 반려동물 동반도 가능하나, 다른 분에게 피해가 가지 않도록 리드줄을 반드시 착용해주세요.',
      },
      {
        q: '비 오는 날에도 갈 수 있나요?',
        a: '농원은 상시 개방되어 있으나, 토양이 무를 수 있으니 비 오는 날 직후의 작업은 권장하지 않습니다.',
      },
      {
        q: '꼭 지켜야 할 이용 규칙이 있나요?',
        a: '올해 첫 운영이라 다소 미숙한 부분이 있을 수 있는 점 양해 부탁드립니다. 두 가지만 꼭 지켜주세요. 사용하신 쓰레기는 반드시 되가져가 주시고, 텃밭 내에서는 음주를 삼가 주시기 바랍니다.',
      },
    ],
  },
  {
    title: '작물·재배',
    items: [
      {
        q: '어떤 작물을 심을 수 있나요?',
        a: '상추·토마토·가지·고추·옥수수·콩 등 대부분의 텃밭 작물이 가능합니다. 운영자가 시기별 작물 추천을 도와드립니다.',
      },
      {
        q: '농약·비료는 어떻게 하나요?',
        a: '여월농장은 친환경 농법을 지향합니다. 저농약·퇴비 중심으로 운영하시기를 권장하며, 운영자가 자문해드립니다.',
      },
      {
        q: '비닐 멀칭을 사용해도 되나요?',
        a: '여월농장은 친환경 농법을 지향하므로 비닐 멀칭 사용은 삼가 주세요. 짚·풀·낙엽 등 자연 멀칭재를 권장드립니다.',
      },
      {
        q: '퇴비·비료·모종은 농원에서 구매할 수 있나요?',
        a: '네, 농원에서 퇴비·비료·모종을 직접 판매합니다. 소진 시까지 한정으로 운영하니, 주말 방문 시 운영자에게 문의해주세요.',
      },
    ],
  },
  {
    title: '본인 조회·문의',
    items: [
      {
        q: '신청 상태는 어떻게 확인하나요?',
        a: '신청 완료 시 안내되는 신청번호와 이메일을 입력하면 본인 조회 페이지에서 언제든 상태를 확인할 수 있습니다.',
      },
      {
        q: '신청번호를 잊어버렸어요.',
        a: '운영자에게 직접 연락주시면 본인 확인 후 알려드립니다.',
      },
    ],
  },
] as const

export default function FaqPage() {
  return (
    <>
      {/* Hero — sub-page 종이톤 패턴 */}
      <section
        className="border-b border-border bg-secondary py-12 sm:py-16"
        aria-labelledby="faq-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-700">자주 묻는 질문</p>
          <h1
            id="faq-hero-heading"
            className="mt-3 font-heading text-h1 font-bold leading-[1.15] tracking-tight text-foreground"
          >
            자주 묻는 질문
          </h1>
          <p className="mt-5 max-w-[58ch] text-base text-muted-foreground sm:text-lg">
            여기에서 답을 찾지 못하셨다면 운영자에게 직접 문의해주세요.
          </p>
        </div>
      </section>

      {/* FAQ 그룹 */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {FAQS.map((group) => (
            <div key={group.title} className="mb-10 last:mb-0">
              <h2 className="mb-3 text-lg font-bold text-brand-700">
                {group.title}
              </h2>
              <Accordion className="rounded-xl border border-border bg-card px-4 shadow-sm">
                {group.items.map((item) => (
                  <AccordionItem key={item.q}>
                    <AccordionTrigger className="py-4 text-base font-medium">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* 문의 CTA */}
      <section className="border-t border-border bg-secondary py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            더 궁금한 점이 있으신가요?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            운영자에게 직접 문의하시거나, 분양 신청 폼의 메모란을 활용해주세요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/apply" size="lg">
              분양 신청하기 →
            </LinkButton>
            <LinkButton href="/notice" variant="outline" size="lg">
              공지사항 보기
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}
