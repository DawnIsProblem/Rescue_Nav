import { Link } from 'react-router-dom'
import InterfacePreviewSection from '../components/support/InterfacePreviewSection'
import SupportFaqAccordion from '../components/support/SupportFaqAccordion'
import AppHeader from '../components/shared/AppHeader'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'
import SiteFooter from '../components/shared/SiteFooter'
import { useAppLanguage } from '../lib/appLanguage'

export default function SupportPage() {
  const { language } = useAppLanguage()
  const faqItems = language === 'ko'
    ? [
        {
          question: '경로 결과는 어떤 방식으로 보여지나요?',
          answer:
            '경로 계산 후 긴급 경로와 일반 경로를 함께 확인할 수 있으며, ETA, 거리, 경로 포인트 수를 화면에서 바로 비교할 수 있습니다.',
        },
        {
          question: '긴급 경로와 일반 경로는 어떻게 비교하나요?',
          answer:
            '경로 계산이 끝나면 긴급 경로가 기본으로 선택되며, 경로 모드 전환으로 일반 경로와 번갈아 보면서 비교할 수 있습니다.',
        },
        {
          question: 'fallback 정보는 언제 표시되나요?',
          answer:
            '그래프 기반 긴급 경로 계산이 어려운 경우 fallback 여부, 사유, 경고 문구가 긴급 경로 요약 카드에 함께 표시됩니다.',
        },
        {
          question: '출동을 시작하면 어떤 상태를 확인할 수 있나요?',
          answer:
            '출동 중에는 현재 위치 추적과 목적지 기준 상태를 계속 확인할 수 있고, 목적지 100m 이내에 진입하면 자동 완료 처리됩니다.',
        },
      ]
    : [
        {
          question: 'How are route results presented?',
          answer:
            'After calculation, both emergency and standard routes are shown together so ETA, distance, and route point count can be compared on screen.',
        },
        {
          question: 'How do I compare emergency and standard routes?',
          answer:
            'Once route calculation is finished, the emergency route is selected by default, and you can switch route modes to compare it with the standard route.',
        },
        {
          question: 'When is fallback information displayed?',
          answer:
            'If graph-based emergency routing is difficult, fallback usage, its reason, and warning text are shown together in the emergency route summary card.',
        },
        {
          question: 'What can I monitor after dispatch starts?',
          answer:
            'During dispatch, you can keep monitoring live position and destination-based status, and the dispatch is auto-completed within 100 meters of the destination.',
        },
      ]

  const guideSteps = language === 'ko'
    ? [
        {
          step: '01',
          title: '목적지 검색',
          description:
            '카카오 우편번호 검색을 이용해 목적지를 선택하고, 출동에 필요한 주소 정보를 먼저 확정합니다.',
        },
        {
          step: '02',
          title: '차량 종류 선택',
          description:
            '소방차 또는 구급차를 선택하면 차량 기준에 맞춰 경로 계산 요청이 준비됩니다.',
        },
        {
          step: '03',
          title: '경로 비교 확인',
          description: '긴급 경로와 일반 경로를 함께 계산한 뒤 ETA, 거리, 메타데이터를 비교해 확인합니다.',
        },
        {
          step: '04',
          title: '출동 상태 확인',
          description: '출동을 시작하면 현재 위치 추적과 목적지 기준 상태를 확인하며 진행 상황을 이어서 볼 수 있습니다.',
        },
      ]
    : [
        {
          step: '01',
          title: 'Search destination',
          description:
            'Use Kakao postcode search to select the destination and confirm the address needed for dispatch.',
        },
        {
          step: '02',
          title: 'Choose vehicle type',
          description:
            'Select a fire engine or ambulance to prepare route calculation with the matching vehicle profile.',
        },
        {
          step: '03',
          title: 'Review route comparison',
          description: 'Calculate emergency and standard routes together, then compare ETA, distance, and metadata.',
        },
        {
          step: '04',
          title: 'Check dispatch status',
          description: 'After dispatch starts, continue monitoring live position and destination-based progress.',
        },
      ]

  const copy = language === 'ko'
    ? {
        title: 'Rescue_Nav 사용 안내',
        description: '현재 구현된 경로 계산, 경로 비교, 출동 상태 확인 흐름을 기준으로 핵심 사용 방법을 정리했습니다.',
        faqTitle: '긴급 출동 FAQ',
        faqDescription: '현장에서 자주 묻는 내용을 빠르게 확인할 수 있습니다.',
        ctaTitle: '출동 준비가 끝났나요?',
        ctaDescription: '안내를 확인했다면 대시보드로 이동해 목적지를 선택하고 경로 계산을 시작하세요.',
        ctaButton: '대시보드로 돌아가기',
      }
    : {
        title: 'Rescue_Nav Guide',
        description: 'This page summarizes the current route calculation, route comparison, and dispatch status flow that is already implemented.',
        faqTitle: 'Emergency Dispatch FAQ',
        faqDescription: 'Check the most common field questions at a glance.',
        ctaTitle: 'Ready to start dispatch?',
        ctaDescription: 'If you have reviewed the guide, move to the dashboard, choose a destination, and start route calculation.',
        ctaButton: 'Back to Dashboard',
      }

  return (
    <PageShell outerClassName="min-h-screen bg-[#ffffff]">
      <AppHeader active="support" showStartNavigation />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col px-4 pb-8 pt-5 md:px-6 xl:px-8">
        <section className="flex-1">
          <h1 className="text-5xl font-bold leading-none tracking-tight text-zinc-900 md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">
            {copy.description}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {guideSteps.map((step, index) => (
              <article
                key={step.step}
                className={[
                  'rounded-lg border bg-white p-4 shadow-sm',
                  index === 3 ? 'border-red-200' : 'border-zinc-200',
                ].join(' ')}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-50 text-xs font-bold text-red-600">
                  {step.step}
                </span>
                <p className="mt-3 text-2xl font-bold leading-tight tracking-tight text-zinc-900">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <InterfacePreviewSection />
          </div>

          <section className="mx-auto mt-10 max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">{copy.faqTitle}</h2>
            <p className="mt-2 text-center text-sm text-zinc-500">{copy.faqDescription}</p>
            <SupportFaqAccordion items={faqItems} className="mt-4 overflow-hidden rounded-lg border border-zinc-200" />
          </section>

          <section className="mt-10 rounded-2xl bg-gradient-to-r from-[#122031] via-[#1f2235] to-[#2a1f30] px-5 py-8 text-white shadow-sm md:px-8">
            <h3 className="text-center text-4xl font-bold leading-none tracking-tight md:text-5xl">{copy.ctaTitle}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-300">
              {copy.ctaDescription}
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/dashboard?view=dashboard">
                <CtaButton className="w-full px-6 py-3 text-sm uppercase tracking-wide sm:w-auto">{copy.ctaButton}</CtaButton>
              </Link>
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </PageShell>
  )
}
