import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel, StatusBar } from '../components/ui.jsx'
import { ASPIRATIONS } from '../game/data.js'
import { IconTarget } from '../components/Icons.jsx'

export default function Goals() {
  const { state, go } = useGame()
  const { sim, goals } = state.game
  const aspiration = ASPIRATIONS.find((a) => a.title === sim.aspiration)

  return (
    <Screen>
      <ScreenHeader
        title="Goals"
        subtitle="Aspiration & milestones"
        left={<BackButton onClick={() => go('home')} />}
      />

      <SectionLabel>Life Aspiration</SectionLabel>
      <Card className="p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-2 shrink-0">
            <IconTarget size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] text-text-hi font-semibold">{sim.aspiration || 'Undecided'}</h3>
            {aspiration && (
              <p className="text-[12.5px] text-text-mid leading-relaxed mt-0.5">{aspiration.desc}</p>
            )}
          </div>
        </div>
      </Card>

      <SectionLabel>Milestones</SectionLabel>
      <div className="space-y-3">
        {goals.map((g) => (
          <Card key={g.id} className="p-4">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h4 className="text-[13.5px] text-text-hi font-medium truncate">{g.title}</h4>
              {g.progress >= 100 && <span className="text-[11px] text-gold font-semibold shrink-0">Done</span>}
            </div>
            <StatusBar label="Progress" value={g.progress} gradient />
          </Card>
        ))}
        {goals.length === 0 && (
          <Card className="p-6 text-center text-[13px] text-text-dim">No milestones set.</Card>
        )}
      </div>
    </Screen>
  )
}
