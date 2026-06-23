// Static game data: trait/profession/aspiration catalogs, seed content, event pools.

export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']

export const NEED_KEYS = ['hunger', 'energy', 'hygiene', 'bladder', 'fun', 'social', 'comfort']

export const NEED_LABELS = {
  hunger: 'Hunger',
  energy: 'Energy',
  hygiene: 'Hygiene',
  bladder: 'Bladder',
  fun: 'Fun',
  social: 'Social',
  comfort: 'Comfort',
}

// Skills, grouped for the Skills menu. The original 8 are kept (careers depend
// on them); the rest expand the spec's social/mental/physical/pro/criminal sets.
export const SKILL_CATEGORIES = {
  Social: ['Charisma', 'Persuasion', 'Manipulation', 'Leadership', 'Negotiation'],
  Mental: ['Logic', 'Creativity', 'Strategy', 'Memory'],
  Physical: ['Fitness', 'Fighting', 'Endurance', 'Strength'],
  Professional: ['Writing', 'Coding', 'Business', 'Finance', 'Marketing', 'Teaching', 'Cooking', 'Music', 'Painting', 'Gardening'],
  Criminal: ['Pickpocketing', 'Lockpicking', 'Deception', 'Hacking', 'Intimidation'],
}

export const SKILL_KEYS = Object.values(SKILL_CATEGORIES).flat()

export const TRAIT_CATALOG = [
  { name: 'Creative', desc: 'Gains Creativity faster and unlocks richer writing events.' },
  { name: 'Introverted', desc: 'Social drains slower, but recharges best alone.' },
  { name: 'Empathetic', desc: 'Builds relationships more quickly through conversation.' },
  { name: 'Perfectionist', desc: 'Higher skill gains, but happiness dips when work is rushed.' },
  { name: 'Ambitious', desc: 'Career performance rises faster; idle days sting.' },
  { name: 'Cheerful', desc: 'Baseline happiness stays buoyant through setbacks.' },
  { name: 'Athletic', desc: 'Energy and health hold up under strain.' },
  { name: 'Bookworm', desc: 'Logic and Writing skills climb with study.' },
  { name: 'Romantic', desc: 'Romance blossoms more readily.' },
  { name: 'Frugal', desc: 'Spends less; finances stay stable.' },
  { name: 'Night Owl', desc: 'Thrives in the Evening and Night blocks.' },
  { name: 'Adventurous', desc: 'World events lean more rewarding.' },
]

export const AGE_STAGES = ['Child', 'Teen', 'Adult', 'Elder']

