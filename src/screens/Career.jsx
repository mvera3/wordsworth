import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import {
  Screen,
  ScreenHeader,
  BackButton,
  IconButton,
  Card,
  SectionLabel,
  StatusBar,
  Tabs,
  Button,
  Modal,
  ModalLabel,
} from '../components/ui.jsx'
import {
  CAREER_TRACKS,
  ILLEGAL_TRACK,
  EDU_LEVELS,
  EDU_DAYS,
  DEGREE_FIELDS,
  getTrack,
  requirementReason,
  nextEduLevel,
  fieldRequired,
} from '../game/careers.js'
import { generateOffers, fmtSchedule } from '../game/scheduling.js'
import { promotionInfo } from '../game/engine.js'
import { IconBriefcase, IconBook } from '../components/Icons.jsx'

const money = (sim, n) => `${sim.currency || '$'}${n}`

// ---- Jobs tab --------------------------------------------------------------
function CurrentJob({ sim, dispatch, go }) {
  const track = getTrack(sim.job.trackId)
  const def = track.levels[sim.job.levelIndex]
  const promo = promotionInfo(sim)

  return (
    <Card className={`p-4 ${track.illegal ? 'border-[#E05B6C]/40' : ''}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-[16px] text-text-hi font-semibold truncate">{def.title}</h3>
        <span className="text-[12px] text-gold tnum shrink-0">{money(sim, sim.job.wage ?? def.wage)}/hr</span>
      </div>
      <p className="text-[12px] text-text-mid truncate">
        {sim.job.company ? `${sim.job.company} · ` : ''}{track.name} · Lvl {sim.job.levelIndex + 1}/{track.levels.length}
      </p>
      <p className="text-[11.5px] text-text-dim mb-3 truncate">🗓 {fmtSchedule(sim.job.schedule)}</p>
      <StatusBar label="Performance" value={sim.job.performance ?? 50} />

      <div className="mt-3 rounded-xl bg-bg-panel-2/50 border border-stroke px-3 py-2 text-[12px] text-text-mid">
        🕘 Works automatically on schedule. No need to clock in.
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button full size="sm" variant="subtle" onClick={() => dispatch({ type: 'WORK' })}>Extra shift</Button>
        <Button full size="sm" variant="outline" onClick={() => go('schedule')}>Schedule</Button>
        <Button full size="sm" variant="outline" onClick={() => dispatch({ type: 'QUIT_JOB' })}>Quit</Button>
      </div>

      {promo.maxed ? (
        <p className="text-[12px] text-gold mt-3 text-center">Top of the ladder — nowhere higher to climb.</p>
      ) : promo.canPromote ? (
        <Button full variant="gradient" className="mt-3" onClick={() => dispatch({ type: 'PROMOTE' })}>
          Promote → {promo.nextDef.title}
        </Button>
      ) : (
        <div className="mt-3 rounded-xl bg-bg-panel-2/60 border border-stroke p-3 text-[12px] text-text-mid">
          <span className="text-text-dim">Next: {promo.nextDef.title}</span>
          <ul className="mt-1.5 space-y-0.5">
            <li className={promo.daysOk ? 'text-accent-2' : ''}>
              {promo.daysOk ? '✓' : '•'} {promo.nextDef.reqDays} days on the job ({promo.daysAtLevel}/{promo.nextDef.reqDays})
            </li>
            <li className={promo.perfOk ? 'text-accent-2' : ''}>
              {promo.perfOk ? '✓' : '•'} {promo.nextDef.reqPerf}% performance
            </li>
            {requirementReason(sim, promo.nextDef) && <li>• {requirementReason(sim, promo.nextDef)}</li>}
          </ul>
        </div>
      )}
    </Card>
  )
}

function TrackCard({ track, sim, onApply, lockReason }) {
  const entry = track.levels[0]
  const top = track.levels[track.levels.length - 1]
  const blocked = lockReason || requirementReason(sim, entry)
  return (
    <Card className={`p-4 ${track.illegal ? 'border-[#E05B6C]/30' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[14.5px] text-text-hi font-semibold truncate">{track.name}</h3>
        <span className="text-[11.5px] text-gold tnum shrink-0">{money(sim, entry.wage)}–{top.wage}/hr</span>
      </div>
      <p className="text-[12px] text-text-mid mt-0.5 leading-snug">{track.blurb}</p>
      <p className="text-[11px] text-text-dim mt-1.5 truncate">{track.levels.length} levels · starts as {entry.title}</p>
      <Button
        full
        size="sm"
        variant={track.illegal ? 'danger' : 'subtle'}
        disabled={!!blocked}
        className="mt-2.5"
        onClick={() => onApply(track)}
      >
        {blocked || `View openings`}
      </Button>
    </Card>
  )
}

function JobsTab({ sim, dispatch, go, onApply }) {
  const probationLeft = Math.max(0, (sim.probationUntil || 0) - (sim.totalDays || 0))
  const onProbation = probationLeft > 0
  return (
    <div className="space-y-5 animate-fade-in">
      {sim.job ? (
        <div>
          <SectionLabel>Current Job</SectionLabel>
          <CurrentJob sim={sim} dispatch={dispatch} go={go} />
        </div>
      ) : (
        <Card className="p-4 text-center text-[13px] text-text-mid">
          You’re currently <span className="text-text-hi font-medium">unemployed</span>. Pick a path below.
        </Card>
      )}

      <div>
        <SectionLabel>Career Paths</SectionLabel>
        <div className="space-y-3">
          {Object.values(CAREER_TRACKS).map((t) => (
            <TrackCard key={t.id} track={t} sim={sim} onApply={onApply} />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>The Other Path</SectionLabel>
        <p className="text-[11.5px] text-text-dim mb-2 -mt-1">
          Lucrative, but every shift has a <span className="text-[#ff9aa6]">20% chance of getting caught</span>.
          Sentences escalate: 6mo probation → 1yr → 3yr.
        </p>
        {onProbation && (
          <div className="mb-2 rounded-xl bg-[#E05B6C]/10 border border-[#E05B6C]/40 px-3 py-2 text-[12px] text-[#ff9aa6]">
            On probation for ~{probationLeft} more day{probationLeft === 1 ? '' : 's'}.
          </div>
        )}
        {sim.criminalRecord > 0 && (
          <p className="text-[11.5px] text-text-dim mb-2">Criminal record: {sim.criminalRecord} prior{sim.criminalRecord === 1 ? '' : 's'}.</p>
        )}
        <TrackCard track={ILLEGAL_TRACK} sim={sim} onApply={onApply} lockReason={onProbation ? 'On probation' : null} />
      </div>
    </div>
  )
}

// ---- Education tab ---------------------------------------------------------
function EducationTab({ sim, dispatch }) {
  const edu = sim.education
  const enr = edu.enrolledIn
  const next = nextEduLevel(edu.level)
  const [field, setField] = useState(DEGREE_FIELDS[0])
  const perDay = Math.ceil(100 / (EDU_DAYS[enr?.level] || 16))
  const daysLeft = enr ? Math.max(0, Math.ceil((100 - edu.progress) / perDay)) : 0

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <SectionLabel>Your Education</SectionLabel>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] text-text-hi font-semibold truncate">{edu.level}</span>
            {edu.field && <span className="text-[12px] text-accent-2 shrink-0 truncate">{edu.field}</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EDU_LEVELS.slice(1).map((l) => {
              const done = EDU_LEVELS.indexOf(l) <= EDU_LEVELS.indexOf(edu.level)
              return (
                <span key={l} className={['px-2 py-0.5 rounded-full text-[10.5px] border', done ? 'border-accent/50 text-accent-2 bg-accent/10' : 'border-stroke text-text-dim'].join(' ')}>
                  {l}
                </span>
              )
            })}
          </div>
        </Card>
      </div>

      {enr ? (
        <div>
          <SectionLabel>Enrolled</SectionLabel>
          <Card className="p-4">
            <h3 className="text-[14.5px] text-text-hi font-semibold mb-1 truncate">{enr.level}{enr.field ? ` · ${enr.field}` : ''}</h3>
            <p className="text-[11.5px] text-text-dim mb-2">🗓 School · Mon–Fri 08:00–15:00</p>
            <StatusBar label="Progress" value={edu.progress} gradient />
            <p className="text-[11px] text-text-dim mt-2 tnum">~{daysLeft} study days left</p>
            <Button full className="mt-3" onClick={() => dispatch({ type: 'STUDY' })}>Study (full day)</Button>
          </Card>
        </div>
      ) : next ? (
        <div>
          <SectionLabel>Enroll Next</SectionLabel>
          <Card className="p-4">
            <p className="text-[13px] text-text-hi font-medium mb-1">{next}</p>
            <p className="text-[12px] text-text-mid mb-3">Takes {EDU_DAYS[next]} study days. School runs Mon–Fri, 8–3.</p>
            {fieldRequired(next) && (
              <select value={field} onChange={(e) => setField(e.target.value)} className="w-full rounded-xl bg-bg-panel-2 border border-stroke px-3 py-2.5 text-[13px] text-text-hi mb-3 outline-none focus:border-accent">
                {DEGREE_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            )}
            <Button full variant="subtle" onClick={() => dispatch({ type: 'ENROLL', level: next, field: fieldRequired(next) ? field : null })}>
              Enroll in {next}
            </Button>
          </Card>
        </div>
      ) : (
        <Card className="p-4 text-center text-[13px] text-gold">You’ve reached the top of the academic ladder.</Card>
      )}
    </div>
  )
}

export default function Career() {
  const { state, dispatch, go } = useGame()
  const { sim } = state.game
  const [tab, setTab] = useState('Career')
  const [offerTrack, setOfferTrack] = useState(null)
  const [offers, setOffers] = useState([])

  const openOffers = (track) => {
    setOfferTrack(track)
    setOffers(generateOffers(track, sim))
  }
  const takeOffer = (o) => {
    if (o.conflict) return
    dispatch({ type: 'APPLY_JOB', trackId: offerTrack.id, levelIndex: 0, company: o.company, schedule: o.schedule, wage: o.wage })
    setOfferTrack(null)
  }

  return (
    <>
      <Screen>
        <ScreenHeader
          title="Work & Study"
          subtitle="Careers · Education"
          left={<BackButton onClick={() => go('home')} />}
          right={<IconButton icon={tab === 'Career' ? <IconBriefcase size={18} /> : <IconBook size={18} />} label="Section" />}
        />
        <div className="mb-5">
          <Tabs tabs={['Career', 'Education']} active={tab} onChange={setTab} />
        </div>
        {tab === 'Career'
          ? <JobsTab sim={sim} dispatch={dispatch} go={go} onApply={openOffers} />
          : <EducationTab sim={sim} dispatch={dispatch} />}
      </Screen>

      {offerTrack && (
        <Modal onClose={() => setOfferTrack(null)} accent={offerTrack.illegal ? 'danger' : 'accent'}>
          <ModalLabel icon={<IconBriefcase size={16} />}>{offerTrack.name} · Openings</ModalLabel>
          <p className="text-[12px] text-text-mid mb-3">
            {offerTrack.levels[0].title} positions. Pick a company — you can’t take one that clashes with your school schedule.
          </p>
          <div className="space-y-2.5">
            {offers.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={!!o.conflict}
                onClick={() => takeOffer(o)}
                className={[
                  'w-full text-left rounded-xl border px-3.5 py-3 transition-colors',
                  o.conflict
                    ? 'border-[#E05B6C]/40 bg-[#E05B6C]/5 opacity-70 cursor-not-allowed'
                    : 'border-stroke bg-bg-panel-2 hover:border-accent',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-text-hi font-semibold truncate">{o.company}</span>
                  <span className="text-[12px] text-gold tnum shrink-0">{money(sim, o.wage)}/hr</span>
                </div>
                <p className="text-[11.5px] text-text-mid mt-0.5 truncate">🗓 {fmtSchedule(o.schedule)}</p>
                {o.conflict && <p className="text-[11px] text-[#ff9aa6] mt-1">⚠ {o.conflict}</p>}
              </button>
            ))}
          </div>
          <Button full variant="outline" className="mt-3" onClick={() => setOfferTrack(null)}>Cancel</Button>
        </Modal>
      )}
    </>
  )
}
