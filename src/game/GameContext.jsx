import { createContext, useContext, useReducer, useMemo } from 'react'
import { makeSeedState } from './data.js'
import {
  advanceMinutes,
  applyEffects,
  workShift,
  studyDay,
  arrestSentence,
  serveTime,
  decayRelationships,
  refreshNpcStatus,
  relationshipMood,
  scheduleBlockOf,
  clamp,
  uid,
} from './engine.js'
import { pickScenario } from './scenarios.js'
import { getTrack } from './careers.js'
import { SCHOOL_SCHEDULE, DEFAULT_SHIFT, isOnSchedule, scheduleHours, dowIndex } from './scheduling.js'
import { makeNPC } from './names.js'
import { isPureEvil, isAngelic, lifePaths } from './morality.js'
import { findItem } from './shop.js'
import { newlyEarned, ACHIEVEMENTS } from './achievements.js'
import { saveGame, loadGame, clearSave } from './persistence.js'

const GameContext = createContext(null)

// game-minutes advanced per tick at each speed (tick = 500ms real).
const SPEED_STEP = { 1: 6, 2: 16, 3: 36 }
const SCENARIO_WINDOW = 200 // game-minutes between scenario rolls
const SCENARIO_CHANCE = 0.2 // 20% chance to encounter a scenario each window

// Backfill fields that older saves (turn-based era) won't have, so a stale save
// keeps working under the new time-based model instead of crashing.
function normalize(game) {
  if (!game || !game.sim) return null
  const s = game.sim
  const sim = {
    ...s,
    timeMin: typeof s.timeMin === 'number' ? s.timeMin : 8 * 60,
    totalDays: typeof s.totalDays === 'number' ? s.totalDays : 0,
    job: s.job ? { schedule: DEFAULT_SHIFT, ...s.job } : null,
    education: s.education ?? { level: 'High School', field: null, progress: 0, enrolledIn: null },
    profession: s.profession ?? 'Unemployed',
    criminalRecord: s.criminalRecord ?? 0,
    probationUntil: s.probationUntil ?? 0,
    location: s.location ?? 'home',
    gender: s.gender ?? 'Non-Binary',
    sexuality: s.sexuality ?? 'Straight',
    kindness: s.kindness ?? 80,
    evilness: s.evilness ?? 0,
    mentalHealth: s.mentalHealth ?? 70,
    stress: s.stress ?? 25,
    reputation: s.reputation ?? 50,
    properties: s.properties ?? [],
    vehicles: s.vehicles ?? [],
    achievements: s.achievements ?? [],
    hasPhone: s.hasPhone ?? false,
    currency: '$',
    needs: s.needs,
    meters: s.meters,
  }
  // Backfill people who predate the profile / decay systems.
  const npcs = (game.npcs || []).map((npc) => ({
    gender: npc.gender ?? 'nonbinary',
    age: npc.age ?? 25,
    education: npc.education ?? { level: 'High School', field: null },
    employment: npc.employment ?? 'Unemployed',
    jobTitle: npc.jobTitle ?? null,
    trackName: npc.trackName ?? null,
    trust: npc.trust ?? 50,
    lastSeen: npc.lastSeen ?? 0,
    wantsAttention: npc.wantsAttention ?? false,
    mood: npc.mood ?? 'Content',
    ...npc,
  }))

  return {
    ...game,
    sim,
    npcs,
    running: false,
    speed: game.speed ?? 1,
    pendingScenario: game.pendingScenario ?? null,
    pendingMatch: game.pendingMatch ?? null,
    dating: game.dating ?? false,
    gameOver: false, // a loaded save is always a living state
    meta: { ...(game.meta || {}), sinceScenario: game.meta?.sinceScenario ?? 0 },
  }
}

function initState() {
  const saved = normalize(loadGame())
  return { screen: saved ? 'home' : 'title', game: saved, toast: null, focusEventId: null, focusAt: 0 }
}

function logEvent(game, evt) {
  return { ...game, events: [evt, ...game.events].slice(0, 80), journal: [evt, ...game.journal] }
}

