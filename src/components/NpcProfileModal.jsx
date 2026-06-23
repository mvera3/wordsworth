import { useGame } from '../game/GameContext.jsx'
import { Modal, Avatar, StatusBar, Button } from './ui.jsx'
import { genderMeta, lifeSummary, formatHeight } from '../game/names.js'
import { relationshipMood, NEGATIVE_MOODS } from '../game/engine.js'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// Tapping a person opens this profile: looks, gender, age, education/degree,
// employment status + job, mood, and current relationship standing.
export default function NpcProfileModal({ npc, onClose, onInteract, onGift }) {
  const { state } = useGame()
  if (!npc) return null
  const g = genderMeta(npc.gender)
  const a = npc.appearance
  const edu = npc.education || { level: 'Unknown' }
  const degree = edu.field ? `${edu.level} · ${edu.field}` : edu.level
  // Mood is derived live from how long since you last spent time together.
  const mood = relationshipMood(npc, state.game?.sim?.totalDays || 0)
  const moodSour = NEGATIVE_MOODS.has(mood)

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3.5 mb-4">
        <Avatar name={npc.name} size={56} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[18px] text-text-hi font-semibold truncate">{npc.name}</h3>
            <span className="text-[13px] text-accent-2 shrink-0" title={g.label}>{g.symbol}</span>
          </div>
          <p className="text-[12px] text-text-mid truncate">{npc.age} y/o · {g.label}</p>
          <p className="text-[11.5px] mt-0.5 truncate">
            <span className="text-text-dim">Mood: </span>
            <span className={moodSour ? 'text-[#ff9aa6] font-medium' : 'text-accent-2 font-medium'}>{mood}</span>
            {npc.wantsAttention && <span className="text-gold"> · wants your attention</span>}
          </p>
        </div>
      </div>

      {a && (
        <dl className="space-y-2.5 text-[13px] mb-4">
          {a.ethnicity && <Row k="Ethnicity" v={a.ethnicity} />}
          {a.hair && <Row k="Hair" v={`${cap(a.hair)}, ${a.hairStyle}`} />}
          {a.eyes && <Row k="Eyes" v={cap(a.eyes)} />}
          {a.heightCm && <Row k="Height" v={formatHeight(a.heightCm)} />}
          {a.build && <Row k="Build" v={cap(a.build)} />}
          {a.interests?.length > 0 && <Row k="Into" v={a.interests.join(', ')} />}
        </dl>
      )}

      <dl className="space-y-2.5 text-[13px] mb-4">
        <Row k="Status" v={lifeSummary(npc)} />
        <Row k="Employment" v={npc.employment} />
        {npc.jobTitle && <Row k="Job" v={`${npc.jobTitle}${npc.trackName ? ` · ${npc.trackName}` : ''}`} />}
        <Row k="Education" v={degree} />
      </dl>

      <div className="space-y-2.5 mb-4">
        <StatusBar label="Friendship" value={npc.friendship} />
        <StatusBar label="Romance" value={npc.romance} tone="gold" />
        <p className="text-[11.5px] text-text-dim">Standing: {npc.status}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button full onClick={() => onInteract(npc)}>Spend time</Button>
        {onGift ? (
          <Button full variant="subtle" onClick={() => onGift(npc)}>Give gift</Button>
        ) : (
          <Button full variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>
    </Modal>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex gap-3">
      <dt className="text-text-dim w-24 shrink-0">{k}</dt>
      <dd className="text-text-hi flex-1 min-w-0 break-words">{v}</dd>
    </div>
  )
}
