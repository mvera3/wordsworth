// Procedural people. ~150 first names × ~90 surnames = well over ten thousand
// unique combinations, so the town never feels repetitive. Each generated NPC
// gets a gender, an age, an education record, and an employment status/job.

import { CAREER_TRACKS, ILLEGAL_TRACK, DEGREE_FIELDS, EDU_LEVELS } from './careers.js'

const FEMALE = [
  'Olivia', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
  'Abigail', 'Emily', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Lily', 'Aria', 'Zoe', 'Nora',
  'Hazel', 'Luna', 'Layla', 'Maya', 'Ruby', 'Clara', 'Stella', 'Aurora', 'Violet', 'Iris',
  'Freya', 'Esme', 'Naomi', 'Daisy', 'Eloise', 'Cora', 'Willa', 'Sadie', 'Juniper', 'Wren',
  'Maeve', 'Thea', 'Margot', 'Sienna', 'Delia', 'Mabel', 'Opal', 'Pearl', 'Lena', 'Greta',
]

const MALE = [
  'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore',
  'Jack', 'Levi', 'Alexander', 'Owen', 'Samuel', 'Leo', 'Mason', 'Ethan', 'Logan', 'Daniel',
  'Julian', 'Gabriel', 'Wyatt', 'Carter', 'Caleb', 'Isaac', 'Felix', 'Miles', 'Silas', 'August',
  'Ezra', 'Hugo', 'Arthur', 'Oscar', 'Jasper', 'Milo', 'Elias', 'Cole', 'Rowan', 'Finn',
  'Desmond', 'Victor', 'Roman', 'Dorian', 'Emmett', 'Caspian', 'Soren', 'Atlas', 'Cyrus', 'Reuben',
]

const NEUTRAL = [
  'Alex', 'Riley', 'Jordan', 'Taylor', 'Casey', 'Quinn', 'Avery', 'Morgan', 'Skyler', 'Reese',
  'Rowan', 'Sage', 'River', 'Phoenix', 'Charlie', 'Emerson', 'Finley', 'Hayden', 'Remy', 'Frankie',
  'Sasha', 'Robin', 'Marlowe', 'Lennon', 'Ellis', 'Arden', 'Blair', 'Dakota', 'Shay', 'Wren',
]

const SURNAMES = [
  'Chen', 'Vale', 'Ortiz', 'Hayes', 'Brooks', 'Reyes', 'Park', 'Nguyen', 'Bennett', 'Cole',
  'Frost', 'Sato', 'Marsh', 'Quinn', 'Rowe', 'Diaz', 'Webb', 'Hale', 'Flynn', 'Okafor',
  'Lindqvist', 'Moreau', 'Ferreira', 'Kapoor', 'Novak', 'Bauer', 'Costa', 'Ivanov', 'Haddad', 'Mori',
  'Ashford', 'Calloway', 'Delacroix', 'Esposito', 'Fairbanks', 'Garrett', 'Holloway', 'Ishikawa', 'Jansen', 'Kowalski',
  'Larsen', 'Mercer', 'Nakamura', 'Olsen', 'Petrov', 'Quintero', 'Rosenthal', 'Sullivan', 'Tanaka', 'Underwood',
  'Vargas', 'Whitlock', 'Yamamoto', 'Zimmer', 'Abara', 'Beaumont', 'Castellano', 'Donnelly', 'Eklund', 'Fontaine',
  'Greenwood', 'Hartley', 'Imani', 'Jovanovic', 'Keller', 'Lockhart', 'Maddox', 'Norrington', 'Ferro', 'Pemberton',
  'Ravenscroft', 'Solberg', 'Thorne', 'Ueda', 'Volkov', 'Westbrook', 'Adeyemi', 'Blackwood', 'Crane', 'Dvorak',
  'Engle', 'Fairchild', 'Gallagher', 'Halloran', 'Ibarra', 'Jennings', 'Khoury', 'Larkin', 'Montrose', 'Nikolaidis',
]

