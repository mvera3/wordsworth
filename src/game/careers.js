// Career & education systems.
//
// Every job lives in a TRACK — an ordered promotion ladder. Entry-level rungs
// need no degree (dishwasher, janitor, fast-food crew…); higher rungs gate on
// education level/field, a skill threshold, days-on-the-job, and performance.
// Hourly wages are rough real-world figures (in the sim's display currency).
// One work shift = 8 hours. There is also an ILLEGAL track: high pay, real risk
// of getting caught.

export const SHIFT_HOURS = 8
export const STUDY_HOURS = 8

// Education ladder. Each level must be completed before the next. Bachelor and
// up carry a chosen FIELD, which some jobs require.
export const EDU_LEVELS = ['None', 'Elementary', 'Middle School', 'High School', 'Bachelor', 'Master', 'Doctorate']

export const EDU_RANK = Object.fromEntries(EDU_LEVELS.map((l, i) => [l, i]))

// Study-days (8h each) to complete a level. Kept short so degrees are reachable.
export const EDU_DAYS = {
  Elementary: 12,
  'Middle School': 12,
  'High School': 16,
  Bachelor: 24,
  Master: 16,
  Doctorate: 24,
}

export const DEGREE_FIELDS = [
  'Computer Science',
  'Medicine',
  'Nursing',
  'Business',
  'Education',
  'Law',
  'Engineering',
  'Fine Arts',
  'Literature',
  'Science',
]

// Helper to keep level definitions terse.
const lvl = (title, wage, opts = {}) => ({
  title,
  wage, // hourly
  reqEdu: opts.edu || null, // { level, field? }
  reqSkill: opts.skill || null, // { name, level }
  reqDays: opts.days ?? 4, // game-days at the previous rung before promotion
  reqPerf: opts.perf ?? 60, // performance needed to promote
  ...opts,
})