// Death: health hitting zero ends the run. We deliberately do NOT save the dead
// state, so the persisted save stays at the last *living* moment for "Load last
// save". `die` flips the game-over flag, stops the clock, and logs an obituary.
const isDead = (game) => (game.sim?.meters?.health ?? 100) <= 0 && !game.gameOver
function die(state, game) {
  const name = game.sim.firstName || 'Your sim'
  const dead = logEvent(
    { ...game, running: false, gameOver: true, pendingScenario: null, pendingMatch: null },
    { id: uid('evt'), text: `${name}'s health gave out. Their story ends here.`, tag: '☠ The End', timestamp: Date.now() },
  )
  return { ...state, game: dead, toast: 'Your health reached zero.' }
}

// Award any newly-earned achievements, logging each. Returns the updated game.
function awardAchievements(game) {
  const earned = newlyEarned(game, game.sim.achievements || [])
  if (!earned.length) return game
  let next = { ...game, sim: { ...game.sim, achievements: [...(game.sim.achievements || []), ...earned] } }
  for (const id of earned) {
    const a = ACHIEVEMENTS.find((x) => x.id === id)
    next = logEvent(next, { id: uid('evt'), text: `Achievement unlocked: ${a.name}.`, tag: '★ Achievement', timestamp: Date.now() })
  }
  return next
}

function syncProfession(sim) {
  if (!sim.job) return { ...sim, profession: 'Unemployed' }
  const track = getTrack(sim.job.trackId)
  const def = track?.levels[sim.job.levelIndex]
  return { ...sim, profession: def?.title || 'Unemployed' }
}

// Where the character currently is — only matching scenarios fire there.
// Driven by their actual schedules: at 'work' during job hours, 'school' during
// school hours, otherwise wherever they last travelled (defaults to 'home').
function currentLocation(sim) {
  if (sim.job && isOnSchedule(sim, sim.job.schedule || DEFAULT_SHIFT)) return 'work'
  if (sim.education?.enrolledIn && isOnSchedule(sim, SCHOOL_SCHEDULE)) return 'school'
  return sim.location || 'home'
}

// Fire a scenario for a specific location immediately (used for work/study,
// whose time is compressed). Returns a game patch or null.
function fireScenario(game, location, chance = 0.2) {
  if (Math.random() > chance) return null
  const block = game.sim.timeBlock
  const scheduleLabel = scheduleBlockOf(game.sim.timeMin, location)
  const sc = pickScenario(game.sim, location, block)
  if (!sc) return null
  if (sc.choices) return { ...game, running: false, pendingScenario: { ...sc, locationKey: location, scheduleLabel, ts: Date.now() } }
  const applied = applyEffects(game.sim, game.npcs, sc.effects || {})
  const evt = { id: uid('evt'), text: sc.text, tag: sc.tag, seed: sc.seed, timestamp: Date.now() }
  return logEvent({ ...game, sim: applied.sim, npcs: applied.npcs }, evt)
}

// Roll a scenario after enough game-time has elapsed, matched to location.
function maybeScenario(game) {
  const sinceScenario = (game.meta?.sinceScenario || 0)
  if (sinceScenario < SCENARIO_WINDOW) return { meta: { ...game.meta, sinceScenario } }
  if (Math.random() > SCENARIO_CHANCE) return { meta: { ...game.meta, sinceScenario: 0 } }

  const location = currentLocation(game.sim)
  const block = game.sim.timeBlock
  const scheduleLabel = scheduleBlockOf(game.sim.timeMin, location)
  const sc = pickScenario(game.sim, location, block)
  if (!sc) return { meta: { ...game.meta, sinceScenario: 0 } }

  if (sc.choices) {
    return {
      meta: { ...game.meta, sinceScenario: 0 },
      running: false,
      pendingScenario: { ...sc, locationKey: location, scheduleLabel, ts: Date.now() },
    }
  }

  const applied = applyEffects(game.sim, game.npcs, sc.effects || {})
  const evt = { id: uid('evt'), text: sc.text, tag: sc.tag, seed: sc.seed, timestamp: Date.now() }
  const logged = logEvent({ ...game, sim: applied.sim, npcs: applied.npcs }, evt)
  return { ...logged, meta: { ...game.meta, sinceScenario: 0 } }
}

// ---- Dating service ----------------------------------------------------- //
// $100/day subscription with a 5% daily chance to find a match. Who you match
// with respects your gender + orientation: binary + Straight matches the
// opposite gender; binary + Gay/Lesbian matches the same; Bi/Pan match anyone;
// and Non-Binary or Other are open to anyone.
const DATING_COST = 100
const DATING_MATCH_CHANCE = 0.2

