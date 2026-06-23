import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import {
  Screen,
  ScreenHeader,
  BackButton,
  Card,
  SectionLabel,
  Avatar,
  Button,
  Modal,
  ModalLabel,
} from '../components/ui.jsx'
import NpcProfileModal from '../components/NpcProfileModal.jsx'
import { LOCATIONS } from '../game/data.js'
import { genderMeta, lifeSummary } from '../game/names.js'
import { lifePaths } from '../game/morality.js'
import { isOnSchedule, SCHOOL_SCHEDULE, DEFAULT_SHIFT } from '../game/scheduling.js'
import { IconArrowRight, IconUsers, IconBriefcase } from '../components/Icons.jsx'

// Each location maps to a player action: a log line, time cost, + an effects map.
const LOCATION_ACTIONS = {
  home: { minutes: 120, location: 'home', text: 'Rested and wrote at home.', tag: '+ Comfort', effects: { 'needs.comfort': 16, 'needs.energy': 10, 'skill:Writing': 8 } },
  park: { minutes: 90, location: 'outside', text: 'Walked through the park and cleared your head.', tag: '+ Mood', effects: { 'needs.fun': 14, 'meters.happiness': 8, 'meters.health': 6, 'needs.energy': -4 } },
  gym: { minutes: 120, location: 'outside', text: 'Pushed through a solid workout.', tag: '+ Health', effects: { 'needs.energy': -14, 'meters.health': 12, 'skill:Fitness': 18, 'needs.hygiene': -10 } },
  cafe: { minutes: 90, location: 'outside', text: 'Worked from the cafe over a coffee.', tag: '+ Social', effects: { 'needs.social': 12, 'needs.fun': 8, 'skill:Writing': 10, cash: -6 } },
  library: { minutes: 180, location: 'outside', text: 'Studied quietly at the library.', tag: '+ Logic', effects: { 'skill:Logic': 16, 'skill:Writing': 8, 'needs.fun': -4, 'meters.creativity': 5 } },
  oddjob: { minutes: 240, location: 'outside', text: 'Picked up some quick cash with an odd job.', tag: '+ Money', effects: { cash: 60, 'needs.energy': -16, 'needs.social': 4 } },
}

const SKIP_PENALTY = { performance: -12, 'meters.happiness': -4 }

function PersonRow({ npc, onOpen }) {
  const g = genderMeta(npc.gender)
  return (
    <Card className="p-3 flex items-center gap-3" onClick={() => onOpen(npc)}>
      <Avatar name={npc.name} size={42} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] text-text-hi font-semibold truncate">{npc.name}</h3>
          <span className="text-[12px] text-accent-2 shrink-0" title={g.label}>{g.symbol}</span>
        </div>
        <p className="text-[11.5px] text-text-mid truncate">
          {npc.age} y/o · {lifeSummary(npc)}
        </p>
      </div>
      <span className="text-[10.5px] text-accent-2 font-medium shrink-0 max-w-[72px] truncate">{npc.status}</span>
      <IconArrowRight size={15} className="text-text-dim shrink-0" />
    </Card>
  )
}