export const CAREER_TRACKS = {
  food: {
    id: 'food',
    name: 'Food Service',
    blurb: 'Start at the sink, work your way to the pass.',
    skill: 'Cooking',
    levels: [
      lvl('Dishwasher', 11, { days: 0, perf: 0 }),
      lvl('Fast Food Crew', 12, { days: 3 }),
      lvl('Line Cook', 15, { days: 5, skill: { name: 'Cooking', level: 3 } }),
      lvl('Cook', 18, { days: 6 }),
      lvl('Sous Chef', 24, { days: 8, skill: { name: 'Cooking', level: 6 } }),
      lvl('Head Chef', 33, { days: 10, perf: 75 }),
      lvl('Executive Chef', 48, { days: 12, perf: 80, edu: { level: 'High School' } }),
    ],
  },
  cleaning: {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    blurb: 'Keep the world running. No degree required.',
    skill: 'Fitness',
    levels: [
      lvl('Street Sweeper', 11, { days: 0, perf: 0 }),
      lvl('Janitor', 12, { days: 3 }),
      lvl('Custodian', 14, { days: 5 }),
      lvl('Maintenance Tech', 19, { days: 7 }),
      lvl('Facilities Supervisor', 26, { days: 9, perf: 75 }),
      lvl('Facilities Manager', 35, { days: 11, perf: 80 }),
    ],
  },
  retail: {
    id: 'retail',
    name: 'Retail',
    blurb: 'From the bagging line to the corner office.',
    skill: 'Charisma',
    levels: [
      lvl('Bagger', 11, { days: 0, perf: 0 }),
      lvl('Cashier', 13, { days: 3 }),
      lvl('Sales Associate', 15, { days: 5, skill: { name: 'Charisma', level: 3 } }),
      lvl('Shift Lead', 19, { days: 7 }),
      lvl('Assistant Manager', 26, { days: 9, perf: 72 }),
      lvl('Store Manager', 36, { days: 11, perf: 78 }),
      lvl('Regional Manager', 55, { days: 14, perf: 82, edu: { level: 'Bachelor', field: 'Business' } }),
    ],
  },
  writing: {
    id: 'writing',
    name: 'Writing & Media',
    blurb: 'Words for hire — talent matters more than diplomas.',
    skill: 'Writing',
    levels: [
      lvl('Blogger', 9, { days: 0, perf: 0 }),
      lvl('Freelance Writer', 18, { days: 3, skill: { name: 'Writing', level: 3 } }),
      lvl('Staff Writer', 26, { days: 5 }),
      lvl('Columnist', 35, { days: 7, skill: { name: 'Writing', level: 6 } }),
      lvl('Editor', 48, { days: 9, perf: 75 }),
      lvl('Senior Editor', 65, { days: 11, perf: 80 }),
      lvl('Editor-in-Chief', 90, { days: 14, perf: 85, skill: { name: 'Writing', level: 9 } }),
    ],
  },
  tech: {
    id: 'tech',
    name: 'Technology',
    blurb: 'Build software. Degrees help you climb faster.',
    skill: 'Logic',
    levels: [
      lvl('IT Support', 20, { days: 0, perf: 0 }),
      lvl('Junior Developer', 28, { days: 4, skill: { name: 'Logic', level: 3 } }),
      lvl('Software Developer', 42, { days: 6, edu: { level: 'Bachelor', field: 'Computer Science' } }),
      lvl('Senior Developer', 60, { days: 8, skill: { name: 'Logic', level: 6 } }),
      lvl('Tech Lead', 82, { days: 10, perf: 78 }),
      lvl('Engineering Manager', 105, { days: 12, perf: 82 }),
      lvl('Chief Technology Officer', 165, { days: 16, perf: 88, edu: { level: 'Master', field: 'Computer Science' } }),
    ],
  },
  medicine: {
    id: 'medicine',
    name: 'Medicine',
    blurb: 'Heal people. The top rungs demand a doctorate.',
    skill: 'Logic',
    levels: [
      lvl('Nursing Aide', 16, { days: 0, perf: 0 }),
      lvl('Registered Nurse', 32, { days: 5, edu: { level: 'Bachelor', field: 'Nursing' } }),
      lvl('Medical Resident', 40, { days: 7, edu: { level: 'Doctorate', field: 'Medicine' } }),
      lvl('Physician', 75, { days: 9, perf: 78 }),
      lvl('Specialist', 110, { days: 11, perf: 82 }),
      lvl('Surgeon', 150, { days: 13, perf: 86 }),
      lvl('Chief of Medicine', 200, { days: 16, perf: 90 }),
    ],
  },
  education: {
    id: 'education',
    name: 'Education',
    blurb: 'Teach the next generation.',
    skill: 'Charisma',
    levels: [
      lvl('Teaching Aide', 14, { days: 0, perf: 0 }),
      lvl('Substitute Teacher', 20, { days: 4, edu: { level: 'High School' } }),
      lvl('Teacher', 30, { days: 6, edu: { level: 'Bachelor', field: 'Education' } }),
      lvl('Senior Teacher', 40, { days: 8, perf: 75 }),
      lvl('Department Head', 52, { days: 10, perf: 80 }),
      lvl('Principal', 70, { days: 12, perf: 84, edu: { level: 'Master', field: 'Education' } }),
      lvl('Professor', 95, { days: 15, perf: 88, edu: { level: 'Doctorate', field: 'Education' } }),
    ],
  },
  business: {
    id: 'business',
    name: 'Business & Finance',
    blurb: 'Climb the corporate ladder to the C-suite.',
    skill: 'Charisma',
    levels: [
      lvl('Intern', 15, { days: 0, perf: 0 }),
      lvl('Junior Analyst', 26, { days: 4 }),
      lvl('Analyst', 38, { days: 6, edu: { level: 'Bachelor', field: 'Business' } }),
      lvl('Associate', 55, { days: 8, perf: 74 }),
      lvl('Manager', 80, { days: 10, perf: 78 }),
      lvl('Director', 120, { days: 12, perf: 83 }),
      lvl('Vice President', 200, { days: 15, perf: 87, edu: { level: 'Master', field: 'Business' } }),
      lvl('Chief Executive Officer', 350, { days: 20, perf: 92 }),
    ],
  },
  arts: {
    id: 'arts',
    name: 'Arts & Music',
    blurb: 'From busking to the big stage.',
    skill: 'Music',
    levels: [
      lvl('Street Performer', 7, { days: 0, perf: 0 }),
      lvl('Session Musician', 16, { days: 3, skill: { name: 'Music', level: 3 } }),
      lvl('Band Member', 26, { days: 5 }),
      lvl('Recording Artist', 45, { days: 7, skill: { name: 'Music', level: 6 } }),
      lvl('Headliner', 80, { days: 9, perf: 80 }),
      lvl('Music Producer', 120, { days: 11, perf: 84 }),
      lvl('Living Legend', 250, { days: 16, perf: 90, skill: { name: 'Music', level: 10 } }),
    ],
  },
  law: {
    id: 'law',
    name: 'Law',
    blurb: 'The bar is high — literally.',
    skill: 'Logic',
    levels: [
      lvl('Legal Clerk', 16, { days: 0, perf: 0 }),
      lvl('Paralegal', 24, { days: 4, edu: { level: 'Bachelor', field: 'Law' } }),
      lvl('Associate Lawyer', 55, { days: 6, edu: { level: 'Doctorate', field: 'Law' } }),
      lvl('Lawyer', 80, { days: 8, perf: 78 }),
      lvl('Senior Partner', 140, { days: 11, perf: 84 }),
      lvl('Judge', 200, { days: 15, perf: 90 }),
    ],
  },
  trades: {
    id: 'trades',
    name: 'Skilled Trades',
    blurb: 'Honest work with your hands.',
    skill: 'Fitness',
    levels: [
      lvl('Apprentice', 16, { days: 0, perf: 0 }),
      lvl('Electrician', 26, { days: 5 }),
      lvl('Journeyman', 36, { days: 7 }),
      lvl('Master Tradesperson', 50, { days: 9, perf: 78 }),
      lvl('Contractor', 70, { days: 11, perf: 82 }),
      lvl('Construction Firm Owner', 110, { days: 14, perf: 86, edu: { level: 'High School' } }),
    ],
  },
  public: {
    id: 'public',
    name: 'Public Service',
    blurb: 'Serve and protect.',
    skill: 'Fitness',
    levels: [
      lvl('Cadet', 18, { days: 0, perf: 0 }),
      lvl('Police Officer', 26, { days: 4, edu: { level: 'High School' } }),
      lvl('Detective', 38, { days: 6, skill: { name: 'Logic', level: 5 } }),
      lvl('Sergeant', 48, { days: 8, perf: 76 }),
      lvl('Lieutenant', 60, { days: 10, perf: 80 }),
      lvl('Captain', 78, { days: 12, perf: 84 }),
      lvl('Chief of Police', 100, { days: 15, perf: 88 }),
    ],
  },
}

