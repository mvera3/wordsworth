import { IconHome, IconGlobe, IconJournal, IconTarget, IconGrid } from './Icons.jsx'

const ITEMS = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'world', label: 'World', Icon: IconGlobe },
  { id: 'journal', label: 'Journal', Icon: IconJournal },
  { id: 'goals', label: 'Goals', Icon: IconTarget },
  { id: 'menu', label: 'Menu', Icon: IconGrid },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="shrink-0 glass border-t border-stroke px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <ul className="flex items-stretch justify-between">
        {ITEMS.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onNavigate(id)}
                aria-current={on ? 'page' : undefined}
                className={[
                  'w-full flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors',
                  on ? 'text-accent-2' : 'text-text-dim hover:text-text-mid',
                ].join(' ')}
              >
                <Icon size={21} />
                <span className="text-[10.5px] font-medium">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