const GENDERS = [
  { key: 'female', weight: 46, symbol: '♀', label: 'Female' },
  { key: 'male', weight: 46, symbol: '♂', label: 'Male' },
  { key: 'nonbinary', weight: 8, symbol: '⚧', label: 'Non-binary' },
]

// ── Appearance & dating-profile banks ──
const ETHNICITIES = ['White', 'Hispanic', 'East Asian', 'Black', 'South Asian', 'Middle Eastern', 'Southeast Asian', 'Mediterranean', 'Mixed-race', 'Latino']
const HAIR_COLORS = ['jet-black', 'black', 'dark brown', 'brown', 'light brown', 'dirty blonde', 'blonde', 'platinum blonde', 'auburn', 'red', 'silver', 'dyed pastel']
const HAIR_STYLES = ['long and straight', 'long and wavy', 'short and cropped', 'curly', 'shoulder-length', 'tied back in a ponytail', 'braided', 'in a neat bob', 'tousled', 'in an undercut', 'in loose curls', 'buzzed short']
const EYE_COLORS = ['brown', 'dark brown', 'hazel', 'green', 'blue', 'grey', 'amber']
const BUILDS = ['slim', 'athletic', 'average', 'curvy', 'petite', 'tall and lean', 'stocky', 'muscular', 'soft']
const PERSONALITIES = ['easygoing', 'ambitious', 'witty', 'a little shy', 'adventurous', 'laid-back', 'bubbly', 'thoughtful', 'sarcastic', 'warm', 'driven', 'creative', 'no-nonsense', 'hopelessly romantic', 'spontaneous']
const INTERESTS = ['hiking', 'painting', 'live music', 'cooking', 'gaming', 'travel', 'photography', 'yoga', 'reading', 'dancing', 'coffee culture', 'old films', 'running', 'gardening', 'volunteering', 'astronomy', 'street food', 'thrifting', 'rock climbing', 'baking']
const SEEKING = ['something serious', 'taking it slow', 'seeing where it goes', 'new connections', 'a genuine partner', 'fun and adventure']

const pick = (arr, rand = Math.random) => arr[Math.floor(rand() * arr.length)]

// Distinct picks from an array.
function pickSome(arr, count, rand = Math.random) {
  const pool = [...arr]
  const out = []
  for (let i = 0; i < count && pool.length; i++) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  return out
}

// Height in cm, loosely distributed by gender.
function heightFor(genderKey, rand = Math.random) {
  if (genderKey === 'female') return 150 + Math.round(rand() * 25) // 150–175
  if (genderKey === 'male') return 165 + Math.round(rand() * 28) // 165–193
  return 155 + Math.round(rand() * 33) // 155–188
}

// A full physical profile + dating blurb. Override any field via opts.appearance.
function appearanceFor(genderKey, rand = Math.random, override = {}) {
  const heightCm = heightFor(genderKey, rand)
  // Keep build plausible for height (no "petite" giants or "tall and lean" shorties).
  let builds = BUILDS
  if (heightCm >= 180) builds = BUILDS.filter((b) => b !== 'petite')
  else if (heightCm <= 160) builds = BUILDS.filter((b) => b !== 'tall and lean')
  return {
    ethnicity: pick(ETHNICITIES, rand),
    hair: pick(HAIR_COLORS, rand),
    hairStyle: pick(HAIR_STYLES, rand),
    eyes: pick(EYE_COLORS, rand),
    heightCm,
    build: pick(builds, rand),
    personality: pick(PERSONALITIES, rand),
    interests: pickSome(INTERESTS, 2 + Math.floor(rand() * 2), rand),
    seeking: pick(SEEKING, rand),
    ...override,
  }
}

// Format a height in cm as both imperial and metric, e.g. `5'7" · 170 cm`.
export function formatHeight(cm) {
  if (!cm) return '—'
  const totalIn = Math.round(cm / 2.54)
  const ft = Math.floor(totalIn / 12)
  const inch = totalIn % 12
  return `${ft}'${inch}" · ${cm} cm`
}

