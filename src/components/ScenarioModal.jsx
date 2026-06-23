import { useGame } from '../game/GameContext.jsx'
import { Modal, ModalLabel, Button } from './ui.jsx'
import { IconSpark } from './Icons.jsx'

// Decision prompt. Appears (and pauses the clock) when a scenario with choices
// fires; resolving it resumes time.
const LOCATION_LABELS = { home: 'Home', work: 'Work', school: 'School', outside: 'Out & About' }
const CATEGORY_LABELS = { mundane: 'Routine', social: 'Social', rare: 'Opportunity', chaos: 'High-Impact' }

export default function ScenarioModal() {
  const { state, dispatch } = useGame()
  const sc = state.game?.pendingScenario
  if (!sc) return null

  const place = LOCATION_LABELS[sc.locationKey] || 'Home'
  const when = sc.scheduleLabel || sc.block || ''

  return (
    <Modal>
      <ModalLabel icon={<IconSpark size={16} />}>A moment unfolds</ModalLabel>
      <div className="mb-3 rounded-lg bg-bg-panel-2 border border-stroke px-3 py-2">
        <p className="text-[11px] font-medium text-text-mid tracking-wide">
          LOCATION: <span className="text-text-hi">{place}</span>
          {when && <> · TIME: <span className="text-text-hi">{when}</span></>}
        </p>
        {sc.seed != null && (
          <p className="text-[11px] text-text-dim tnum mt-0.5">
            Scenario Roll #{sc.seed}
            {sc.category && <span className="text-accent-2"> · {CATEGORY_LABELS[sc.category] || sc.category}</span>}
          </p>
        )}
      </div>
      <p className="text-[15px] text-text-hi leading-snug mb-4">{sc.text}</p>
      <div className="space-y-2">
        {sc.choices.map((c, i) => (
          <Button
            key={i}
            full
            variant="subtle"
            className="justify-start font-medium"
            onClick={() => dispatch({ type: 'RESOLVE_SCENARIO', choiceIndex: i })}
          >
            {c.label}
          </Button>
        ))}
      </div>
    </Modal>
  )
}