// On the Righteous/Neutral paths you commit to one partner at a time; only the
// Demonic path lets you keep dating around while already attached.
const isEvilPath = (sim) => lifePaths(sim).current.id === 'demonic'
const hasPartner = (npcs) => npcs.some((n) => (n.romance ?? 0) >= 60)

function matchableGenders(sim) {
  const g = sim.gender
  const s = sim.sexuality
  if (g === 'Non-Binary' || g === 'Other') return ['female', 'male', 'nonbinary']
  if (s === 'Straight') return g === 'Male' ? ['female'] : ['male']
  if (s === 'Gay' || s === 'Lesbian') return g === 'Male' ? ['male'] : ['female']
  return ['female', 'male', 'nonbinary'] // Bisexual, Pansexual, Asexual, …
}

function makeDatingMatch(sim) {
  const opts = matchableGenders(sim)
  const gender = opts[Math.floor(Math.random() * opts.length)]
  const age = Math.max(18, (sim.age || 25) + Math.floor(Math.random() * 11) - 5)
  const npc = makeNPC({
    gender,
    age,
    friendship: 8 + Math.floor(Math.random() * 10),
    romance: 16 + Math.floor(Math.random() * 14),
    lastSeen: sim.totalDays || 0,
    met: Date.now(),
  })
  return refreshNpcStatus(npc)
}

// Run the dating subscription for `days` elapsed. Charges the fee, may surface a
// match (paused for the player to accept/decline), or pauses if you can't pay.
const DATING_MIN_AGE = 16

function processDating(game, days = 1) {
  if (!game.dating || days < 1) return null
  // Safety: if the sim is under-age (e.g. an old save), silently switch it off.
  if ((game.sim.age || 0) < DATING_MIN_AGE) return { game: { ...game, dating: false } }
  // Committed and not on the dark path → stop looking; pause the subscription.
  if (!isEvilPath(game.sim) && hasPartner(game.npcs)) {
    return { game: { ...game, dating: false }, toast: 'You’re committed — dating paused.' }
  }
  if ((game.sim.cash || 0) < DATING_COST) {
    const evt = { id: uid('evt'), text: 'Your dating subscription paused — you couldn’t cover the fee.', tag: '− Dating', timestamp: Date.now() }
    return { game: logEvent({ ...game, dating: false }, evt), toast: 'Dating paused — out of money' }
  }
  const charge = Math.min(DATING_COST * days, game.sim.cash)
  let next = { ...game, sim: { ...game.sim, cash: Math.max(0, game.sim.cash - charge) } }

  let match = null
  for (let i = 0; i < days && !match; i++) {
    if (Math.random() < DATING_MATCH_CHANCE) match = makeDatingMatch(next.sim)
  }
  if (!match) return { game: next }

  const evt = { id: uid('evt'), text: `You matched with ${match.name} on the dating app.`, tag: '+ Romance', timestamp: Date.now() }
  next = logEvent({ ...next, npcs: [...next.npcs, match] }, evt)
  return { game: { ...next, pendingMatch: match, running: false }, toast: `New match: ${match.name}` }
}

// Once per day: decay neglected bonds, let partners & close friends reach out
// for attention, punish ignoring them, and refresh everyone's mood. Returns the
// updated npcs plus any narrative events to log.
function processSocial(game, rand = Math.random) {
  const totalDays = game.sim.totalDays || 0
  let npcs = decayRelationships(game.npcs, totalDays)
  const events = []

  npcs = npcs.map((npc) => {
    let n = { ...npc }
    const gap = Math.max(0, totalDays - (n.lastSeen ?? 0))
    const partner = n.status === 'Partner'
    const close = n.status === 'Close Friend' || n.status === 'Crush'

    // Reach out for attention if it's been a moment and they aren't already waiting.
    if (!n.wantsAttention && (partner || close) && gap >= 1) {
      if (rand() < (partner ? 0.22 : 0.08)) {
        n.wantsAttention = true
        n.lastReachOut = totalDays
        const line = partner
          ? `${n.name} reached out — they miss you and want to spend time together.`
          : `${n.name} messaged, hoping to catch up soon.`
        events.push({ text: line, tag: '♥ Wants attention' })
      }
    }

    // Ignored after reaching out → hurt feelings + relationship slips faster.
    if (n.wantsAttention && gap >= 2) {
      const drop = partner ? 4 : 2
      n.romance = clamp((n.romance ?? 0) - (partner ? drop : drop * 0.4))
      n.friendship = clamp((n.friendship ?? 0) - drop * 0.6)
      n.trust = clamp((n.trust ?? 50) - drop * 0.5)
      n = refreshNpcStatus(n)
      if (partner && gap === 4) events.push({ text: `${n.name} is hurt that you've been so distant.`, tag: '− Relationship' })
    }

    n.mood = relationshipMood(n, totalDays)
    return n
  })

  return { npcs, events }
}

