import AppHeader from '../components/shared/AppHeader'
import PageShell from '../components/shared/PageShell'
import SiteFooter from '../components/shared/SiteFooter'
import { useAppLanguage } from '../lib/appLanguage'

export default function TermsPage() {
  const { language } = useAppLanguage()
  const termsItems = language === 'ko'
    ? [
        'Rescue_Nav는 긴급 출동 지원을 위한 경로 안내 서비스를 제공합니다.',
        '일반경로와 긴급경로는 참고용 정보이며, 실제 운행 판단은 현장 상황과 관련 법규, 기관 지침을 우선합니다.',
        '긴급경로는 OSM, 외부 API, 내부 추정 로직을 기반으로 계산되므로 실제 도로 상황과 차이가 있을 수 있습니다.',
        '서비스 이용 중 발생한 판단 오류, 지연, 외부 API 장애 등에 대해 개발자는 운영기관 수준의 법적 책임을 보장하지 않습니다.',
        '본 서비스는 포트폴리오 및 시범 목적을 포함하며, 기능과 정책은 예고 없이 변경될 수 있습니다.',
      ]
    : [
        'Rescue_Nav provides route guidance to support emergency dispatch.',
        'Standard and emergency routes are reference information, and actual driving decisions must prioritize field conditions, laws, and agency guidelines.',
        'Emergency routes are calculated from OSM, external APIs, and internal estimation logic, so they may differ from real road conditions.',
        'The developer does not guarantee institution-level legal liability for judgment errors, delays, or external API failures while using the service.',
        'This service is provided for portfolio and pilot purposes, and features or policies may change without notice.',
      ]
  const copy = language === 'ko'
    ? {
        document: '문서',
        title: '이용 약관',
      }
    : {
        document: 'Document',
        title: 'Terms of Service',
      }

  return (
    <PageShell outerClassName="flex min-h-screen w-full flex-col bg-[#ffffff] text-zinc-900">
      <AppHeader active="support" showStartNavigation />
      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-10 md:px-6 md:py-14">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{copy.document}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl">{copy.title}</h1>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 md:text-base">
            {termsItems.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageShell>
  )
}
