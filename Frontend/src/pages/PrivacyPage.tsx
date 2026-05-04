import AppHeader from '../components/shared/AppHeader'
import PageShell from '../components/shared/PageShell'
import SiteFooter from '../components/shared/SiteFooter'
import { useAppLanguage } from '../lib/appLanguage'

export default function PrivacyPage() {
  const { language } = useAppLanguage()
  const privacyItems = language === 'ko'
    ? [
        'Rescue_Nav는 서비스 제공을 위해 필요한 최소 정보만 처리합니다.',
        '위치 정보, 목적지 정보, 출동 이력은 경로 계산 및 기록 확인 목적에 한해 사용될 수 있습니다.',
        '저장되는 데이터는 서비스 개선, 이력 조회, 오류 분석 목적에 한해 제한적으로 활용됩니다.',
        '민감한 개인정보를 의도적으로 수집하지 않으며, 사용자는 저장 데이터 삭제를 요청할 수 있습니다.',
        '본 서비스는 포트폴리오 및 시범 운영 단계이며, 정책은 추후 변경될 수 있습니다.',
      ]
    : [
        'Rescue_Nav processes only the minimum information required to provide the service.',
        'Location data, destination data, and dispatch history may be used only for route calculation and record review.',
        'Stored data is used in a limited way for service improvement, history lookup, and error analysis.',
        'Sensitive personal information is not intentionally collected, and users may request deletion of stored data.',
        'This service is currently in a portfolio and pilot-operation stage, and the policy may change later.',
      ]
  const copy = language === 'ko'
    ? {
        document: '문서',
        title: '개인정보 처리방침',
      }
    : {
        document: 'Document',
        title: 'Privacy Policy',
      }

  return (
    <PageShell outerClassName="flex min-h-screen w-full flex-col bg-[#ffffff] text-zinc-900">
      <AppHeader active="support" showStartNavigation />
      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-10 md:px-6 md:py-14">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{copy.document}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl">{copy.title}</h1>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 md:text-base">
            {privacyItems.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageShell>
  )
}
