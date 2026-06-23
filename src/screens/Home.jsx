import { useGame } from '../game/GameContext.jsx'
import { relTime } from '../game/engine.js'
import { Screen, ScreenHeader, IconButton, Card, StatusBar, SectionLabel, Avatar } from '../components/ui.jsx'
import TimeControls from '../components/TimeControls.jsx'
import {
  IconMenu,
  IconUsers,
  IconHeart,
  IconBriefcase,
  IconCoins,
  IconSpark,
  IconArrowRight,
} from '../components/Icons.jsx'

// Self-care actions: each consumes game-time and restores needs.
const ACTIONS = [
  { key: 'eat', label: 'Eat', minutes: 45, location: 'home', tag: '+ Hunger', text: 'Sat down for a proper meal.', effects: { 'needs.hunger': 42, 'needs.comfort': 6, cash: -12 } },
  { key: 'sleep', label: 'Sleep', minutes: 480, location: 'home', tag: '+ Energy', text: 'Slept through the night.', effects: { 'needs.energy': 75, 'needs.comfort': 12, 'needs.hygiene': -6, 'needs.bladder': -20 } },
  { key: 'wash', label: 'Wash', minutes: 30, location: 'home', tag: '+ Hygiene', text: 'Showered and freshened up.', effects: { 'needs.hygiene': 55, 'needs.comfort': 6 } },
  { key: 'relax', label: 'Relax', minutes: 90, location: 'home', tag: '+ Fun', text: 'Took some time to unwind.', effects: { 'needs.fun': 28, 'needs.comfort': 14, 'needs.energy': 8 } },
]

function QuickStat({ icon, label, value, tint, onClick }) {
  return (
    <Card className="p-3.5" onClick={onClick}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`shrink-0 ${tint}`}>{icon}</span>
        <span className="text-[12px] text-text-mid font-medium truncate">{label}</span>
      </div>
      <div className="text-[13.5px] text-text-hi font-semibold leading-snug line-clamp-2">{value}</div>
    </Card>
  )
}

function EventRow({ evt, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-3 py-2.5 text-left rounded-lg px-1 hover:bg-bg-panel-2/40 transition-colors"
    >
      <div className="mt-0.5 h-7 w-7 rounded-lg bg-bg-panel-2 border border-stroke flex items-center justify-center text-accent-2 shrink-0">
        <IconSpark size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-text-hi leading-snug">{evt.text}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {evt.tag && <span className="text-[11px] text-accent-2 font-medium truncate">{evt.tag}</span>}
          <span className="text-[11px] text-text-dim tnum shrink-0">{relTime(evt.timestamp)}</span>
        </div>
      </div>
      <IconArrowRight size={14} className="text-text-dim/60 shrink-0 mt-1.5" />
    </button>
  )
}

export default function Home() {
  const { state, dispatch, go } = useGame()
  const { sim, events, npcs } = state.game
  const currency = sim.currency || '$'

  const activeRel = npcs.filter((n) => n.friendship >= 30 || n.romance >= 30).length
  const careerLabel = sim.job ? `${sim.profession} · Lvl ${sim.job.levelIndex + 1}` : 'Unemployed'

  // Feature the sim's strongest skill on the Home card.
  const topSkill = Object.entries(sim.skills).reduce(
    (best, [name, s]) => (s.level > best.level || (s.level === best.level && s.xp > best.xp) ? { name, ...s } : best),
    { name: '—', level: 0, xp: 0 },
  )

  const doAction = (a) =>
    dispatch({ type: 'DO_ACTION', minutes: a.minutes, tag: a.tag, text: a.text, effects: a.effects })

  return (
    <Screen>
      <ScreenHeader
        large
        title="Wordsworth"
        subtitle="A life in words"
        left={<IconButton icon={<IconMenu size={22} />} label="Menu" onClick={() => go('menu')} />}
        right={<IconButton icon={<IconUsers size={21} />} label="People" onClick={() => go('world')} />}
      />

      <div className="mb-4">
        <TimeControls />
      </div>

      <Card className="p-4 mb-4" onClick={() => go('overview')}>
        <div className="flex items-center gap-3.5">
          <Avatar name={`${sim.firstName} ${sim.lastName}`} size={52} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-[17px] font-semibold text-text-hi truncate">
                {sim.firstName} {sim.lastName}
              </h2>
              <IconArrowRight size={16} className="text-text-dim shrink-0" />
            </div>
            <p className="text-[12px] text-text-mid truncate">
              {sim.age} y/o · {sim.profession}
            </p>
          </div>
        </div>
        <div className="mt-3.5">
          <StatusBar label="Happiness" value={sim.meters.happiness} />
        </div>
      </Card>

      <SectionLabel>Quick Actions</SectionLabel>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => doAction(a)}
            className="glass border border-stroke rounded-xl py-2.5 text-[12.5px] text-text-hi font-medium hover:border-accent-2/60 active:bg-bg-panel-2/60 transition-colors truncate"
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <QuickStat icon={<IconSpark size={16} />} tint="text-accent-2" label="Skills" value={`${topSkill.name} · Lvl ${topSkill.level}`} onClick={() => go('skills')} />
        <QuickStat icon={<IconHeart size={16} />} tint="text-accent-2" label="Relationships" value={`${activeRel} Active`} onClick={() => go('world')} />
        <QuickStat icon={<IconBriefcase size={16} />} tint="text-accent" label="Career" value={careerLabel} onClick={() => go('career')} />
        <QuickStat icon={<IconCoins size={16} />} tint="text-gold" label="Finance" value={`${currency}${sim.cash.toLocaleString()}`} onClick={() => go('menu')} />
      </div>

      <SectionLabel action="View all" onAction={() => go('journal')}>
        Latest Events
      </SectionLabel>
      <Card className="px-3 py-1.5 divide-y divide-stroke/60">
        {events.slice(0, 4).map((evt) => (
          <EventRow key={evt.id} evt={evt} onClick={() => go('journal', evt.id)} />
        ))}
        {events.length === 0 && (
          <p className="text-[13px] text-text-dim py-4 text-center">No events yet — let time run.</p>
        )}
      </Card>
    </Screen>
  )
}
