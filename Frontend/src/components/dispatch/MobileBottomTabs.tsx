import BottomTabNav from '../shared/BottomTabNav'

const tabs = [
  { label: 'Dispatch', active: true },
  { label: 'History', active: false },
  { label: 'Support', active: false },
]

export default function MobileBottomTabs() {
  return (
    <BottomTabNav
      items={tabs}
      className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 bg-white px-5 py-3"
      inactiveItemClassName="text-slate-300"
    />
  )
}
