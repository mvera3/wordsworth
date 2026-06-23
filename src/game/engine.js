// Pure game logic. Time-based: a 24h clock runs faster than real life. Needs
// decay per game-hour; work/study consume 8h blocks; scenarios fire as time
// passes. Everything here is side-effect free.

import { SEASONS, NEED_KEYS } from './data.js'
import { SHIFT_HOURS, STUDY_HOURS, EDU_DAYS, getTrack, meetsRequirement } from './careers.js'
import { crimeDetectionChance } from './morality.js'

export const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

let idCounter = 0
export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`

export const DAY_MINUTES = 1440

// The work week. Day 0 of a life is a Monday; employed sims auto-work 09:00–17:00
// Monday–Friday (see GameContext TICK).
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const WORK_START = 9 * 60
export const WORK_END = 17 * 60
export const dayOfWeekOf = (totalDays) => WEEKDAYS[((totalDays % 7) + 7) % 7]
export const isWeekday = (totalDays) => ((totalDays % 7) + 7) % 7 < 5

// Per-game-hour decay rates (a lazy day roughly halves most needs).
const HOURLY_DECAY = {
  hunger: 2.4,
  energy: 1.9,
  hygiene: 1.3,
  bladder: 2.6,
  fun: 1.6,
  social: 1.2,
  comfort: 1.1,
}

export function fmtClock(timeMin) {
  const t = ((Math.floor(timeMin) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  const h = Math.floor(t / 60)
  const m = t % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function timeBlockOf(timeMin) {
  const h = Math.floor((timeMin % DAY_MINUTES) / 60)
  if (h < 6) return 'Night'
  if (h < 12) return 'Morning'
  if (h < 18) return 'Afternoon'
  if (h < 22) return 'Evening'
  return 'Night'
}

// The flavored {Schedule_Block} shown to the player — derived from the coarse
// time block AND where they are, so "Morning" reads as "Morning Classes" at
// school but "Morning Shift" at work. Midday (12:00–14:00) reads as a Lunch
// Break everywhere except home/night. Used for display only; scenario filtering
// keys off the raw timeBlock.
const SCHEDULE_LABELS = {
  school: { Morning: 'Morning Classes', Afternoon: 'Afternoon Classes', Evening: 'After-School Club', Night: 'Late Study' },
  work: { Morning: 'Morning Shift', Afternoon: 'Afternoon Shift', Evening: 'Evening Shift', Night: 'Night Shift' },
  home: { Morning: 'Morning Routine', Afternoon: 'Afternoon at Home', Evening: 'Evening Wind-Down', Night: 'Late Night' },
  outside: { Morning: 'Morning Outing', Afternoon: 'Afternoon Out', Evening: 'Evening Out', Night: 'Night Out' },
}

export function scheduleBlockOf(timeMin, location = 'home') {
  const block = timeBlockOf(timeMin)
  const min = ((Math.floor(timeMin) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  const lunch = min >= 12 * 60 && min < 14 * 60
  if (lunch && location !== 'home') return 'Lunch Break'
  return (SCHEDULE_LABELS[location] || SCHEDULE_LABELS.home)[block]
}

// Advance the clock by `mins`, rolling day → season → year → age, accruing
// totalDays for job tenure, and decaying needs over the elapsed hours.
export function advanceMinutes(sim, mins) {
  let timeMin = sim.timeMin + mins
  let day = sim.day
  let totalDays = sim.totalDays || 0
  let seasonIdx = SEASONS.indexOf(sim.season)
  let year = sim.year
  let age = sim.age

  while (timeMin >= DAY_MINUTES) {
    timeMin -= DAY_MINUTES
    day++
    totalDays++
    if (day > 28) {
      day = 1
      seasonIdx++
      if (seasonIdx >= SEASONS.length) {
        seasonIdx = 0
        year++
        age++
      }
    }
  }

  const hours = mins / 60
  const needs = { ...sim.needs }
  const traits = sim.traits || []
  for (const k of NEED_KEYS) {
    let rate = HOURLY_DECAY[k]
    if (traits.includes('Introverted') && k === 'social') rate *= 0.6
    if (traits.includes('Athletic') && k === 'energy') rate *= 0.75
    needs[k] = clamp(needs[k] - rate * hours)
  }

  let next = { ...sim, timeMin, day, totalDays, season: SEASONS[seasonIdx], year, age, needs }
  next = { ...next, meters: deriveMeters(next), timeBlock: timeBlockOf(timeMin) }
  return next
}

export function deriveMeters(sim) {
  const n = sim.needs
  const t = sim.traits || []
  const avgNeed = NEED_KEYS.reduce((s, k) => s + n[k], 0) / NEED_KEYS.length

  let happiness = avgNeed * 0.55 + n.fun * 0.2 + n.social * 0.15 + n.comfort * 0.1
  if (t.includes('Cheerful')) happiness += 6
  if (t.includes('Perfectionist') && (sim.job?.performance ?? 50) < 50) happiness -= 5

  let creativity = (sim.meters?.creativity ?? 50) * 0.6 + n.fun * 0.2 + (n.energy > 40 ? 12 : 0)
  if (t.includes('Creative')) creativity += 6

  let health = n.energy * 0.4 + n.hygiene * 0.25 + n.hunger * 0.2 + n.comfort * 0.15
  if (t.includes('Athletic')) health += 6

  return {
    happiness: clamp(Math.round(happiness)),
    creativity: clamp(Math.round(creativity)),
    health: clamp(Math.round(health)),
  }
}

export function addSkillXp(skills, name, amount) {
  const cur = skills[name] || { level: 1, xp: 0 }
  let xp = cur.xp + amount
  let level = cur.level
  while (xp >= 100) {
    xp -= 100
    level++
  }
  return { ...skills, [name]: { level, xp } }
}

export function applyEffects(sim, npcs, effects = {}) {
  let nextSim = { ...sim, needs: { ...sim.needs }, meters: { ...sim.meters }, skills: { ...sim.skills } }
  let nextNpcs = npcs.map((x) => ({ ...x }))

  for (const [key, raw] of Object.entries(effects)) {
    const val = Number(raw)
    if (key === 'cash') {
      nextSim.cash = Math.max(0, Math.round(nextSim.cash + val))
    } else if (key === 'performance') {
      nextSim.job = nextSim.job
        ? { ...nextSim.job, performance: clamp((nextSim.job.performance ?? 50) + val) }
        : nextSim.job
    } else if (key === 'kindness' || key === 'evilness' || key === 'reputation' || key === 'mentalHealth' || key === 'stress') {
      // morality / standing stats live directly on the sim (kept to 1 decimal)
      nextSim[key] = Math.round(clamp((nextSim[key] ?? 0) + val) * 10) / 10
    } else if (key.startsWith('needs.')) {
      const k = key.slice(6)
      nextSim.needs[k] = clamp(nextSim.needs[k] + val)
    } else if (key.startsWith('meters.')) {
      const k = key.slice(7)
      nextSim.meters[k] = clamp(nextSim.meters[k] + val)
    } else if (key.startsWith('skill:')) {
      nextSim.skills = addSkillXp(nextSim.skills, key.slice(6), val)
    } else if (key.startsWith('npc:')) {
      const [, id, field] = key.split(':')
      nextNpcs = nextNpcs.map((npc) => (npc.id === id ? { ...npc, [field]: clamp(npc[field] + val) } : npc))
    }
  }

  nextSim.meters = deriveMeters(nextSim)
  nextNpcs = nextNpcs.map(refreshNpcStatus)
  return { sim: nextSim, npcs: nextNpcs }
}

// Relationships decay when neglected. The longer since you last interacted,
// the faster friendship/romance/trust slide. Called on each day rollover.
export function decayRelationships(npcs, totalDays) {
  return npcs.map((npc) => {
    const gap = Math.max(0, totalDays - (npc.lastSeen ?? 0))
    if (gap < 2) return npc
    const rate = Math.min(2.5, 0.15 * gap) // accelerates with neglect, capped
    return refreshNpcStatus({
      ...npc,
      friendship: clamp((npc.friendship ?? 0) - rate),
      romance: clamp((npc.romance ?? 0) - rate * 0.8),
      trust: clamp((npc.trust ?? 50) - rate * 0.6),
    })
  })
}

export function refreshNpcStatus(npc) {
  let status = 'Acquaintance'
  if (npc.romance >= 60) status = 'Partner'
  else if (npc.romance >= 35) status = 'Crush'
  else if (npc.friendship >= 70) status = 'Close Friend'
  else if (npc.friendship >= 40) status = 'Friend'
  return { ...npc, status }
}

// How someone feels about how you've been treating them lately, driven by how
// long since you last spent time together (and whether they've been left on
// "read" after reaching out). Partners feel neglect harder than acquaintances.
export function relationshipMood(npc, totalDays = 0) {
  let gap = Math.max(0, totalDays - (npc.lastSeen ?? 0))
  if (npc.wantsAttention) gap += 2 // being ignored after reaching out stings extra
  const partner = npc.status === 'Partner'
  if (gap <= 1) return partner ? 'In love' : 'Happy'
  if (gap <= 3) return 'Content'
  if (gap <= 6) return partner ? 'Lonely' : 'Distant'
  if (gap <= 9) return 'Sad'
  return partner ? 'Furious' : 'Hurt'
}

// Moods that should read as a warning (sour relationship) in the UI.
export const NEGATIVE_MOODS = new Set(['Lonely', 'Distant', 'Sad', 'Hurt', 'Furious'])

// ---- Work --------------------------------------------------------------- //
// One shift of `hours` (defaults to 8). Uses the job's company wage if set.
// Returns { effects, log, caught } given the sim's current job.
export function workShift(sim, hours = SHIFT_HOURS, rand = Math.random) {
  const job = sim.job
  if (!job) return null
  const track = getTrack(job.trackId)
  const def = track?.levels[job.levelIndex]
  if (!def) return null

  const wage = job.wage ?? def.wage
  const pay = Math.round(wage * hours)
  const skillName = track.skill
  const effects = {
    cash: pay,
    performance: 6,
    'needs.energy': -16,
    'needs.hunger': -10,
    'needs.hygiene': -8,
    'needs.fun': -8,
    'needs.social': track.illegal ? 2 : 6,
    [`skill:${skillName}`]: 14,
  }

  // Illegal work: chance of getting caught (lowered for a Pure Evil character).
  // Punishment (probation vs. prison, escalating) is resolved by the reducer.
  if (track.illegal) {
    if (rand() < crimeDetectionChance(sim)) {
      return { caught: true, title: def.title }
    }
  }

  return {
    caught: false,
    effects,
    log: `Worked a ${Math.round(hours)}-hour shift as a ${def.title}. Earned ${pay}.`,
    tag: '+ Money',
  }
}

// Flat catch chance for any illegal shift.
export const ILLEGAL_CATCH_CHANCE = 0.2

// ~112 game-days make a year (4 seasons × 28 days); a month is a twelfth of that.
export const YEAR_DAYS = 112
export const MONTH_DAYS = Math.round(YEAR_DAYS / 12)

// Escalating consequence for being caught, based on how many priors the sim has.
// 1st: 6 months probation (no prison time). 2nd: 1 year. 3rd+: 3 years (max).
export function arrestSentence(priors) {
  const record = (priors || 0) + 1
  if (record === 1) return { record, type: 'probation', days: 6 * MONTH_DAYS, label: '6 months probation' }
  if (record === 2) return { record, type: 'prison', days: YEAR_DAYS, label: '1 year in prison' }
  return { record, type: 'prison', days: 3 * YEAR_DAYS, label: '3 years in prison' }
}

// Advance the calendar by whole days WITHOUT the usual hourly need-decay (used
// for serving prison time — you're fed and housed, if miserably). Needs land at
// a bleak institutional baseline and the clock resets to morning.
export function serveTime(sim, days) {
  let totalDays = (sim.totalDays || 0) + days
  let dayCount = sim.day + days
  let seasonIdx = SEASONS.indexOf(sim.season)
  let year = sim.year
  let age = sim.age
  while (dayCount > 28) {
    dayCount -= 28
    seasonIdx++
    if (seasonIdx >= SEASONS.length) {
      seasonIdx = 0
      year++
      age++
    }
  }
  const needs = { hunger: 55, energy: 60, hygiene: 45, bladder: 70, fun: 25, social: 30, comfort: 35 }
  let next = {
    ...sim,
    timeMin: 8 * 60,
    day: dayCount,
    totalDays,
    season: SEASONS[seasonIdx],
    year,
    age,
    needs,
  }
  return { ...next, meters: deriveMeters(next), timeBlock: timeBlockOf(next.timeMin) }
}

// ---- Study -------------------------------------------------------------- //
// An 8h study day toward the enrolled education level. Returns progress delta.
export function studyDay(sim) {
  const enr = sim.education?.enrolledIn
  if (!enr) return null
  const days = EDU_DAYS[enr.level] || 16
  const delta = Math.ceil(100 / days)
  return {
    delta,
    effects: {
      'skill:Logic': 12,
      'needs.energy': -12,
      'needs.fun': -8,
      'meters.creativity': 3,
    },
    log: `Studied for ${STUDY_HOURS} hours toward ${enr.level}${enr.field ? ` in ${enr.field}` : ''}.`,
    tag: '+ Logic',
  }
}

// Can the sim be promoted to the next rung of their current track?
export function promotionInfo(sim) {
  const job = sim.job
  if (!job) return { canPromote: false }
  const track = getTrack(job.trackId)
  const nextDef = track?.levels[job.levelIndex + 1]
  if (!nextDef) return { canPromote: false, maxed: true }

  const daysAtLevel = (sim.totalDays || 0) - (job.sinceDay || 0)
  const perfOk = (job.performance ?? 50) >= nextDef.reqPerf
  const daysOk = daysAtLevel >= nextDef.reqDays
  const reqOk = meetsRequirement(sim, nextDef)

  return {
    canPromote: perfOk && daysOk && reqOk,
    nextDef,
    daysAtLevel,
    perfOk,
    daysOk,
    reqOk,
  }
}

export function relTime(ts, now = Date.now()) {
  const diff = Math.max(0, now - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
