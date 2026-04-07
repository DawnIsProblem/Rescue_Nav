import { Link } from 'react-router-dom'
import GuideWorkflowCard from '../components/support/GuideWorkflowCard'
import InterfacePreviewSection from '../components/support/InterfacePreviewSection'
import SupportFaqAccordion from '../components/support/SupportFaqAccordion'
import AppHeader from '../components/shared/AppHeader'
import CtaButton from '../components/shared/CtaButton'
import PageShell from '../components/shared/PageShell'

const faqItems = [
  {
    question: 'How is traffic data updated?',
    answer:
      'Routing overlays are refreshed continuously from municipal feeds and field telemetry with fallback satellite packets.',
  },
  {
    question: 'Can I override the suggested route?',
    answer:
      'Yes. Use Manual Override from Dispatch and confirm the alternate corridor before mission broadcast.',
  },
  {
    question: 'Is there an offline mode for remote areas?',
    answer:
      'Offline guidance remains available with cached map sectors and last-synced incident metadata.',
  },
  {
    question: 'How many vehicles can I track simultaneously?',
    answer:
      'Rescue_Nav supports concurrent tracking for up to 120 active units per mission cluster.',
  },
]

const guideStepsDesktop = [
  {
    step: '01',
    title: 'Enter incident address',
    description:
      'Input precise GPS coordinates or street address for immediate situational awareness.',
  },
  {
    step: '02',
    title: 'Select vehicle type',
    description:
      'Choose between Heavy Rescue, Ambulance, or Air Support to optimize terrain routing.',
  },
  {
    step: '03',
    title: 'Generate emergency route',
    description: 'AI-driven engine calculates the fastest route avoiding construction and hazardous zones.',
  },
  {
    step: '04',
    title: 'Start dispatch simulation',
    description: 'Review tactical summary and initiate live dispatch to field units.',
  },
]

const guideStepsTablet = [
  {
    step: '01',
    title: 'Initialize Telemetry',
    description:
      'Synchronize your local coordinates with the central command. Rescue_Nav uses military-grade GPS triangulation.',
    icon: 'o',
    accent: 'red' as const,
    previewTone: 'dark' as const,
  },
  {
    step: '02',
    title: 'Define Extraction Route',
    description:
      'Select your target and let the AI compute the safest corridor, bypassing high-risk zones and topographic hazards.',
    icon: '[]',
    accent: 'blue' as const,
    previewTone: 'dark' as const,
  },
  {
    step: '03',
    title: 'Team Deployment',
    description:
      'Assign assets to team members directly through the dashboard. Track vitals and mission proximity metrics.',
    icon: '+',
    accent: 'red' as const,
    previewTone: 'light' as const,
  },
  {
    step: '04',
    title: 'Broadcast Signal',
    description: 'In final execution, trigger the Start Rescue command to broadcast your mission profile.',
    icon: '!',
    accent: 'red' as const,
    previewTone: 'dark' as const,
  },
]

const mobileWorkflowItems = [
  {
    step: '01',
    title: 'Initialize System',
    description:
      'Open the application and wait for the GPS telemetry to stabilize. Ensure the "Signal Pulse" indicator is green.',
  },
  {
    step: '02',
    title: 'Select Mission',
    description:
      'Tap "Missions" from the dashboard to view assigned rescues. Review the objective brief before departure.',
  },
  {
    step: '03',
    title: 'Start Rescue',
    description:
      'Press the high-contrast "START RESCUE" button. Follow compass line indicator for real-time tactical guidance.',
  },
]

