import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import { Card, TraitChip, Avatar, Button, BackButton } from '../components/ui.jsx'
import {
  TRAIT_CATALOG,
  AGE_STAGES,
  PRONOUN_OPTIONS,
  ASPIRATIONS,
  SKILL_KEYS,
} from '../game/data.js'
import { getTrack, nextEduLevel } from '../game/careers.js'
import { DEFAULT_SHIFT } from '../game/scheduling.js'
import { makeNPC } from '../game/names.js'
import { GENDERS, SEXUALITIES } from '../game/morality.js'
import { deriveMeters } from '../game/engine.js'
import { IconArrowRight, IconSpark } from '../components/Icons.jsx'

const STEPS = [
  'Name',
  'Age',
  'Pronouns',
  'Traits',
  'Aspiration',
  'Start',
  'Likes',
  'Confirm',
]

const AGE_BY_STAGE = { Child: 9, Teen: 16, Adult: 25, Elder: 68 }
// Baseline schooling already completed by the time the sim starts.
const EDU_BY_STAGE = { Child: 'None', Teen: 'Elementary', Adult: 'High School', Elder: 'High School' }

// Starting paths: an entry-level (no-degree) job, school, or unemployment.
const START_PATHS = [
  { id: 'none', label: 'Undecided', desc: 'Start unemployed and choose later.' },
  { id: 'student', label: 'Student', desc: 'Enroll in your next school level.' },
  { id: 'writing', label: 'Writing', desc: 'Start as a Blogger.' },
  { id: 'food', label: 'Food Service', desc: 'Start as a Dishwasher.' },
  { id: 'retail', label: 'Retail', desc: 'Start as a Bagger.' },
  { id: 'cleaning', label: 'Cleaning', desc: 'Start as a Street Sweeper.' },
]

const emptyDraft = {
  firstName: '',
  lastName: '',
  ageStage: 'Adult',
  pronouns: '',
  gender: '',
  sexuality: '',
  traits: [],
  aspiration: ASPIRATIONS[0].title,
  startPath: 'none',
  likes: 'Rainy days, Black coffee',
  dislikes: 'Crowds, Small talk',
  hobbies: 'Writing, Reading',
}

