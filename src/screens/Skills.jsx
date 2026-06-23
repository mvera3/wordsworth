import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel } from '../components/ui.jsx'
import { SKILL_CATEGORIES } from '../game/data.js'

function SkillRow({ name, skill }) {
  const s = skill || { level: 1, xp: 0 }
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <span className="text-[13px] text-text-mid truncate">
          {name} <span className="text-text-dim">· Lvl {s.level}</span>
        </span>
        <span className="text-[12px] text-text-dim tnum shrink-0">{s.xp}/100</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-panel-2 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${s.xp}%`, background: 'linear-gradient(90deg,#5B6CFF,#8A7CFF)' }} />
      </div>
    </div>
  )
}

export default function Skills() {
  const { state, go } = useGame()
  const { sim } = state.game

  return (
    <Screen>
      <ScreenHeader title="Skills" subtitle="Grow through practice" left={<BackButton onClick={() => go('menu')} />} />
      {Object.entries(SKILL_CATEGORIES).map(([cat, list]) => (
        <div key={cat} className="mb-5">
          <SectionLabel>{cat}</SectionLabel>
          <Card className="p-4 space-y-3">
            {list.map((name) => (
              <SkillRow key={name} name={name} skill={sim.skills[name]} />
            ))}
          </Card>
        </div>
      ))}
    </Screen>
  )
}