// Resolve getting caught on an illegal job: escalating consequences, lose the
// gig, and either go on probation (no time skip) or serve prison time.
function arrest(game) {
  const sim = game.sim
  let sentence = arrestSentence(sim.criminalRecord)
  // Pure Evil perk: ~50% reduced sentence (lawyers, alibis, manipulation).
  if (isPureEvil(sim)) sentence = { ...sentence, days: Math.round(sentence.days / 2), label: `${sentence.label} (halved)` }
  const fine = 300 + 200 * sentence.record

  let nsim = { ...sim, criminalRecord: sentence.record, job: null, profession: 'Unemployed' }
  nsim.cash = Math.max(0, nsim.cash - fine)

  let text
  if (sentence.type === 'probation') {
    nsim.probationUntil = (sim.totalDays || 0) + sentence.days
    const applied = applyEffects(nsim, game.npcs, { 'meters.happiness': -16, 'meters.health': -6 })
    nsim = applied.sim
    text = `Caught! First offense — ${sentence.label}, a ${fine} fine, and your record is stained.`
  } else {
    nsim = serveTime(nsim, sentence.days) // skip the calendar forward; you're inside
    nsim.probationUntil = 0
    text = `Caught! ${sentence.label} (offense #${sentence.record}). A ${fine} fine and time served.`
  }

  const evt = { id: uid('evt'), text, tag: '− Arrested', timestamp: Date.now() }
  const next = awardAchievements(logEvent({ ...game, sim: nsim }, evt))
  return { game: next, label: sentence.label }
}

// Employed sims work automatically on their company schedule. Once per day,
// when the clock enters the shift window, run the whole shift in one block.
function applyAutoWork(game) {
  const sim = game.sim
  if (!sim.job) return { game, worked: false }
  if (game.pendingScenario || game.pendingMatch) return { game, worked: false }
  const sched = sim.job.schedule || DEFAULT_SHIFT
  const today = dowIndex(sim.totalDays || 0)
  if (!sched.days.includes(today)) return { game, worked: false }
  if (sim.timeMin < sched.start || sim.timeMin >= sched.end) return { game, worked: false }
  if ((game.meta?.lastWorkDay) === (sim.totalDays || 0)) return { game, worked: false }

  const hours = scheduleHours(sched)
  const shift = workShift(sim, hours)
  if (!shift) return { game, worked: false }

  // caught on an illegal auto-shift → arrest (job is cleared, so it won't recur)
  if (shift.caught) {
    const res = arrest(game)
    const meta = { ...res.game.meta, lastWorkDay: res.game.sim.totalDays || 0 }
    return { game: { ...res.game, meta }, worked: true, caught: true, label: res.label }
  }

  const workedDay = sim.totalDays || 0
  let nsim = advanceMinutes(sim, sched.end - sim.timeMin) // run the clock to shift's end
  const applied = applyEffects(nsim, game.npcs, shift.effects)
  nsim = applied.sim

  const evt = { id: uid('evt'), text: `Finished a shift. ${shift.log}`, tag: shift.tag, timestamp: Date.now() }
  const meta = { ...game.meta, lastWorkDay: workedDay }
  const next = logEvent({ ...game, sim: nsim, npcs: applied.npcs, meta }, evt)
  // a workplace scenario may surface from the day
  const fired = fireScenario(next, 'work')
  return { game: fired || next, worked: true, caught: false }
}

function reducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME': {
      saveGame(action.game)
      return { ...state, game: action.game, screen: 'home', toast: 'New life begun.' }
    }
    case 'LOAD_SEED': {
      const g = makeSeedState()
      saveGame(g)
      return { ...state, game: g, screen: 'home', toast: 'Loaded Alex Morgan.' }
    }
    case 'CONTINUE_SAVE': {
      const g = normalize(loadGame())
      if (!g) return state
      return { ...state, game: g, screen: 'home' }
    }
    case 'GO':
      return {
        ...state,
        screen: action.screen,
        focusEventId: action.focusEventId ?? null,
        // bump a token so re-clicking the same event re-triggers the flash
        focusAt: action.focusEventId ? Date.now() : state.focusAt,
      }

    case 'SET_RUNNING': {
      if (!state.game) return state
      const game = { ...state.game, running: action.running }
      saveGame(game)
      return { ...state, game }
    }
    case 'SET_SPEED': {
      if (!state.game) return state
      return { ...state, game: { ...state.game, speed: action.speed, running: true } }
    }

    case 'TICK': {
      const game = state.game
      if (!game || !game.running || game.pendingScenario || game.pendingMatch || game.gameOver) return state
      const step = SPEED_STEP[game.speed] || SPEED_STEP[1]

      const prevDay = game.sim.totalDays || 0
      const sim = advanceMinutes(game.sim, step)
      const meta = { ...game.meta, sinceScenario: (game.meta?.sinceScenario || 0) + step }
      let next = { ...game, sim, meta }

      // Health depleted by neglect → game over (without saving the dead state).
      if (isDead(next)) return die(state, next)

      const dayRolled = (sim.totalDays || 0) !== prevDay

      let toast = state.toast

      // once-per-new-day processing: relationships (decay + reach-outs + mood),
      // then the dating subscription
      if (dayRolled) {
        const social = processSocial(next, Math.random)
        next = { ...next, npcs: social.npcs }
        for (const e of social.events) {
          next = logEvent(next, { id: uid('evt'), text: e.text, tag: e.tag, timestamp: Date.now() })
        }
        const dating = processDating(next, (sim.totalDays || 0) - prevDay)
        if (dating) {
          next = dating.game
          if (dating.toast) toast = dating.toast
        }
      }

      // automatic weekday work, then maybe a random scenario (skipped if a match
      // is waiting — the dating modal takes precedence and pauses the clock)
      if (!next.pendingMatch) {
        const auto = applyAutoWork(next)
        next = auto.game
        if (!next.pendingScenario) next = { ...next, ...maybeScenario(next) }
        if (auto.worked) toast = auto.caught ? `Caught — ${auto.label}` : '+ Payday'
        if (auto.worked) saveGame(next)
      }
      next = awardAchievements(next)

      if (dayRolled || next.pendingMatch) saveGame(next)
      return { ...state, game: next, toast }
    }

    case 'WORK': {
      const game = state.game
      if (!game) return state
      if (!game.sim.job) return { ...state, toast: 'You need a job first.' }
      const shift = workShift(game.sim)
      if (!shift) return state
      if (shift.caught) {
        const res = arrest(game)
        saveGame(res.game)
        return { ...state, game: res.game, toast: `Caught — ${res.label}` }
      }
      let sim = advanceMinutes(game.sim, 480) // 8h
      const applied = applyEffects(sim, game.npcs, shift.effects)
      sim = applied.sim
      const evt = { id: uid('evt'), text: shift.log, tag: shift.tag, timestamp: Date.now() }
      let next = logEvent({ ...game, sim, npcs: applied.npcs }, evt)
      if (isDead(next)) return die(state, next)
      saveGame(next)
      return { ...state, game: next, toast: shift.tag }
    }

    case 'STUDY': {
      const game = state.game
      if (!game) return state
      const enr = game.sim.education?.enrolledIn
      if (!enr) return { ...state, toast: 'Enroll in a program first.' }
      const sd = studyDay(game.sim)
      let sim = advanceMinutes(game.sim, 480)
      const applied = applyEffects(sim, game.npcs, sd.effects)
      sim = applied.sim

      let progress = (game.sim.education.progress || 0) + sd.delta
      let education = { ...game.sim.education, progress }
      let toast = sd.tag
      let evtText = sd.log
      if (progress >= 100) {
        // graduate to the enrolled level
        education = { level: enr.level, field: enr.field || null, progress: 0, enrolledIn: null }
        toast = `Graduated: ${enr.level}!`
        evtText = `Earned ${enr.level}${enr.field ? ` in ${enr.field}` : ''}. A milestone.`
      }
      sim = { ...sim, education }
      const evt = { id: uid('evt'), text: evtText, tag: progress >= 100 ? '+ Education' : sd.tag, timestamp: Date.now() }
      let next = awardAchievements(logEvent({ ...game, sim, npcs: applied.npcs }, evt))
      // a school scenario may surface from the day
      next = fireScenario(next, 'school') || next
      if (isDead(next)) return die(state, next)
      saveGame(next)
      return { ...state, game: next, toast }
    }

    case 'ENROLL': {
      const game = state.game
      if (!game) return state
      const education = { ...game.sim.education, enrolledIn: { level: action.level, field: action.field || null }, progress: 0 }
      const sim = { ...game.sim, education }
      const evt = { id: uid('evt'), text: `Enrolled in ${action.level}${action.field ? ` (${action.field})` : ''}.`, tag: '+ Education', timestamp: Date.now() }
      const next = logEvent({ ...game, sim }, evt)
      saveGame(next)
      return { ...state, game: next, toast: 'Enrolled.' }
    }

    case 'APPLY_JOB': {
      const game = state.game
      if (!game) return state
      const track = getTrack(action.trackId)
      const def = track?.levels[action.levelIndex ?? 0]
      if (!def) return state
      if (track.illegal && (game.sim.probationUntil || 0) > (game.sim.totalDays || 0)) {
        return { ...state, toast: 'On probation — no illegal work right now.' }
      }
      let sim = {
        ...game.sim,
        job: {
          trackId: action.trackId,
          levelIndex: action.levelIndex ?? 0,
          performance: 50,
          sinceDay: game.sim.totalDays || 0,
          company: action.company || null,
          schedule: action.schedule || DEFAULT_SHIFT,
          wage: action.wage ?? def.wage,
        },
      }
      sim = syncProfession(sim)
      const where = action.company ? ` at ${action.company}` : ''
      const evt = { id: uid('evt'), text: `Started a new job as a ${def.title}${where}.`, tag: '+ Career', timestamp: Date.now() }
      const next = awardAchievements(logEvent({ ...game, sim }, evt))
      saveGame(next)
      return { ...state, game: next, toast: `Hired: ${def.title}` }
    }

    case 'PROMOTE': {
      const game = state.game
      if (!game || !game.sim.job) return state
      const track = getTrack(game.sim.job.trackId)
      const nextIndex = game.sim.job.levelIndex + 1
      const def = track?.levels[nextIndex]
      if (!def) return state
      let sim = {
        ...game.sim,
        job: { ...game.sim.job, levelIndex: nextIndex, performance: 55, sinceDay: game.sim.totalDays || 0, wage: def.wage },
      }
      sim = syncProfession(sim)
      const evt = { id: uid('evt'), text: `Promoted to ${def.title}!`, tag: '+ Career', timestamp: Date.now() }
      const next = awardAchievements(logEvent({ ...game, sim }, evt))
      saveGame(next)
      return { ...state, game: next, toast: `Promoted: ${def.title}` }
    }

    case 'QUIT_JOB': {
      const game = state.game
      if (!game) return state
      let sim = syncProfession({ ...game.sim, job: null })
      const evt = { id: uid('evt'), text: 'Left your job behind.', tag: '− Career', timestamp: Date.now() }
      const next = logEvent({ ...game, sim }, evt)
      saveGame(next)
      return { ...state, game: next, toast: 'You quit your job.' }
    }

    case 'RESOLVE_SCENARIO': {
      const game = state.game
      const sc = game?.pendingScenario
      if (!sc) return state
      const choice = sc.choices[action.choiceIndex]
      const applied = applyEffects(game.sim, game.npcs, choice.effects || {})
      const evt = {
        id: uid('evt'),
        text: `${sc.text.split(/[?.]/)[0]} — ${choice.label}.`,
        tag: summarize(choice.effects),
        seed: sc.seed,
        timestamp: Date.now(),
      }
      let next = logEvent({ ...game, sim: applied.sim, npcs: applied.npcs }, evt)
      next = awardAchievements({ ...next, pendingScenario: null, running: true })
      saveGame(next)
      return { ...state, game: next, toast: choice.label }
    }

    case 'TOGGLE_DATING': {
      const game = state.game
      if (!game) return state
      if (!game.dating && (game.sim.age || 0) < DATING_MIN_AGE) {
        return { ...state, toast: `Must be ${DATING_MIN_AGE}+ to date.` }
      }
      if (!game.dating && !isEvilPath(game.sim) && hasPartner(game.npcs)) {
        return { ...state, toast: 'You’re already committed to someone.' }
      }
      const on = !game.dating
      const evt = {
        id: uid('evt'),
        text: on ? 'Subscribed to the dating app — $100/day.' : 'Cancelled your dating subscription.',
        tag: on ? '+ Dating' : '− Dating',
        timestamp: Date.now(),
      }
      const next = logEvent({ ...game, dating: on }, evt)
      saveGame(next)
      return { ...state, game: next, toast: on ? 'Dating: ON' : 'Dating: OFF' }
    }

    case 'RESOLVE_MATCH': {
      const game = state.game
      const npc = game?.pendingMatch
      if (!npc) return state
      let next
      if (action.keep) {
        // keep them as a contact, warm things up a touch
        const npcs = game.npcs.map((n) =>
          n.id === npc.id ? refreshNpcStatus({ ...n, friendship: Math.min(100, n.friendship + 4), lastSeen: game.sim.totalDays || 0 }) : n,
        )
        next = { ...game, npcs, pendingMatch: null, running: true }
      } else {
        // not interested — drop them from your contacts
        next = { ...game, npcs: game.npcs.filter((n) => n.id !== npc.id), pendingMatch: null, running: true }
      }
      saveGame(next)
      return { ...state, game: next, toast: action.keep ? `Connected with ${npc.name}` : 'Passed on the match' }
    }

    case 'MEET_NPC': {
      const game = state.game
      if (!game) return state
      // people you meet are roughly your age (±3), per the social rules
      const pa = game.sim.age || 25
      const age = Math.max(16, pa + Math.floor(Math.random() * 7) - 3)
      const npc = makeNPC({ age, lastSeen: game.sim.totalDays || 0 })
      // Angelic perk: new acquaintances start warmer toward you.
      if (isAngelic(game.sim)) npc.friendship = Math.min(100, npc.friendship + 10)
      let sim = advanceMinutes(game.sim, 60)
      const applied = applyEffects(sim, [...game.npcs, npc], { 'needs.social': 12, 'needs.fun': 6 })
      sim = applied.sim
      const evt = { id: uid('evt'), text: `Met someone new: ${npc.name}.`, tag: '+ Social', timestamp: Date.now() }
      const next = awardAchievements(logEvent({ ...game, sim, npcs: applied.npcs }, evt))
      if (isDead(next)) return die(state, next)
      saveGame(next)
      return { ...state, game: next, toast: `Met ${npc.name}` }
    }

    case 'DO_ACTION': {
      const game = state.game
      if (!game) return state
      let sim = action.minutes ? advanceMinutes(game.sim, action.minutes) : game.sim
      let npcs = game.npcs
      // mark a person as recently seen — resets decay, clears any pending
      // "wants attention", and brightens their mood
      if (action.seenNpc) {
        npcs = npcs.map((n) => {
          if (n.id !== action.seenNpc) return n
          const u = { ...n, lastSeen: sim.totalDays || 0, wantsAttention: false }
          return { ...u, mood: relationshipMood(u, sim.totalDays || 0) }
        })
      }
      const applied = applyEffects(sim, npcs, action.effects || {})
      sim = applied.sim
      // travelling/self-care updates where the character currently is
      if (action.location) sim = { ...sim, location: action.location }
      const evt = { id: uid('evt'), text: action.text, tag: action.tag || summarize(action.effects || {}), timestamp: Date.now() }
      // skipWork marks today's shift as forfeited so auto-work won't also fire.
      const meta = action.skipWork ? { ...game.meta, lastWorkDay: game.sim.totalDays || 0 } : game.meta
      const next = awardAchievements(logEvent({ ...game, sim, npcs: applied.npcs, meta }, evt))
      if (isDead(next)) return die(state, next)
      saveGame(next)
      return { ...state, game: next, toast: action.tag || action.text }
    }

    case 'UPDATE_GOAL': {
      if (!state.game) return state
      const goals = state.game.goals.map((g) => (g.id === action.id ? { ...g, progress: action.progress } : g))
      const next = { ...state.game, goals }
      saveGame(next)
      return { ...state, game: next }
    }

    case 'BUY_ITEM': {
      const game = state.game
      if (!game) return state
      const it = findItem(action.itemId)
      if (!it) return state
      if ((game.sim.cash || 0) < it.price) return { ...state, toast: 'Not enough money.' }

      let sim = { ...game.sim, cash: game.sim.cash - it.price }
      const applied = applyEffects(sim, game.npcs, it.perks || {})
      sim = applied.sim
      if (it.kind === 'property') sim = { ...sim, properties: [...(sim.properties || []), { id: it.id, name: it.name }] }
      if (it.kind === 'vehicle') sim = { ...sim, vehicles: [...(sim.vehicles || []), { id: it.id, name: it.name }] }
      if (it.phone) sim = { ...sim, hasPhone: true }

      let next = { ...game, sim, npcs: applied.npcs }
      // gifts go to inventory; everything non-property/vehicle is an item too
      if (it.kind === 'gift' || it.kind === 'item') {
        next = { ...next, inventory: [...next.inventory, { id: `${it.id}_${Date.now().toString(36)}`, name: it.name, gift: it.gift }] }
      }
      next = awardAchievements(logEvent(next, { id: uid('evt'), text: `Bought ${it.name}.`, tag: '− Money', timestamp: Date.now() }))
      saveGame(next)
      return { ...state, game: next, toast: `Bought ${it.name}` }
    }

    case 'GIFT': {
      const game = state.game
      if (!game) return state
      const { npcId, invId, gain } = action
      const npcs = game.npcs.map((n) => {
        if (n.id !== npcId) return n
        const u = refreshNpcStatus({ ...n, friendship: Math.min(100, n.friendship + gain), trust: Math.min(100, (n.trust ?? 50) + gain / 2), lastSeen: game.sim.totalDays || 0, wantsAttention: false })
        return { ...u, mood: relationshipMood(u, game.sim.totalDays || 0) }
      })
      const npc = game.npcs.find((n) => n.id === npcId)
      const inventory = game.inventory.filter((i) => i.id !== invId)
      const next = logEvent({ ...game, npcs, inventory }, { id: uid('evt'), text: `Gave ${npc?.name} a gift.`, tag: '+ Relationship', timestamp: Date.now() })
      saveGame(next)
      return { ...state, game: next, toast: `+${gain.toFixed(1)} with ${npc?.name}` }
    }

    case 'SEND_MESSAGE': {
      const game = state.game
      if (!game) return state
      const gain = action.gain ?? 0.3
      const npcs = game.npcs.map((n) => {
        if (n.id !== action.npcId) return n
        const u = refreshNpcStatus({ ...n, friendship: Math.min(100, n.friendship + gain), trust: Math.min(100, (n.trust ?? 50) + gain), lastSeen: game.sim.totalDays || 0, wantsAttention: false })
        return { ...u, mood: relationshipMood(u, game.sim.totalDays || 0) }
      })
      const next = { ...game, npcs }
      saveGame(next)
      return { ...state, game: next }
    }

    case 'SAVE': {
      if (state.game) saveGame(state.game)
      return { ...state, toast: 'Game saved.' }
    }
    case 'DELETE_SAVE': {
      clearSave()
      return { screen: 'title', game: null, toast: 'Save deleted.' }
    }
    case 'CLEAR_TOAST':
      return { ...state, toast: null }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const api = useMemo(
    () => ({
      state,
      dispatch,
      go: (screen, focusEventId) => dispatch({ type: 'GO', screen, focusEventId }),
    }),
    [state],
  )
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

export { hasSave } from './persistence.js'

function summarize(effects) {
  const entries = Object.entries(effects || {})
  if (!entries.length) return undefined
  const pretty = (key) => {
    if (key === 'cash') return 'Money'
    if (key === 'performance') return 'Career'
    if (key.startsWith('meters.')) return cap(key.slice(7))
    if (key.startsWith('needs.')) return cap(key.slice(6))
    if (key.startsWith('skill:')) return key.slice(6)
    if (key.startsWith('npc:')) return 'Relationship'
    return key
  }
  let best = entries[0]
  for (const e of entries) if (Number(e[1]) > Number(best[1])) best = e
  const sign = Number(best[1]) >= 0 ? '+' : '−'
  return `${sign} ${pretty(best[0])}`
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