// Build a complete game state from the creation draft.
function buildGame(d) {
  const skills = {}
  SKILL_KEYS.forEach((k) => (skills[k] = { level: 1, xp: 0 }))
  // a couple of traits give thematic starting skill bumps
  if (d.traits.includes('Creative')) skills.Writing = { level: 3, xp: 20 }
  if (d.traits.includes('Bookworm')) skills.Logic = { level: 2, xp: 40 }
  if (d.traits.includes('Athletic')) skills.Fitness = { level: 2, xp: 30 }

  const toList = (s) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

  // Resolve the starting path into a job and/or education.
  const baseEdu = EDU_BY_STAGE[d.ageStage]
  let job = null
  let education = { level: baseEdu, field: null, progress: 0, enrolledIn: null }

  if (d.startPath === 'student' || d.ageStage === 'Child') {
    const nextLvl = nextEduLevel(baseEdu)
    if (nextLvl) education = { ...education, enrolledIn: { level: nextLvl, field: null }, progress: 0 }
  } else if (d.startPath !== 'none') {
    const track = getTrack(d.startPath)
    if (track) {
      job = {
        trackId: d.startPath,
        levelIndex: 0,
        performance: 50,
        sinceDay: 0,
        company: 'Starter Co.',
        wage: track.levels[0].wage,
        schedule: { ...DEFAULT_SHIFT, label: track.name },
      }
    }
  }

  const startTitle = job ? getTrack(job.trackId).levels[0].title : education.enrolledIn ? 'Student' : 'Unemployed'

  const sim = {
    id: `sim_${Date.now().toString(36)}`,
    firstName: d.firstName.trim() || 'Riley',
    lastName: d.lastName.trim() || 'Quinn',
    age: AGE_BY_STAGE[d.ageStage],
    ageStage: d.ageStage,
    pronouns: d.pronouns || 'they / them',
    gender: d.gender || 'Non-Binary',
    sexuality: d.sexuality || 'Bisexual',
    profession: startTitle,
    job,
    education,
    season: 'Spring',
    day: 1,
    year: 1,
    totalDays: 0,
    timeMin: 8 * 60,
    timeBlock: 'Morning',
    criminalRecord: 0,
    probationUntil: 0,
    location: 'home',
    kindness: 80,
    evilness: 0,
    mentalHealth: 70,
    stress: 25,
    reputation: 50,
    properties: [],
    vehicles: [],
    achievements: [],
    hasPhone: false,
    cash: 2000,
    needs: { hunger: 80, energy: 80, hygiene: 85, bladder: 80, fun: 70, social: 65, comfort: 75 },
    meters: { happiness: 70, creativity: 60, health: 75 },
    skills,
    traits: d.traits,
    bio: `${d.firstName.trim() || 'They'} is just beginning a new chapter — ${d.aspiration.toLowerCase()} on the horizon, and a quiet town full of pages waiting to be written.`,
    likes: toList(d.likes),
    dislikes: toList(d.dislikes),
    hobbies: toList(d.hobbies),
    aspiration: d.aspiration,
    currency: '€',
  }
  sim.meters = deriveMeters(sim)

  const now = Date.now()
  return {
    sim,
    npcs: [
      makeNPC({ id: 'npc_jamie', first: 'Jamie', last: 'Chen', gender: 'female', age: 27, friendship: 40, romance: 5 }),
      makeNPC({ id: 'npc_robin', first: 'Robin', last: 'Vale', gender: 'nonbinary', age: 23, friendship: 25, romance: 0 }),
      makeNPC({ id: 'npc_sam', first: 'Sam', last: 'Ortiz', gender: 'male', age: 25, friendship: 20, romance: 10 }),
    ],
    events: [
      { id: 'evt_start', text: `A new life begins for ${sim.firstName}.`, tag: '+ Mood', timestamp: now },
    ],
    journal: [
      { id: 'evt_start', text: `A new life begins for ${sim.firstName}.`, tag: '+ Mood', timestamp: now },
    ],
    inventory: [
      { id: 'inv_notebook', name: 'Blank Notebook' },
      { id: 'inv_pen', name: 'Reliable Pen' },
    ],
    goals: [
      { id: 'goal_aspire', title: d.aspiration, progress: 0 },
      { id: 'goal_friend', title: 'Make a close friend', progress: 12 },
    ],
    running: false,
    speed: 1,
    pendingScenario: null,
    pendingMatch: null,
    dating: false,
    gameOver: false,
    meta: { turn: 0, createdAt: now, sinceScenario: 0 },
  }
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12px] uppercase tracking-wider text-text-dim font-semibold mb-2">
        {label}
      </span>
      {children}
    </label>
  )
}

function ChipGroup({ label, options, value, onPick }) {
  return (
    <div>
      <span className="block text-[12px] uppercase tracking-wider text-text-dim font-semibold mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <TraitChip key={o} active={value === o} onClick={() => onPick(o)}>
            {o}
          </TraitChip>
        ))}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl bg-bg-panel-2 border border-stroke px-3.5 py-3 text-[14px] text-text-hi placeholder:text-text-dim focus:border-accent outline-none'

// Clear "selected" highlight for choice cards. Uses an inset accent ring + tint
// (a ring always wins over the Card's base border, which a bare `border-accent`
// can't reliably do under Tailwind's class ordering).
const SELECTED = 'border-accent bg-accent/15 ring-2 ring-accent ring-inset'