export const ASPIRATIONS = [
  // Creative & artistic
  { title: 'Bestselling Novelist', desc: 'Write and publish a beloved book.' },
  { title: 'Master Artist', desc: 'Become a celebrated painter or sculptor.' },
  { title: 'Chart-Topping Musician', desc: 'Make music the whole town hums.' },
  { title: 'Acclaimed Filmmaker', desc: 'Tell stories that move an audience.' },
  { title: 'Renowned Poet', desc: 'Find beauty in words and share it.' },

  // Mind & mastery
  { title: 'Renaissance Soul', desc: 'Reach a high level in four different skills.' },
  { title: 'Jack of All Trades', desc: 'Dabble in a little of everything.' },
  { title: 'Grandmaster Strategist', desc: 'Outthink every problem with pure logic.' },
  { title: 'Coding Prodigy', desc: 'Build a reputation as a brilliant engineer.' },
  { title: 'Published Scholar', desc: 'Devote your life to learning and teaching.' },

  // People & relationships
  { title: 'Beloved Friend', desc: 'Build deep relationships across the town.' },
  { title: 'Soulmate', desc: 'Find a lifelong partner and a love that lasts.' },
  { title: 'Heart of the Town', desc: 'Be the name on everyone’s lips.' },
  { title: 'Big Happy Family', desc: 'Raise a warm, sprawling family.' },
  { title: 'Social Butterfly', desc: 'Never meet a stranger you can’t charm.' },

  // Wealth & career
  { title: 'Quiet Fortune', desc: 'Save a comfortable nest egg through steady work.' },
  { title: 'Self-Made Millionaire', desc: 'Build a seven-figure fortune from nothing.' },
  { title: 'Corporate Titan', desc: 'Climb to the very top of the ladder.' },
  { title: 'Serial Entrepreneur', desc: 'Turn bold ideas into thriving businesses.' },
  { title: 'Real Estate Mogul', desc: 'Own properties all over the map.' },
  { title: 'Financial Freedom', desc: 'Earn enough to never worry about money.' },

  // Body & grit
  { title: 'Peak Athlete', desc: 'Push your body to its absolute limit.' },
  { title: 'Martial Arts Master', desc: 'Master discipline of body and mind.' },
  { title: 'Marathon Legend', desc: 'Outlast everyone through sheer endurance.' },

  // Lifestyle & craft
  { title: 'World Traveler', desc: 'See as much of the world as one life allows.' },
  { title: 'Master Chef', desc: 'Cook food people travel miles to taste.' },
  { title: 'Green Thumb', desc: 'Grow a garden that’s the envy of the street.' },
  { title: 'Homeowner', desc: 'Put down roots in a place of your own.' },
  { title: 'Devoted Collector', desc: 'Assemble a collection worth showing off.' },

  // Virtue & legacy
  { title: 'Pillar of Virtue', desc: 'Live a life of unshakeable kindness.' },
  { title: 'Generous Philanthropist', desc: 'Give back, and leave the town better.' },
  { title: 'Local Hero', desc: 'Be the one people can always count on.' },
  { title: 'Inner Peace', desc: 'Find calm and contentment above all else.' },
  { title: 'Living Legend', desc: 'Build a reputation that outlives you.' },

  // The darker path
  { title: 'Criminal Mastermind', desc: 'Pull off the perfect life of crime.' },
  { title: 'Feared Kingpin', desc: 'Rule the underworld through fear and power.' },
  { title: 'Master Manipulator', desc: 'Bend everyone around you to your will.' },
  { title: 'Untouchable Outlaw', desc: 'Break every rule and never get caught.' },
]

export const PRONOUN_OPTIONS = ['she / her', 'he / him', 'they / them', 'ze / zir']

export const LOCATIONS = [
  { id: 'home', name: 'Home', blurb: 'Rest, write, and recover in your own space.' },
  { id: 'park', name: 'Park', blurb: 'Fresh air lifts your mood and sparks ideas.' },
  { id: 'gym', name: 'Gym', blurb: 'Train your body and burn off restlessness.' },
  { id: 'cafe', name: 'Cafe', blurb: 'Caffeine, conversation, and quiet productivity.' },
  { id: 'library', name: 'Library', blurb: 'Study in silence; Logic and Writing flourish.' },
  { id: 'oddjob', name: 'Odd Jobs', blurb: 'Quick cash, no commitment. For your day job, see Work & Study.' },
]

// ---- Seed sim (the "Alex Morgan" example from the mockup) -------------------

