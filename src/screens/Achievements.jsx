import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel } from '../components/ui.jsx'
import { ACHIEVEMENTS } from '../game/achievements.js'

export default function Achievements() {
  const { state, go } = useGame()
  const earned = new Set(state.game.sim.achievements || [])
  const got = ACHIEVEMENTS.filter((a) => earned.has(a.id))
  const left = ACHIEVEMENTS.filter((a) => !earned.has(a.id))

  const Row = ({ a, on }) => (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-[15px] ${on ? 'bg-gold/20 border border-gold/40 text-gold' : 'bg-bg-panel-2 border border-stroke text-text-dim'}`}>
        {on ? '★' : '☆'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] font-semibold ${on ? 'text-text-hi' : 'text-text-mid'}`}>{a.name}</p>
        <p className="text-[12px] text-text-dim leading-snug">{a.desc}</p>
      </div>
    </div>
  )

  return (
    <Screen>
      <ScreenHeader
        title="Achievements"
        subtitle={`${got.length}/${ACHIEVEMENTS.length} unlocked`}
        left={<BackButton onClick={() => go('menu')} />}
      />
      {got.length > 0 && (
        <>
          <SectionLabel>Unlocked</SectionLabel>
          <Card className="px-4 py-1 divide-y divide-stroke/60 mb-5">
            {got.map((a) => <Row key={a.id} a={a} on />)}
          </Card>
        </>
      )}
      <SectionLabel>Locked</SectionLabel>
      <Card className="px-4 py-1 divide-y divide-stroke/60">
        {left.map((a) => <Row key={a.id} a={a} on={false} />)}
        {left.length === 0 && <p className="text-[13px] text-text-dim py-6 text-center">Everything unlocked. Legendary.</p>}
      </Card>
    </Screen>
  )
}
