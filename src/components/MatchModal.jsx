import { useGame } from '../game/GameContext.jsx'
import { Modal, ModalLabel, Avatar, StatusBar, Button } from './ui.jsx'
import { genderMeta, lifeSummary, formatHeight } from '../game/names.js'
import { IconUsers } from './Icons.jsx'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// Pops when the dating app finds a match (the clock is paused). Shows a detailed
// profile of the matched person; the player decides whether to pursue it.
export default function MatchModal() {
  const { state, dispatch } = useGame()
  const npc = state.game?.pendingMatch
  if (!npc) return null

  const g = genderMeta(npc.gender)
  const a = npc.appearance || {}
  const edu = npc.education || { level: 'Unknown' }
  const degree = edu.field ? `${edu.level} · ${edu.field}` : edu.level
  const work =
    npc.employment === 'Employed'
      ? npc.jobTitle
        ? `${npc.jobTitle}${npc.trackName ? ` · ${npc.trackName}` : ''}`
        : 'Employed'
      : npc.employment

  return (
    <Modal accent="gold">
      <ModalLabel accent="gold" icon={<IconUsers size={16} />}>It’s a match!</ModalLabel>

      <div className="flex items-center gap-3.5 mb-4">
        <Avatar name={npc.name} size={58} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[19px] text-text-hi font-semibold truncate">{npc.name}</h3>
            <span className="text-[13px] text-accent-2 shrink-0" title={g.label}>{g.symbol}</span>
          </div>
          <p className="text-[12px] text-text-mid truncate">{npc.age} y/o · {g.label}</p>
          {a.seeking && <p className="text-[11.5px] text-gold mt-0.5 truncate">Looking for {a.seeking}</p>}
        </div>
      </div>

      {/* Appearance */}
      <dl className="space-y-2.5 text-[13px] mb-4">
        {a.ethnicity && <Row k="Ethnicity" v={a.ethnicity} />}
        {a.hair && <Row k="Hair" v={`${cap(a.hair)}, ${a.hairStyle}`} />}
        {a.eyes && <Row k="Eyes" v={`${cap(a.eyes)}`} />}
        {a.heightCm && <Row k="Height" v={formatHeight(a.heightCm)} />}
        {a.build && <Row k="Build" v={cap(a.build)} />}
        {a.personality && <Row k="Vibe" v={cap(a.personality)} />}
        {a.interests?.length > 0 && <Row k="Into" v={a.interests.join(', ')} />}
      </dl>

      {/* Life */}
      <dl className="space-y-2.5 text-[13px] mb-4">
        <Row k="Work" v={work} />
        <Row k="Education" v={degree} />
      </dl>

      <div className="mb-4">
        <StatusBar label="Initial spark" value={npc.romance} tone="gold" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button full onClick={() => dispatch({ type: 'RESOLVE_MATCH', keep: true })}>Pursue it</Button>
        <Button full variant="outline" onClick={() => dispatch({ type: 'RESOLVE_MATCH', keep: false })}>Not interested</Button>
      </div>
    </Modal>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex gap-3">
      <dt className="text-text-dim w-20 shrink-0">{k}</dt>
      <dd className="text-text-hi flex-1 min-w-0 break-words">{v}</dd>
    </div>
  )
}
