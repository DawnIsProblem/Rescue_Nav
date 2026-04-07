import BottomTabNav from '../shared/BottomTabNav'

const tabs = [
  { label: 'Dispatch', active: false },
  { label: 'History', active: false },
  { label: 'Support', active: true },
  { label: 'Settings', active: false, inactiveIcon: '*' },
]

export default function SupportMobileTabs() {
  return (
    <BottomTabNav
      items={tabs}
      className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white px-5 py-3 md:hidden"
      labelClassName="text-[10px] font-bold uppercase tracking-wide"
    />
  )
}
