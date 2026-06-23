import { useEffect } from 'react'
import { useGame } from './GameContext.jsx'

// Drives the game clock: while the game is running (and no scenario is waiting),
// dispatch a TICK every 500ms. Mounted once at the app root.
export function useGameClock() {
  const { state, dispatch } = useGame()
  const running = state.game?.running && !state.game?.pendingScenario

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 500)
    return () => clearInterval(id)
  }, [running, dispatch])
}
