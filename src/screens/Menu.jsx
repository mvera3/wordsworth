import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel, Button } from '../components/ui.jsx'
import { persistenceMode } from '../game/persistence.js'
import {
  IconGrid,
  IconHeart,
  IconSpark,
  IconBriefcase,
  IconBook,
  IconCoins,
  IconJournal,
  IconTarget,
  IconBox,
} from '../components/Icons.jsx'

const LINKS = [
  { id: 'overview', label: 'Dashboard', icon: <IconGrid size={18} /> },
  { id: 'lifepath', label: 'Life Path', icon: <IconTarget size={18} /> },
  { id: 'world', label: 'Relationships', icon: <IconHeart size={18} /> },
  { id: 'skills', label: 'Skills', icon: <IconSpark size={18} /> },
  { id: 'phone', label: 'Phone', icon: <IconBook size={18} /> },
  { id: 'career', label: 'Career & Study', icon: <IconBriefcase size={18} /> },
  { id: 'schedule', label: 'Schedule', icon: <IconJournal size={18} /> },
  { id: 'shop', label: 'Shop', icon: <IconCoins size={18} /> },
  { id: 'journal', label: 'Events Log', icon: <IconJournal size={18} /> },
  { id: 'goals', label: 'Goals', icon: <IconTarget size={18} /> },
  { id: 'achievements', label: 'Achievements', icon: <IconSpark size={18} /> },
]

function NavTile({ link, onClick }) {
  return (
    <Card className="p-3.5" onClick={onClick}>
      <div className="flex items-center gap-2.5">
        <span className="text-accent-2 shrink-0">{link.icon}</span>
        <span className="text-[13.5px] text-text-hi font-medium truncate">{link.label}</span>
      </div>
    </Card>
  )
}

function AssetList({ items, empty }) {
  if (!items || items.length === 0) return <p className="text-[12.5px] text-text-dim text-center py-3">{empty}</p>
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2 rounded-xl bg-bg-panel-2 border border-stroke px-3 py-2.5">
          <IconBox size={15} className="text-accent-2 shrink-0" />
          <span className="text-[12.5px] text-text-mid truncate">{it.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function Menu() {
  const { state, dispatch, go } = useGame()
  const { sim, inventory } = state.game

  const newGame = () => { if (confirm('Start a new life? Your current sim will be replaced.')) go('create') }
  const deleteSave = () => { if (confirm('Delete your saved game permanently?')) dispatch({ type: 'DELETE_SAVE' }) }

  return (
    <Screen>
      <ScreenHeader title="Menu" subtitle="Everything, in one place" left={<BackButton onClick={() => go('home')} />} />

      <SectionLabel>Navigate</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {LINKS.map((l) => (
          <NavTile key={l.id} link={l} onClick={() => go(l.id)} />
        ))}
      </div>

      <SectionLabel>Properties</SectionLabel>
      <Card className="p-4 mb-5"><AssetList items={sim.properties} empty="No properties owned." /></Card>

      <SectionLabel>Vehicles</SectionLabel>
      <Card className="p-4 mb-5"><AssetList items={sim.vehicles} empty="No vehicles owned." /></Card>

      <SectionLabel>Inventory</SectionLabel>
      <Card className="p-4 mb-6"><AssetList items={inventory} empty="Nothing yet." /></Card>

      <SectionLabel>Settings</SectionLabel>
      <Card className="p-4 space-y-2">
        <p className="text-[11.5px] text-text-dim">Storage: {persistenceMode}</p>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="subtle" onClick={() => dispatch({ type: 'SAVE' })}>Save</Button>
          <Button size="sm" variant="outline" onClick={newGame}>New life</Button>
          <Button size="sm" variant="danger" onClick={deleteSave}>Delete</Button>
        </div>
      </Card>

      <p className="text-[11px] text-text-dim text-center mt-5">
        Wordsworth · Arcanoire Studio · Living as {sim.firstName} {sim.lastName}
      </p>
    </Screen>
  )
}
