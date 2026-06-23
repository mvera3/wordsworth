// Schedules for school and jobs. A schedule is a set of weekdays + an hour
// window. Jobs come from companies, each with its own shift; you can't take a
// job whose hours clash with school (or you'd be in two places at once).

import { fmtClock } from './engine.js'

export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const dowIndex = (totalDays) => ((totalDays % 7) + 7) % 7

// School runs a fixed weekday timetable.
export const SCHOOL_SCHEDULE = { id: 'school', label: 'School', days: [0, 1, 2, 3, 4], start: 8 * 60, end: 15 * 60 }

// Default fallback for legacy jobs without a stored schedule.
export const DEFAULT_SHIFT = { id: 'day', label: 'Standard', days: [0, 1, 2, 3, 4], start: 9 * 60, end: 17 * 60 }

// Shift templates companies draw from (none cross midnight, to keep math clean).
export const SHIFT_TEMPLATES = [
  { id: 'day', days: [0, 1, 2, 3, 4], start: 9 * 60, end: 17 * 60 },
  { id: 'early', days: [0, 1, 2, 3, 4], start: 6 * 60, end: 14 * 60 },
  { id: 'late', days: [0, 1, 2, 3, 4], start: 14 * 60, end: 22 * 60 },
  { id: 'midweek', days: [1, 2, 3], start: 8 * 60, end: 18 * 60 },
  { id: 'weekend', days: [4, 5, 6], start: 10 * 60, end: 18 * 60 },
  { id: 'parttime', days: [2, 3, 4, 5, 6], start: 12 * 60, end: 17 * 60 },
  { id: 'evenings', days: [0, 1, 2, 3, 4], start: 16 * 60, end: 23 * 60 },
]

const PREFIX = ['Apex', 'Northwind', 'Riverside', 'Summit', 'Vertex', 'Crestline', 'Brightpath', 'Ironwood', 'Lakeside', 'Meridian', 'Golden Oak', 'Silverline', 'Nova', 'Hearthstone', 'Maple', 'Beacon', 'Harbor', 'Atlas', 'Cedar', 'Onyx']
const SUFFIX = ['Group', 'Co.', 'Inc.', 'Solutions', 'Partners', 'Works', 'Labs', 'Industries', 'Collective', 'Holdings']

const pick = (a, rand = Math.random) => a[Math.floor(rand() * a.length)]

export function scheduleHours(s) {
  return (s.end - s.start) / 60
}

// Human-readable schedule, e.g. "Mon–Fri · 09:00–17:00".
export function fmtSchedule(s) {
  if (!s) return '—'
  const days = s.days.map((d) => DOW[d])
  // collapse a contiguous run into a range
  let label
  const isRun = s.days.every((d, i) => i === 0 || d === s.days[i - 1] + 1)
  if (s.days.length >= 3 && isRun) label = `${DOW[s.days[0]]}–${DOW[s.days[s.days.length - 1]]}`
  else label = days.join(', ')
  return `${label} · ${fmtClock(s.start)}–${fmtClock(s.end)}`
}

// Two schedules clash if they share any day and overlap in time.
export function conflicts(a, b) {
  if (!a || !b) return false
  const sharedDay = a.days.some((d) => b.days.includes(d))
  if (!sharedDay) return false
  return a.start < b.end && b.start < a.end
}

// All schedules the sim is currently committed to (school + current job).
export function activeSchedules(sim) {
  const out = []
  if (sim.education?.enrolledIn) out.push(SCHOOL_SCHEDULE)
  if (sim.job?.schedule) out.push(sim.job.schedule)
  return out
}

// Is `schedule` blocked for this sim? Taking a new job replaces the old job, so
// only school is a hard conflict when applying.
export function scheduleConflictReason(sim, schedule) {
  if (sim.education?.enrolledIn && conflicts(schedule, SCHOOL_SCHEDULE)) return 'Clashes with school'
  return null
}

// True if the sim is "on the clock" for `schedule` right now.
export function isOnSchedule(sim, schedule) {
  if (!schedule) return false
  return schedule.days.includes(dowIndex(sim.totalDays || 0)) && sim.timeMin >= schedule.start && sim.timeMin < schedule.end
}

// Generate a set of company job offers for a track's entry position.
export function generateOffers(track, sim, count = 4, rand = Math.random) {
  const entry = track.levels[0]
  const used = new Set()
  const offers = []
  for (let i = 0; i < count; i++) {
    let t = pick(SHIFT_TEMPLATES, rand)
    let guard = 0
    while (used.has(t.id) && guard++ < 10) t = pick(SHIFT_TEMPLATES, rand)
    used.add(t.id)
    const schedule = { ...t, label: track.name }
    const wageJitter = 1 + (rand() * 0.2 - 0.08) // −8%..+12%
    offers.push({
      id: `offer_${track.id}_${i}`,
      company: `${pick(PREFIX, rand)} ${pick(SUFFIX, rand)}`,
      schedule,
      wage: Math.max(1, Math.round(entry.wage * wageJitter)),
      conflict: scheduleConflictReason(sim, schedule),
    })
  }
  return offers
}