function pickGender(rand = Math.random) {
  const total = GENDERS.reduce((s, g) => s + g.weight, 0)
  let r = rand() * total
  for (const g of GENDERS) {
    r -= g.weight
    if (r <= 0) return g
  }
  return GENDERS[0]
}

export function genderMeta(key) {
  return GENDERS.find((g) => g.key === key) || GENDERS[0]
}

function firstNameFor(genderKey, rand = Math.random) {
  // mostly gendered names, with a chance of a neutral name for anyone
  if (rand() < 0.18) return pick(NEUTRAL, rand)
  if (genderKey === 'female') return pick(FEMALE, rand)
  if (genderKey === 'male') return pick(MALE, rand)
  return pick(NEUTRAL, rand)
}

// Education record appropriate to an age.
function educationFor(age, rand = Math.random) {
  if (age < 13) return { level: rand() < 0.5 ? 'None' : 'Elementary', field: null }
  if (age < 18) return { level: rand() < 0.5 ? 'Middle School' : 'High School', field: null }
  const roll = rand()
  let level
  if (roll < 0.4) level = 'High School'
  else if (roll < 0.72) level = 'Bachelor'
  else if (roll < 0.9) level = 'Master'
  else level = 'Doctorate'
  const field = ['Bachelor', 'Master', 'Doctorate'].includes(level) ? pick(DEGREE_FIELDS, rand) : null
  return { level, field }
}

// Employment status + job title appropriate to an age/education.
function employmentFor(age, edu, rand = Math.random) {
  if (age < 18) return { status: 'Student', jobTitle: null, trackName: null }
  if (age <= 22 && rand() < 0.5) return { status: 'Student', jobTitle: null, trackName: null }

  const roll = rand()
  if (roll < 0.62) {
    // employed: pick a track + a level skewed toward lower rungs
    const tracks = rand() < 0.05 ? [ILLEGAL_TRACK] : Object.values(CAREER_TRACKS)
    const track = pick(tracks, rand)
    const maxIdx = track.levels.length - 1
    const idx = Math.min(maxIdx, Math.floor(Math.abs(rand() - rand()) * (maxIdx + 1)))
    return { status: 'Employed', jobTitle: track.levels[idx].title, trackName: track.name }
  }
  if (roll < 0.8 && edu.level !== 'None' && EDU_LEVELS.indexOf(edu.level) >= 3) {
    return { status: 'Graduate', jobTitle: null, trackName: null }
  }
  return { status: 'Unemployed', jobTitle: null, trackName: null }
}

let n = 0
// Generate a fully-fleshed NPC. Pass `seed` opts to override any field.
export function makeNPC(opts = {}, rand = Math.random) {
  const gender = opts.gender ? genderMeta(opts.gender) : pickGender(rand)
  const first = opts.first || firstNameFor(gender.key, rand)
  const last = opts.last || pick(SURNAMES, rand)
  const age = opts.age ?? 16 + Math.floor(rand() * 50)
  const education = opts.education || educationFor(age, rand)
  const employment = opts.employment || employmentFor(age, education, rand)
  const appearance = appearanceFor(gender.key, rand, opts.appearance || {})

  return {
    id: opts.id || `npc_${Date.now().toString(36)}_${n++}`,
    name: `${first} ${last}`,
    gender: gender.key,
    age,
    education,
    employment: employment.status,
    jobTitle: employment.jobTitle,
    trackName: employment.trackName,
    appearance,
    friendship: opts.friendship ?? 5 + Math.floor(rand() * 18),
    romance: opts.romance ?? Math.floor(rand() * 8),
    status: 'Acquaintance',
    met: opts.met ?? Date.now(),
  }
}

// A short human description of an NPC's standing in life.
export function lifeSummary(npc) {
  if (npc.employment === 'Student') return 'Student'
  if (npc.employment === 'Employed') return npc.jobTitle ? `${npc.jobTitle}` : 'Employed'
  if (npc.employment === 'Graduate') return `Graduate · ${npc.education?.field || 'seeking work'}`
  return 'Unemployed'
}
