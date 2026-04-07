import KakaoMap from '../components/map/KakaoMap'
import AppHeader from '../components/shared/AppHeader'
import PageShell from '../components/shared/PageShell'

export default function MainPage() {
  return (
    <PageShell outerClassName="min-h-screen w-full bg-zinc-100">
      <AppHeader active="main" showStartNavigation />
      <main className="mx-auto h-[calc(100vh-73px)] w-full max-w-[1280px] p-4">
        <section className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <KakaoMap className="h-full w-full" />
        </section>
      </main>
    </PageShell>
  )
}