export function makeSeedState() {
  return {
    sim: {
      id: 'sim_alex',
      firstName: 'Alex',
      lastName: 'Morgan',
      age: 25,
      ageStage: 'Adult',
      pronouns: 'they / them',
      profession: 'Freelance Writer',
      job: { trackId: 'writing', levelIndex: 1, performance: 58, sinceDay: 0, company: 'Meridian Press', wage: 26, schedule: { id: 'day', label: 'Writing & Media', days: [0, 1, 2, 3, 4], start: 9 * 60, end: 17 * 60 } },
      education: { level: 'High School', field: null, progress: 0, enrolledIn: null },
      season: 'Spring',
      day: 1,
      year: 1,
      totalDays: 0,
      timeMin: 8 * 60,
      timeBlock: 'Morning',
      criminalRecord: 0,
      probationUntil: 0,
      location: 'home',
      gender: 'Non-Binary',
      sexuality: 'Bisexual',
      kindness: 82,
      evilness: 0,
      mentalHealth: 72,
      stress: 28,
      reputation: 52,
      properties: [],
      vehicles: [],
      achievements: [],
      hasPhone: true,
      cash: 12342,
      needs: {
        hunger: 72,
        energy: 64,
        hygiene: 80,
        bladder: 70,
        fun: 66,
        social: 58,
        comfort: 75,
      },
      meters: { happiness: 74, creativity: 81, health: 69 },
      skills: {
        Writing: { level: 4, xp: 35 },
        Charisma: { level: 2, xp: 60 },
        Logic: { level: 3, xp: 20 },
        Fitness: { level: 1, xp: 40 },
        Cooking: { level: 2, xp: 10 },
        Music: { level: 1, xp: 0 },
        Painting: { level: 1, xp: 25 },
        Gardening: { level: 1, xp: 5 },
      },
      traits: ['Creative', 'Introverted', 'Empathetic', 'Perfectionist'],
      bio: "Alex is a passionate writer who finds beauty in everyday moments. Raised in a small coastal town, they moved to the city to chase a quieter, more deliberate life — one measured in pages, not paychecks. Mornings are for fiction; evenings are for the people they love.",
      likes: ['Rainy days', 'Black coffee', 'Old bookshops'],
      dislikes: ['Crowds', 'Small talk', 'Deadlines'],
      hobbies: ['Writing', 'Reading', 'Long walks'],
      aspiration: 'Bestselling Novelist',
      currency: '$',
    },
    npcs: [
      { id: 'npc_jamie', name: 'Jamie Chen', gender: 'female', age: 27, education: { level: 'Bachelor', field: 'Literature' }, employment: 'Employed', jobTitle: 'Staff Writer', trackName: 'Writing & Media', friendship: 72, romance: 18, trust: 65, status: 'Close Friend', lastSeen: 0, met: Date.now() },
      { id: 'npc_robin', name: 'Robin Vale', gender: 'nonbinary', age: 24, education: { level: 'High School', field: null }, employment: 'Student', jobTitle: null, trackName: null, friendship: 45, romance: 5, trust: 50, status: 'Friend', lastSeen: 0, met: Date.now() },
      { id: 'npc_sam', name: 'Sam Ortiz', gender: 'male', age: 26, education: { level: 'Bachelor', field: 'Business' }, employment: 'Employed', jobTitle: 'Analyst', trackName: 'Business & Finance', friendship: 38, romance: 40, trust: 45, status: 'Crush', lastSeen: 0, met: Date.now() },
    ],
    events: seedEvents(),
    journal: seedEvents(),
    inventory: [
      { id: 'inv_notebook', name: 'Leather Notebook' },
      { id: 'inv_pen', name: 'Fountain Pen' },
      { id: 'inv_coffee', name: 'Bag of Coffee Beans' },
      { id: 'inv_umbrella', name: 'Worn Umbrella' },
      { id: 'inv_novel', name: 'Unfinished Manuscript' },
      { id: 'inv_plant', name: 'Desk Fern' },
    ],
    goals: [
      { id: 'goal_novel', title: 'Finish the first draft', progress: 42 },
      { id: 'goal_friends', title: 'Reconnect with three friends', progress: 66 },
      { id: 'goal_save', title: 'Save €15,000', progress: 82 },
    ],
    running: false,
    speed: 1,
    pendingScenario: null,
    pendingMatch: null,
    dating: false,
    gameOver: false,
    meta: { turn: 0, createdAt: Date.now() },
  }
}

// Three seeded events lifted straight from the mockup feed.
function seedEvents() {
  const now = Date.now()
  return [
    {
      id: 'evt_seed_1',
      text: 'Wrote a short story before sunrise.',
      tag: '+ Creativity',
      timestamp: now - 2 * 60 * 1000,
    },
    {
      id: 'evt_seed_2',
      text: 'Had a deep conversation with Jamie.',
      tag: '+ Relationship',
      timestamp: now - 18 * 60 * 1000,
    },
    {
      id: 'evt_seed_3',
      text: 'Felt inspired by the rain.',
      tag: '+ Mood',
      timestamp: now - 47 * 60 * 1000,
    },
  ]
}
