import { useGame, hasSave } from '../game/GameContext.jsx'
import { Modal, ModalLabel, Button } from './ui.jsx'
import { IconSpark } from './Icons.jsx'

// Shown when the sim's health reaches zero. The run is over — the player loads
// their last (living) save or starts a brand-new life. No backdrop close: a
// choice must be made.
export default function GameOverModal() {
  const { state, dispatch, go } = useGame()
  const game = state.game
  if (!game?.gameOver) return null

  const name = `${game.sim.firstName || ''} ${game.sim.lastName || ''}`.trim() || 'Your sim'
  const canLoad = hasSave()

  return (
    <Modal accent="danger">
      <ModalLabel accent="danger" icon={<IconSpark size={16} />}>Game Over</ModalLabel>
      <h2 className="font-display text-[20px] text-text-hi font-bold mb-1">{name} has died.</h2>
      <p className="text-[13px] text-text-mid leading-snug mb-5">
        Their health reached zero and their story has come to an end. What now?
      </p>
      <div className="space-y-2">
        <Button full size="lg" disabled={!canLoad} onClick={() => dispatch({ type: 'CONTINUE_SAVE' })}>
          {canLoad ? 'Load last save' : 'No save to load'}
        </Button>
        <Button full size="lg" variant="subtle" onClick={() => go('create')}>
          Start a new life
        </Button>
      </div>
    </Modal>
  )
}
