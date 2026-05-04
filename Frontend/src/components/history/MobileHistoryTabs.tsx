import BottomTabNav from '../shared/BottomTabNav'

const tabs = [
  { label: '출동', active: false },
  { label: '이력', active: true },
  { label: '안내', active: false },
]

export default function MobileHistoryTabs() {
  return (
    <BottomTabNav
      items={tabs}
      className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white px-5 py-3 md:hidden"
      inactiveItemClassName="text-slate-300"
    />
  )
}