// Illegal career — flagged so the UI can warn, and the engine can roll a
// "caught" risk on every shift (handled in engine.workShift).
export const ILLEGAL_TRACK = {
  id: 'underworld',
  name: 'The Underworld',
  illegal: true,
  blurb: 'Fast money, faster trouble. Each shift risks getting caught.',
  skill: 'Charisma',
  levels: [
    lvl('Pickpocket', 25, { days: 0, perf: 0, risk: 0.18 }),
    lvl('Shoplifter', 40, { days: 3, risk: 0.2 }),
    lvl('Burglar', 70, { days: 5, risk: 0.24 }),
    lvl('Con Artist', 120, { days: 7, skill: { name: 'Charisma', level: 5 }, risk: 0.22 }),
    lvl('Smuggler', 200, { days: 9, perf: 75, risk: 0.28 }),
    lvl('Crime Boss', 350, { days: 12, perf: 82, risk: 0.3 }),
    lvl('Kingpin', 600, { days: 16, perf: 90, risk: 0.34 }),
  ],
}

export const ALL_TRACKS = { ...CAREER_TRACKS, underworld: ILLEGAL_TRACK }

export const getTrack = (id) => ALL_TRACKS[id] || null

// Does the sim meet the requirement for a given level definition?
export function meetsRequirement(sim, def) {
  if (!def) return true
  if (def.reqEdu) {
    const have = EDU_RANK[sim.education?.level || 'None'] ?? 0
    const need = EDU_RANK[def.reqEdu.level] ?? 0
    if (have < need) return false
    if (def.reqEdu.field && sim.education?.field !== def.reqEdu.field) return false
  }
  if (def.reqSkill) {
    const s = sim.skills?.[def.reqSkill.name]
    if (!s || s.level < def.reqSkill.level) return false
  }
  return true
}

// Plain-English reason the sim can't take/promote into a level (or null if ok).
export function requirementReason(sim, def) {
  if (!def) return null
  if (def.reqEdu) {
    const have = EDU_RANK[sim.education?.level || 'None'] ?? 0
    const need = EDU_RANK[def.reqEdu.level] ?? 0
    if (have < need || (def.reqEdu.field && sim.education?.field !== def.reqEdu.field)) {
      return `Needs ${def.reqEdu.level}${def.reqEdu.field ? ` in ${def.reqEdu.field}` : ''}`
    }
  }
  if (def.reqSkill) {
    const s = sim.skills?.[def.reqSkill.name]
    if (!s || s.level < def.reqSkill.level) return `Needs ${def.reqSkill.name} Lvl ${def.reqSkill.level}`
  }
  return null
}

export const nextEduLevel = (current) => {
  const i = EDU_RANK[current ?? 'None'] ?? 0
  return EDU_LEVELS[i + 1] || null
}

export const fieldRequired = (level) => ['Bachelor', 'Master', 'Doctorate'].includes(level)
