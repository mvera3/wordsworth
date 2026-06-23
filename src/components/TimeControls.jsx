import { useGame } from '../game/GameContext.jsx'
import { fmtClock, dayOfWeekOf } from '../game/engine.js'

// Pause / play + speed control that replaces the old turn buttons. Shows the
// live 24h clock and current date.
function PlayIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
function PauseIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

export default function TimeControls() {
  const { state, dispatch } = useGame()
  const { sim, running, speed } = state.game

  const toggle = () => dispatch({ type: 'SET_RUNNING', running: !running })
  const setSpeed = (s) => dispatch({ type: 'SET_SPEED', speed: s })

  return (
    <div className="glass border border-stroke rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={running ? 'Pause time' : 'Resume time'}
          className={[
            'h-12 w-12 shrink-0 rounded-xl flex items-center justify-center transition-colors',
            running ? 'bg-bg-panel-2 text-accent-2 border border-stroke' : 'bg-accent text-white shadow-glow',
          ].join(' ')}
        >
          {running ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-bold text-text-hi tnum leading-none">
              {fmtClock(sim.timeMin)}
            </span>
            <span className="text-[11.5px] text-text-dim">{sim.timeBlock}</span>
          </div>
          <div className="text-[11.5px] text-text-dim tnum mt-1">
            {dayOfWeekOf(sim.totalDays || 0)} · {sim.season} · Yr {sim.year} · Age {sim.age}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={[
                'h-8 w-8 rounded-lg text-[12px] font-semibold tnum transition-colors',
                running && speed === s
                  ? 'bg-accent text-white'
                  : 'bg-bg-panel-2 text-text-mid border border-stroke hover:text-text-hi',
              ].join(' ')}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
      {!running && (
        <p className="text-[11px] text-text-dim text-center mt-2">Time is paused — press play to live.</p>
      )}
    </div>
  )
}
