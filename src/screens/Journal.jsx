import { useEffect, useRef, useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import { relTime } from '../game/engine.js'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel } from '../components/ui.jsx'
import { IconSpark } from '../components/Icons.jsx'

function LoggedEvent({ evt, highlight, innerRef }) {
  return (
    <div
      ref={innerRef}
      className={[
        'flex items-start gap-3 py-3 px-2 rounded-xl transition-colors duration-700',
        highlight ? 'bg-accent/20 ring-1 ring-accent-2' : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mt-0.5 h-7 w-7 rounded-lg bg-bg-panel-2 border border-stroke flex items-center justify-center text-accent-2 shrink-0">
        <IconSpark size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-text-hi leading-snug">{evt.text}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {evt.tag && <span className="text-[11px] text-accent-2 font-medium truncate">{evt.tag}</span>}
          {evt.seed != null && <span className="text-[11px] text-text-dim tnum shrink-0">#{evt.seed}</span>}
          <span className="text-[11px] text-text-dim tnum shrink-0">{relTime(evt.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

export default function Journal() {
  const { state, go } = useGame()
  const { journal } = state.game
  const { focusEventId, focusAt } = state
  const logged = journal.filter((e) => !e.pending)

  // Flash + scroll to the event the player tapped on Home.
  const rowRefs = useRef({})
  const [flashId, setFlashId] = useState(null)
  useEffect(() => {
    if (!focusEventId) return
    setFlashId(focusEventId)
    const el = rowRefs.current[focusEventId]
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const t = setTimeout(() => setFlashId(null), 1300)
    return () => clearTimeout(t)
  }, [focusEventId, focusAt])

  return (
    <Screen>
      <ScreenHeader
        title="Journal"
        subtitle={`${logged.length} entries`}
        left={<BackButton onClick={() => go('home')} />}
      />

      <SectionLabel>History</SectionLabel>
      <Card className="px-3 py-1 divide-y divide-stroke/60">
        {logged.map((e) => (
          <LoggedEvent
            key={e.id}
            evt={e}
            highlight={flashId === e.id}
            innerRef={(el) => (rowRefs.current[e.id] = el)}
          />
        ))}
        {logged.length === 0 && (
          <p className="text-[13px] text-text-dim py-6 text-center">Your story starts now.</p>
        )}
      </Card>
    </Screen>
  )
}
