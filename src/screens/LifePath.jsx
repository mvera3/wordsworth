import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel } from '../components/ui.jsx'
import { lifePaths, deriveAlignment } from '../game/morality.js'

function PathCard({ path, current }) {
  const pct = Math.max(0, Math.min(100, path.score))
  return (
    <Card className="p-4" style={current ? { borderColor: `${path.tint}66` } : undefined}>
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-[22px]">{path.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14.5px] font-semibold text-text-hi truncate">{path.name}</h3>
            {current && (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ color: path.tint, background: `${path.tint}22` }}>
                Current
              </span>
            )}
          </div>
          <p className="text-[12px] text-text-mid truncate">{path.tier}</p>
        </div>
        <span className="text-[14px] font-semibold tnum shrink-0" style={{ color: path.tint }}>{pct}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-panel-2 overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: path.tint }} />
      </div>
      <p className="text-[11.5px] text-text-dim mt-2 leading-snug">{path.desc}</p>
    </Card>
  )
}

export default function LifePath() {
  const { state, go } = useGame()
  const { sim } = state.game
  const { paths, current } = lifePaths(sim)
  const align = deriveAlignment(sim)

  return (
    <Screen>
      <ScreenHeader title="Life Path" subtitle="Where your choices lead" left={<BackButton onClick={() => go('menu')} />} />

      <Card className="p-5 mb-5 text-center" style={{ borderColor: `${current.tint}66` }}>
        <div className="text-[40px] leading-none mb-2">{current.emoji}</div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Current Path</p>
        <h2 className="font-display text-[22px] font-bold mt-1" style={{ color: current.tint }}>{current.name}</h2>
        <p className="text-[13px] text-text-mid mt-1">{current.tier}</p>
        {align && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]" style={{ borderColor: `${align.tint}66`, color: align.tint }}>
            <span>{align.emoji}</span>
            <span className="font-semibold">Ascended · {align.title}</span>
          </div>
        )}
      </Card>

      <SectionLabel>All Paths</SectionLabel>
      <div className="space-y-3">
        {paths.map((p) => (
          <PathCard key={p.id} path={p} current={p.id === current.id} />
        ))}
      </div>

      <p className="text-[11.5px] text-text-dim text-center mt-5 leading-relaxed">
        Your path is shaped by the choices you make. Reaching the peak of a path unlocks a legendary Ascension.
      </p>
    </Screen>
  )
}
