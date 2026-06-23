// Morality, alignment, identity options, and the legendary Ascension paths.

export const GENDERS = ['Female', 'Male', 'Non-Binary', 'Other']
export const SEXUALITIES = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual']

// Crime detection: base for a normal character; Pure Evil slashes it.
export const BASE_CRIME_DETECTION = 0.2
export const PURE_EVIL_CRIME_DETECTION = 0.07

// Ascension thresholds. Reached only after long, consistent play.
export const ASCENSIONS = {
  angelic: { id: 'angelic', title: 'The Angelic One', emoji: '👼', tint: '#E8B84B' },
  enlightened: { id: 'enlightened', title: 'The Enlightened One', emoji: '⚖️', tint: '#8A7CFF' },
  titan: { id: 'titan', title: 'The Titan', emoji: '🏛️', tint: '#E8B84B' },
  puppet: { id: 'puppet', title: 'The Puppet Master', emoji: '🎭', tint: '#8A7CFF' },
  evil: { id: 'evil', title: 'Pure Evil', emoji: '😈', tint: '#E05B6C' },
}

// Derive the active ascension (or null). Mutually demanding requirements keep
// these rare and intentional — you don't reach them by accident.
export function deriveAlignment(sim) {
  const k = sim.kindness ?? 80
  const e = sim.evilness ?? 0
  const m = sim.skills?.Manipulation?.level ?? 0
  const wealth = sim.cash ?? 0

  if (e >= 100) return ASCENSIONS.evil
  if (k >= 100 && e < 10) return ASCENSIONS.angelic
  if (m >= 10) return ASCENSIONS.puppet
  if (wealth >= 1000000) return ASCENSIONS.titan
  if (k >= 40 && k <= 60 && e >= 40 && e <= 60 && (sim.skills?.Logic?.level ?? 0) >= 8)
    return ASCENSIONS.enlightened
  return null
}

// A plain moral label for the dashboard, independent of full ascension.
export function moralLabel(sim) {
  const k = sim.kindness ?? 80
  const e = sim.evilness ?? 0
  if (e >= 100) return 'Pure Evil'
  if (e >= 60) return 'Villainous'
  if (e >= 30) return 'Corrupt'
  if (k >= 90) return 'Saintly'
  if (k >= 70) return 'Kind'
  if (k >= 40) return 'Decent'
  return 'Morally Grey'
}

export function reputationLabel(rep) {
  if (rep >= 85) return 'Renowned'
  if (rep >= 65) return 'Respected'
  if (rep >= 45) return 'Known'
  if (rep >= 25) return 'Obscure'
  return 'Notorious'
}

// ---- Life Paths ------------------------------------------------------------
// Three competing trajectories. The highest score is the character's current
// path. Neutral peaks when kindness and evilness are balanced AND engaged
// (a blank 0/0 sim isn't "enlightened-neutral").
const RIGHTEOUS_TIERS = ['Untested', 'Decent Soul', 'Good-Hearted', 'Virtuous', 'Saintly', 'The Angelic One']
const NEUTRAL_TIERS = ['Undefined', 'Adaptable', 'Even-Handed', 'Centered', 'Balanced', 'The Enlightened One']
const DEMONIC_TIERS = ['Innocent', 'Mischievous', 'Corrupt', 'Cruel', 'Villainous', 'Pure Evil']

const tierFor = (tiers, score) => (score >= 100 ? tiers[5] : tiers[Math.min(4, Math.floor(score / 20))])

export function lifePaths(sim) {
  const k = Math.round(sim.kindness ?? 80)
  const e = Math.round(sim.evilness ?? 0)
  const engagement = Math.min(1, (k + e) / 100)
  const neutral = Math.round((100 - Math.abs(k - e)) * engagement)

  const paths = [
    { id: 'righteous', name: 'Righteous Path', emoji: '😇', tint: '#E8B84B', score: k, tier: tierFor(RIGHTEOUS_TIERS, k), desc: 'Compassion, honesty, and care for others.' },
    { id: 'neutral', name: 'Neutral Path', emoji: '⚖️', tint: '#8A7CFF', score: neutral, tier: tierFor(NEUTRAL_TIERS, neutral), desc: 'Balance and reason — neither saint nor sinner.' },
    { id: 'demonic', name: 'Demonic Path', emoji: '😈', tint: '#E05B6C', score: e, tier: tierFor(DEMONIC_TIERS, e), desc: 'Cruelty, manipulation, and corruption.' },
  ]
  const current = paths.reduce((a, b) => (b.score > a.score ? b : a))
  return { paths, current }
}

export const isPureEvil = (sim) => (sim.evilness ?? 0) >= 100
export const isAngelic = (sim) => (sim.kindness ?? 0) >= 100 && (sim.evilness ?? 0) < 10

// Effective crime-detection chance, lowered for a Pure Evil character.
export function crimeDetectionChance(sim) {
  return isPureEvil(sim) ? PURE_EVIL_CRIME_DETECTION : BASE_CRIME_DETECTION
}