export default function World() {
  const { state, dispatch, go } = useGame()
  const { sim, npcs, meta, dating } = state.game
  const [selectedId, setSelectedId] = useState(null)
  const [warnId, setWarnId] = useState(null)
  const [showAgeGate, setShowAgeGate] = useState(false)
  const [showPartnerGate, setShowPartnerGate] = useState(false)
  const selected = npcs.find((n) => n.id === selectedId) || null

  const DATING_MIN_AGE = 16
  const oldEnough = (sim.age || 0) >= DATING_MIN_AGE
  const evilPath = lifePaths(sim).current.id === 'demonic'
  const partner = npcs.find((n) => (n.romance ?? 0) >= 60) || null
  // Committed sims can't date around unless they're walking the Demonic path.
  const committed = !!partner && !evilPath
  const canDate = oldEnough && !committed

  // If you're inside a scheduled shift or school block, leaving early costs.
  const onShift = !!sim.job && isOnSchedule(sim, sim.job.schedule || DEFAULT_SHIFT) && meta?.lastWorkDay !== (sim.totalDays || 0)
  const onSchool = !!sim.education?.enrolledIn && isOnSchedule(sim, SCHOOL_SCHEDULE)
  const obligation = onShift ? 'work' : onSchool ? 'school' : null

  const doTravel = (id) => {
    const a = LOCATION_ACTIONS[id]
    if (a) dispatch({ type: 'DO_ACTION', ...a })
  }

  const travel = (id) => (obligation ? setWarnId(id) : doTravel(id))

  const leaveAnyway = () => {
    const a = LOCATION_ACTIONS[warnId]
    if (a) {
      const penalty = obligation === 'work'
        ? { ...SKIP_PENALTY }
        : { stress: 8, 'meters.happiness': -5, reputation: -2 }
      dispatch({
        type: 'DO_ACTION',
        minutes: a.minutes,
        text: `Left ${obligation} early — ${a.text.toLowerCase()}`,
        tag: '− Career',
        effects: { ...a.effects, ...penalty },
        skipWork: obligation === 'work',
      })
    }
    setWarnId(null)
  }

  const spendTime = (npc) => {
    dispatch({
      type: 'DO_ACTION',
      minutes: 90,
      seenNpc: npc.id,
      text: `Spent time with ${npc.name}.`,
      tag: '+ Relationship',
      effects: { [`npc:${npc.id}:friendship`]: 6, 'needs.social': 14, 'needs.fun': 6, 'needs.energy': -4 },
    })
    setSelectedId(null)
  }

  const giftItems = (state.game.inventory || []).filter((i) => i.gift)
  const giveGift = (npc) => {
    const g = giftItems[0]
    if (!g) return
    dispatch({ type: 'GIFT', npcId: npc.id, invId: g.id, gain: g.gift })
    setSelectedId(null)
  }

  return (
    <>
    <Screen>
      <ScreenHeader title="World" subtitle="Where to today?" left={<BackButton onClick={() => go('home')} />} />

      {obligation && (
        <div className="mb-3 rounded-xl bg-gold/10 border border-gold/40 px-3 py-2.5 flex items-center gap-2 text-[12px] text-gold">
          <IconBriefcase size={15} className="shrink-0" />
          <span className="min-w-0">
            {obligation === 'work' ? 'You’re on the clock' : 'You’re supposed to be in school'} — leaving now will cost you.
          </span>
        </div>
      )}

      <SectionLabel>Travel</SectionLabel>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {LOCATIONS.map((loc) => (
          <Card key={loc.id} className="p-4 flex items-center gap-3" onClick={() => travel(loc.id)}>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14.5px] text-text-hi font-semibold truncate">{loc.name}</h3>
              <p className="text-[12px] text-text-mid leading-snug mt-0.5">{loc.blurb}</p>
            </div>
            <IconArrowRight size={17} className="text-text-dim shrink-0" />
          </Card>
        ))}
      </div>

      <SectionLabel>Dating</SectionLabel>
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14.5px] text-text-hi font-semibold">Dating App</h3>
            <p className="text-[12px] text-text-mid leading-snug mt-0.5">
              {!oldEnough
                ? `You must be ${DATING_MIN_AGE} or older to use the dating app.`
                : committed
                  ? `You're committed to ${partner.name}. Only the Demonic path lets you keep playing the field.`
                  : dating
                    ? 'Active — $100/day. 5% chance each day to find a match.'
                    : 'Subscribe for $100/day; 5% chance daily to match with someone.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dating}
            aria-disabled={!canDate && !dating}
            aria-label="Toggle dating app"
            onClick={() => {
              if (dating) return dispatch({ type: 'TOGGLE_DATING' })
              if (!oldEnough) return setShowAgeGate(true)
              if (committed) return setShowPartnerGate(true)
              dispatch({ type: 'TOGGLE_DATING' })
            }}
            className={[
              'shrink-0 h-7 w-12 rounded-full p-0.5 transition-colors',
              dating ? 'bg-accent' : !canDate ? 'bg-bg-panel-2 border border-stroke opacity-50' : 'bg-bg-panel-2 border border-stroke',
            ].join(' ')}
          >
            <span
              className={[
                'block h-6 w-6 rounded-full bg-white shadow transition-transform',
                dating ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </div>
      </Card>

      <SectionLabel>People ({npcs.length})</SectionLabel>
      <Button full variant="ghost" className="mb-3 border-dashed border-accent-2/40" icon={<IconUsers size={16} className="text-accent-2" />} onClick={() => dispatch({ type: 'MEET_NPC' })}>
        Meet someone new
      </Button>

      <div className="space-y-2.5">
        {npcs.map((npc) => (
          <PersonRow key={npc.id} npc={npc} onOpen={(n) => setSelectedId(n.id)} />
        ))}
      </div>
    </Screen>

    <NpcProfileModal
      npc={selected}
      onClose={() => setSelectedId(null)}
      onInteract={spendTime}
      onGift={giftItems.length ? giveGift : null}
    />

    {showAgeGate && (
      <Modal accent="gold" onClose={() => setShowAgeGate(false)}>
        <ModalLabel accent="gold" icon={<IconUsers size={16} />}>Hold on</ModalLabel>
        <p className="text-[14px] text-text-hi leading-snug mb-1">
          You need to be <span className="text-gold">{DATING_MIN_AGE} or older</span> to use the dating app.
        </p>
        <p className="text-[12px] text-text-mid mb-4">
          Come back once you’ve grown up a little — there’s plenty of life to live first.
        </p>
        <Button full onClick={() => setShowAgeGate(false)}>Got it</Button>
      </Modal>
    )}

    {showPartnerGate && (
      <Modal accent="gold" onClose={() => setShowPartnerGate(false)}>
        <ModalLabel accent="gold" icon={<IconUsers size={16} />}>Already taken</ModalLabel>
        <p className="text-[14px] text-text-hi leading-snug mb-1">
          You’re committed to <span className="text-gold">{partner?.name}</span>. It wouldn’t be right to date around.
        </p>
        <p className="text-[12px] text-text-mid mb-4">
          End things first — or embrace the <span className="text-[#ff9aa6]">Demonic path</span>, where loyalty is optional.
        </p>
        <Button full onClick={() => setShowPartnerGate(false)}>Understood</Button>
      </Modal>
    )}

    {warnId && (
      <Modal accent="gold" onClose={() => setWarnId(null)}>
        <ModalLabel accent="gold" icon={<IconBriefcase size={16} />}>
          {obligation === 'work' ? 'You’re on the clock' : 'You’re in school'}
        </ModalLabel>
        {obligation === 'work' ? (
          <>
            <p className="text-[14px] text-text-hi leading-snug mb-1">
              Leaving early while you’re on the job will <span className="text-gold">decrease your experience</span> and{' '}
              <span className="text-gold">delay your promotion</span>.
            </p>
            <p className="text-[12px] text-text-mid mb-4">You’ll also miss today’s pay.</p>
          </>
        ) : (
          <p className="text-[14px] text-text-hi leading-snug mb-4">
            Leaving school early may <span className="text-gold">damage your academic performance</span> and{' '}
            <span className="text-gold">lower your grades</span>.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button full onClick={() => setWarnId(null)}>{obligation === 'work' ? 'Stay at work' : 'Stay in school'}</Button>
          <Button full variant="danger" onClick={leaveAnyway}>Leave anyway</Button>
        </div>
      </Modal>
    )}
    </>
  )
}