export default function CharacterCreation() {
  const { dispatch, go } = useGame()
  const [step, setStep] = useState(0)
  const [d, setD] = useState(emptyDraft)

  const set = (patch) => setD((prev) => ({ ...prev, ...patch }))

  // Gender drives pronouns: binary genders auto-assign and hide the picker;
  // Non-Binary defaults to they/them but lets you choose; Other leaves it unset
  // so you pick (or skip) yourself.
  const pickGender = (g) => {
    const auto = { Female: 'she / her', Male: 'he / him', 'Non-Binary': 'they / them', Other: '' }
    const patch = { gender: g, pronouns: auto[g] ?? '' }
    // Binary genders default to Straight (still editable); leave other genders' choice alone.
    if (g === 'Female' || g === 'Male') patch.sexuality = 'Straight'
    set(patch)
  }
  const pronounsChosen = d.gender === 'Non-Binary' || d.gender === 'Other'
  const toggleTrait = (name) => {
    setD((prev) => {
      const has = prev.traits.includes(name)
      if (has) return { ...prev, traits: prev.traits.filter((t) => t !== name) }
      if (prev.traits.length >= 4) return prev
      return { ...prev, traits: [...prev.traits, name] }
    })
  }

  const canProceed = () => {
    if (step === 0) return d.firstName.trim().length > 0
    if (step === 2) return !!d.gender && !!d.sexuality // identity: must choose
    if (step === 3) return d.traits.length === 4
    return true
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else dispatch({ type: 'NEW_GAME', game: buildGame(d) })
  }
  const back = () => (step === 0 ? go('title') : setStep((s) => s - 1))

  return (
    <div className="flex-1 min-h-0 flex flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 animate-fade-in overflow-x-hidden">
      <header className="flex items-center gap-2 mb-2 pt-1">
        <BackButton onClick={back} />
        <p className="flex-1 text-center text-[11.5px] text-text-dim tnum">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="w-9 shrink-0" />
      </header>

      {/* progress */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-bg-panel-2'}`}
          />
        ))}
      </div>

      <h1 className="font-display text-[26px] font-bold text-text-hi tracking-tight mb-1">
        {stepTitle(step)}
      </h1>
      <p className="text-[13px] text-text-mid mb-6">{stepHint(step, d)}</p>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar">
        {step === 0 && (
          <div className="space-y-4">
            <Field label="First name">
              <input
                autoFocus
                className={inputCls}
                value={d.firstName}
                onChange={(e) => set({ firstName: e.target.value })}
                placeholder="Riley"
              />
            </Field>
            <Field label="Last name">
              <input
                className={inputCls}
                value={d.lastName}
                onChange={(e) => set({ lastName: e.target.value })}
                placeholder="Quinn"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {AGE_STAGES.map((stage) => (
              <Card
                key={stage}
                className={`p-4 text-center ${d.ageStage === stage ? SELECTED : ''}`}
                onClick={() => set({ ageStage: stage })}
              >
                <div className="text-[15px] text-text-hi font-semibold">{stage}</div>
                <div className="text-[12px] text-text-dim mt-1 tnum">~{AGE_BY_STAGE[stage]} y/o</div>
              </Card>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <ChipGroup label="Gender" options={GENDERS} value={d.gender} onPick={pickGender} />
            <ChipGroup label="Sexuality" options={SEXUALITIES} value={d.sexuality} onPick={(v) => set({ sexuality: v })} />
            {!d.gender ? (
              <div>
                <span className="block text-[12px] uppercase tracking-wider text-text-dim font-semibold mb-2">Pronouns</span>
                <p className="text-[13px] text-text-dim">Choose a gender first.</p>
              </div>
            ) : pronounsChosen ? (
              <ChipGroup label="Pronouns" options={PRONOUN_OPTIONS} value={d.pronouns} onPick={(v) => set({ pronouns: v })} />
            ) : (
              <div>
                <span className="block text-[12px] uppercase tracking-wider text-text-dim font-semibold mb-2">Pronouns</span>
                <p className="text-[13px] text-text-mid">
                  Set automatically: <span className="text-text-hi font-medium">{d.pronouns}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {TRAIT_CATALOG.map((t) => (
              <TraitChip
                key={t.name}
                active={d.traits.includes(t.name)}
                muted={!d.traits.includes(t.name) && d.traits.length >= 4}
                onClick={() => toggleTrait(t.name)}
              >
                {t.name}
              </TraitChip>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {ASPIRATIONS.map((a) => (
              <Card
                key={a.title}
                className={`p-4 ${d.aspiration === a.title ? SELECTED : ''}`}
                onClick={() => set({ aspiration: a.title })}
              >
                <div className="text-[14.5px] text-text-hi font-semibold">{a.title}</div>
                <div className="text-[12.5px] text-text-mid mt-0.5 leading-snug">{a.desc}</div>
              </Card>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            {d.ageStage === 'Child' && (
              <p className="text-[12px] text-accent-2 -mt-2">
                As a child, you’ll start in school no matter what.
              </p>
            )}
            {START_PATHS.map((p) => (
              <Card
                key={p.id}
                className={`p-4 ${d.startPath === p.id ? SELECTED : ''}`}
                onClick={() => set({ startPath: p.id })}
              >
                <div className="text-[14px] text-text-hi font-semibold">{p.label}</div>
                <div className="text-[12px] text-text-mid mt-0.5">{p.desc}</div>
              </Card>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <Field label="Likes (comma separated)">
              <input className={inputCls} value={d.likes} onChange={(e) => set({ likes: e.target.value })} />
            </Field>
            <Field label="Dislikes">
              <input className={inputCls} value={d.dislikes} onChange={(e) => set({ dislikes: e.target.value })} />
            </Field>
            <Field label="Hobbies">
              <input className={inputCls} value={d.hobbies} onChange={(e) => set({ hobbies: e.target.value })} />
            </Field>
          </div>
        )}

        {step === 7 && (
          <Card className="p-5">
            <div className="flex items-center gap-3.5 mb-4">
              <Avatar name={`${d.firstName || 'R'} ${d.lastName || 'Q'}`} size={54} />
              <div>
                <h3 className="font-display text-[18px] text-text-hi font-semibold">
                  {d.firstName || 'Riley'} {d.lastName || 'Quinn'}
                </h3>
                <p className="text-[12px] text-text-mid">
                  {AGE_BY_STAGE[d.ageStage]} y/o · {START_PATHS.find((p) => p.id === d.startPath)?.label}
                </p>
              </div>
            </div>
            <dl className="space-y-2.5 text-[13px]">
              <Row k="Gender" v={d.gender || '—'} />
              <Row k="Sexuality" v={d.sexuality || '—'} />
              <Row k="Pronouns" v={d.pronouns || '—'} />
              <Row k="Aspiration" v={d.aspiration} />
              <Row k="Traits" v={d.traits.join(', ') || '—'} />
              <Row k="Start" v={START_PATHS.find((p) => p.id === d.startPath)?.label || '—'} />
              <Row k="Likes" v={d.likes || '—'} />
            </dl>
          </Card>
        )}
      </div>

      <Button
        full
        size="lg"
        className="mt-5 shrink-0"
        disabled={!canProceed()}
        trailing={<IconArrowRight size={18} />}
        onClick={next}
      >
        {step === STEPS.length - 1 ? 'Begin Life' : 'Continue'}
      </Button>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex gap-3">
      <dt className="text-text-dim w-24 shrink-0">{k}</dt>
      <dd className="text-text-hi flex-1">{v}</dd>
    </div>
  )
}

function stepTitle(step) {
  return [
    'What is your name?',
    'Choose a life stage',
    'Your identity',
    'Pick four traits',
    'Your life aspiration',
    'Where do you begin?',
    'Likes & hobbies',
    'Meet your sim',
  ][step]
}

function stepHint(step, d) {
  return [
    'Every story starts with a name.',
    'This sets your starting age and outlook.',
    'Gender, sexuality, and pronouns — they shape relationships.',
    `Selected ${d.traits.length}/4 — these shape how life unfolds.`,
    'A north star to work toward.',
    'A first job, school, or a blank slate.',
    'Small details that make a life feel lived-in.',
    'Looks good? Begin a life in words.',
  ][step]
}