function DesktopSupportView() {
  return (
    <PageShell outerClassName="hidden min-h-screen bg-[#efefef] xl:block">
      <AppHeader active="support" showStartNavigation />
      <main className="mx-auto flex max-w-[1280px] flex-col">

        <section className="flex-1 px-8 pb-8 pt-6">
          <h1 className="text-6xl font-bold leading-none tracking-tight text-zinc-900">How to Use Rescue_Nav</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-500">
            Master the authoritative emergency navigation system. Follow this guide to ensure rapid response
            times and precision routing in high-stakes environments.
          </p>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {guideStepsDesktop.map((step, index) => (
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
            <h2 className="text-center text-4xl font-bold tracking-tight text-zinc-900">Emergency FAQ</h2>
            <p className="mt-2 text-center text-sm text-zinc-500">Authoritative answers for time-sensitive operations.</p>
            <SupportFaqAccordion items={faqItems} className="mt-4 overflow-hidden rounded-lg border border-zinc-200" />
          </section>

          <section className="mt-10 rounded-2xl bg-gradient-to-r from-[#122031] via-[#1f2235] to-[#2a1f30] px-8 py-8 text-white shadow-sm">
            <h3 className="text-center text-5xl font-bold leading-none tracking-tight">Ready to Deploy?</h3>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-300">
              Your configuration is saved and ready for activation. Return to the dashboard to begin your mission setup.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link to="/dashboard?view=history">
                <CtaButton className="px-6 py-3 text-sm uppercase tracking-wide">Back to Dashboard</CtaButton>
              </Link>
              <CtaButton
                variant="neutral"
                className="bg-white/10 px-6 py-3 text-sm uppercase tracking-wide text-zinc-100 hover:bg-white/20"
              >
                Download Offline PDF
              </CtaButton>
            </div>
          </section>
        </section>

        <footer className="border-t border-zinc-200 px-8 py-5 text-xs font-semibold text-zinc-400">
          <div className="flex items-center justify-between">
            <p>© 2026 Rescue_Nav. Authoritative Guardian Systems.</p>
            <div className="flex items-center gap-5">
              <span>Privacy Protocol</span>
              <span>Tactical Terms</span>
              <span>System Status</span>
            </div>
          </div>
        </footer>
      </main>
    </PageShell>
  )
}

function TabletSupportView() {
  return (
    <PageShell outerClassName="hidden min-h-screen bg-[#efefef] md:block xl:hidden">
      <AppHeader active="support" showStartNavigation />
      <main className="mx-auto max-w-[1280px] px-6 pb-8 pt-5">
          <div className="mb-2 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-500">Protocol v2.4</span>
            <span>Updated 2 hours ago</span>
          </div>
          <h1 className="text-6xl font-bold leading-none tracking-tight text-zinc-900">How to Use Rescue_Nav</h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-zinc-500">
            Master the authoritative rescue interface to maximize efficiency in critical situations.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {guideStepsTablet.map((step) => (
              <GuideWorkflowCard
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                icon={step.icon}
                accent={step.accent}
                previewTone={step.previewTone}
              />
            ))}
          </div>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Emergency FAQ</h2>
              <button className="text-xs font-bold uppercase tracking-wide text-red-500">View All Questions</button>
            </div>
            <SupportFaqAccordion items={faqItems} className="overflow-hidden rounded-lg border border-zinc-200" />
          </section>

          <section className="mt-8 rounded-2xl bg-gradient-to-r from-[#121f30] via-[#171e31] to-[#261c2e] px-8 py-8 text-white shadow-sm">
            <h3 className="text-center text-5xl font-bold leading-none tracking-tight">Ready to Deploy?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-300">
              Your configuration is saved and ready for activation. Return to the dashboard to begin your mission setup.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link to="/dashboard?view=history">
                <CtaButton className="px-6 py-3 text-sm uppercase tracking-wide">Back to Dashboard</CtaButton>
              </Link>
              <CtaButton
                variant="neutral"
                className="bg-white/10 px-6 py-3 text-sm uppercase tracking-wide text-zinc-100 hover:bg-white/20"
              >
                Download Offline PDF
              </CtaButton>
            </div>
          </section>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-5 text-xs font-semibold text-zinc-400">
        <div className="flex items-center justify-between">
          <p>© 2026 Rescue_Nav. Authoritative Guardian Systems.</p>
          <div className="flex items-center gap-5">
            <span>Privacy Protocol</span>
            <span>Tactical Terms</span>
            <span>System Status</span>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}

function MobileSupportView() {
  return (
    <PageShell outerClassName="min-h-screen bg-[#f2f2f2] md:hidden">
      <AppHeader active="support" showStartNavigation />

      <main className="px-5 pt-5">
        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
          Guide Center
        </span>
        <h1 className="mt-2 text-6xl font-bold leading-none tracking-tight text-zinc-900">How to Use Rescue_Nav</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Master the interface designed for life-critical navigation and emergency response coordination.
        </p>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-0.5 w-5 bg-red-500" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Execution Workflow</h2>
          </div>

          <div className="space-y-3">
            {mobileWorkflowItems.map((item) => (
              <article key={item.step} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="border-l-2 border-red-400 pl-3">
                  <p className="text-3xl font-bold leading-none text-zinc-300">{item.step}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-0.5 w-5 bg-red-500" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Interface Overview</h2>
          </div>

          <article className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="h-48 rounded bg-gradient-to-br from-[#315c3a] to-[#7ea5a5]" />
            <div className="mt-2 flex items-center justify-between rounded bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-600">
              <span>Zone Alpha-6 Status</span>
              <span>+ +</span>
            </div>
          </article>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <article className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-3xl font-bold text-zinc-900">4.2 m</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Response Velocity</p>
            </article>
            <article className="rounded-lg border border-red-200 bg-red-600 p-3 text-white">
              <p className="text-3xl font-bold">0.8 s</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-100">Target Distance</p>
            </article>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-0.5 w-5 bg-red-500" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Emergency FAQ</h2>
          </div>

          <SupportFaqAccordion
            items={faqItems}
            initialOpenIndex={null}
            className="overflow-hidden rounded-lg border border-zinc-200"
          />
        </section>

        <CtaButton className="mt-6 w-full px-4 py-3 text-sm uppercase tracking-wide shadow-[0_10px_18px_rgba(220,38,38,0.28)]">
          Start Rescue
        </CtaButton>

        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Ready · v4.2.0</p>
      </main>

    </PageShell>
  )
}

export default function SupportPage() {
  return (
    <>
      <MobileSupportView />
      <TabletSupportView />
      <DesktopSupportView />
    </>
  )
}
