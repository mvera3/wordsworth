// Scenarios are location-aware: each is tagged with where it can happen —
// 'home', 'work', 'school', 'outside', or 'any'. The engine only rolls
// scenarios that match the character's current location.
//
// Two tiers:
//  1) Authored choice-scenarios (rich, 4–5 branching paths with morality).
//  2) A procedural generator that combines word-banks into 1000+ short,
//     location-flavored passive events so the world always feels alive.
//
// Effect keys (engine.applyEffects): needs.*, meters.*, cash, performance,
// skill:<Name>, npc:<id>:friendship|romance, kindness, evilness, reputation,
// mentalHealth, stress.  `req`: 'job' | 'student' gates on employment/enrollment.
//
// Each scenario also declares:
//  • cat   — its slot in the 1000-seed matrix (see seedCategory below):
//            'mundane' | 'social' | 'rare' | 'chaos'.
//  • blocks (optional) — the time blocks it can fire in ('Morning' |
//            'Afternoon' | 'Evening' | 'Night'). Omitted = any time of day.

// ───────────────────────── Authored choice-scenarios ─────────────────────────
const AUTHORED = [
  // --- School ---
  {
    id: 'sc_recess', loc: 'school', cat: 'social', blocks: ['Morning', 'Afternoon'], min: 6, max: 12, weight: 4,
    text: 'At recess, the other kids are picking teams. What do you do?',
    choices: [
      { label: 'Jump right in', effects: { 'needs.fun': 18, 'needs.social': 14, 'skill:Fitness': 8 } },
      { label: 'Invite the kid sitting alone', effects: { 'needs.social': 10, kindness: 2, reputation: 2 } },
      { label: 'Watch from the bench', effects: { 'needs.comfort': 6, 'needs.social': -4 } },
      { label: 'Mock the slow kids', effects: { 'needs.fun': 6, evilness: 1, kindness: -2, reputation: -3 } },
    ],
  },
  {
    id: 'sc_class_crush', loc: 'school', cat: 'social', min: 9, max: 16, weight: 3,
    text: 'A folded note lands on your desk: "do you like me? ☐ yes ☐ no".',
    npc: 'npc_sam',
    choices: [
      { label: 'Tick yes', effects: { 'npc:npc_sam:romance': 14, 'needs.fun': 10, 'meters.happiness': 6 } },
      { label: 'Tick no kindly', effects: { 'npc:npc_sam:friendship': 2, kindness: 1 } },
      { label: 'Ignore it', effects: { 'needs.comfort': 4, 'meters.happiness': -2 } },
      { label: 'Read it aloud to embarrass them', effects: { 'npc:npc_sam:friendship': -12, evilness: 2, reputation: -4 } },
    ],
  },
  {
    id: 'sc_school_event', loc: 'school', cat: 'mundane', min: 6, max: 25, weight: 4, req: 'student',
    text: 'A tough assignment is due tomorrow and you’re behind.',
    choices: [
      { label: 'Study harder', effects: { 'skill:Logic': 16, 'needs.energy': -10, stress: 4 } },
      { label: 'Ask a classmate for help', effects: { 'skill:Logic': 8, 'needs.social': 8, kindness: 1 } },
      { label: 'Help a struggling student', effects: { 'skill:Teaching': 12, kindness: 3, reputation: 2 } },
      { label: 'Start a rumor as a distraction', effects: { evilness: 2, 'skill:Manipulation': 10, reputation: -3 } },
      { label: 'Skip class entirely', effects: { 'needs.fun': 10, reputation: -2 } },
    ],
  },
  {
    id: 'sc_exam_cheat', loc: 'school', cat: 'rare', min: 12, max: 25, weight: 3, req: 'student',
    text: 'You could sneak a glance at the top student’s exam.',
    choices: [
      { label: 'Do your honest best', effects: { 'skill:Logic': 12, kindness: 1, stress: 3 } },
      { label: 'Cheat just this once', effects: { 'skill:Deception': 10, evilness: 1.5, kindness: -1 } },
      { label: 'Photograph it and sell answers', effects: { cash: 80, evilness: 3, 'skill:Deception': 15, reputation: -4 } },
    ],
  },

  // --- Work ---
  {
    id: 'sc_work_event', loc: 'work', cat: 'mundane', min: 16, max: 99, weight: 4, req: 'job',
    text: 'A big project lands on your desk. How do you handle it?',
    choices: [
      { label: 'Complete it honestly', effects: { performance: 12, 'skill:Business': 12, 'needs.energy': -12, kindness: 1 } },
      { label: 'Ask a coworker for help', effects: { performance: 6, 'needs.social': 8 } },
      { label: 'Take credit for someone’s work', effects: { performance: 14, evilness: 3, kindness: -3, 'skill:Manipulation': 12 } },
      { label: 'Manipulate coworkers into doing it', effects: { performance: 10, 'skill:Manipulation': 18, evilness: 2, reputation: -2 } },
      { label: 'Flirt with the boss for a pass', effects: { performance: 8, 'skill:Charisma': 12, reputation: -3 } },
    ],
  },
  {
    id: 'sc_overtime', loc: 'work', cat: 'rare', blocks: ['Afternoon', 'Evening'], min: 16, max: 99, weight: 4, req: 'job',
    text: 'Your manager asks you to pull overtime to hit a deadline.',
    choices: [
      { label: 'Put in the extra hours', effects: { cash: 140, performance: 12, 'needs.energy': -20, stress: 8 } },
      { label: 'Negotiate a half-shift', effects: { cash: 70, performance: 4, 'needs.energy': -10, 'skill:Negotiation': 8 } },
      { label: 'Politely decline', effects: { performance: -8, 'needs.comfort': 8 } },
      { label: 'Lie about an emergency', effects: { 'skill:Deception': 12, evilness: 1, stress: -4 } },
    ],
  },
  {
    id: 'sc_credit_theft', loc: 'work', cat: 'chaos', min: 18, max: 99, weight: 3, req: 'job',
    text: 'A coworker takes credit for your work in front of the boss.',
    choices: [
      { label: 'Call it out calmly', effects: { performance: 6, 'skill:Negotiation': 8, reputation: 2 } },
      { label: 'Let it slide', effects: { performance: -6, mentalHealth: -6, stress: 5 } },
      { label: 'Document it and report them', effects: { performance: 8, 'skill:Logic': 8 } },
      { label: 'Sabotage their next project', effects: { evilness: 5, 'skill:Deception': 15, reputation: -4 } },
    ],
  },

  // --- Outside ---
  {
    id: 'sc_stray_cat', loc: 'outside', cat: 'rare', min: 6, max: 99, weight: 3,
    text: 'A thin stray cat watches you from an alley.',
    choices: [
      { label: 'Feed the cat', effects: { kindness: 1.5, 'meters.happiness': 6 } },
      { label: 'Bring it home', effects: { kindness: 2.5, 'needs.comfort': 8, 'meters.happiness': 12, cash: -20 } },
      { label: 'Call animal rescue', effects: { kindness: 2, reputation: 2 } },
      { label: 'Ignore it', effects: { 'needs.comfort': 2 } },
      { label: 'Kick it away', effects: { evilness: 3, kindness: -4, reputation: -3, mentalHealth: -2 } },
    ],
  },
  {
    id: 'sc_found_money', loc: 'outside', cat: 'rare', min: 12, max: 99, weight: 3,
    text: 'A wallet lies on the sidewalk, stuffed with cash and an ID.',
    choices: [
      { label: 'Track down the owner', effects: { kindness: 3, reputation: 4 } },
      { label: 'Hand it to police', effects: { kindness: 2, reputation: 2 } },
      { label: 'Take the cash, ditch the wallet', effects: { cash: 120, evilness: 2, kindness: -3 } },
      { label: 'Leave it where it is', effects: {} },
    ],
  },
  {
    id: 'sc_helping_hand', loc: 'outside', cat: 'social', min: 14, max: 99, weight: 2,
    text: 'An elderly neighbor struggles with heavy groceries.',
    choices: [
      { label: 'Carry them up for free', effects: { kindness: 3, reputation: 3, 'needs.energy': -4 } },
      { label: 'Help, then accept a tip', effects: { kindness: 1, cash: 10 } },
      { label: 'Pretend not to notice', effects: { kindness: -1 } },
      { label: 'Help, then pocket their wallet', effects: { cash: 60, evilness: 4, kindness: -5 } },
    ],
  },
  {
    id: 'sc_charity', loc: 'outside', cat: 'social', min: 18, max: 99, weight: 2,
    text: 'A charity drive is collecting donations downtown.',
    choices: [
      { label: 'Donate generously', effects: { cash: -100, kindness: 4, reputation: 5, 'meters.happiness': 8 } },
      { label: 'Donate a little', effects: { cash: -20, kindness: 1.5, reputation: 1 } },
      { label: 'Volunteer your time', effects: { kindness: 3, reputation: 3, 'needs.energy': -8 } },
      { label: 'Walk past', effects: {} },
      { label: 'Pocket the donation tin', effects: { cash: 200, evilness: 6, kindness: -6, reputation: -8 } },
    ],
  },
  {
    id: 'sc_hangout', loc: 'outside', cat: 'social', blocks: ['Afternoon', 'Evening'], min: 13, max: 35, weight: 3,
    text: 'Friends wave you over to hang out.',
    npc: 'npc_jamie',
    choices: [
      { label: 'Join them', effects: { 'needs.social': 18, 'needs.fun': 14, 'npc:npc_jamie:friendship': 8, 'needs.energy': -8 } },
      { label: 'Stay a short while', effects: { 'needs.social': 8, 'npc:npc_jamie:friendship': 3 } },
      { label: 'Make an excuse', effects: { 'npc:npc_jamie:friendship': -4 } },
    ],
  },

  // --- Home ---
  {
    id: 'sc_burnout', loc: 'home', cat: 'mundane', blocks: ['Evening', 'Night'], min: 16, max: 99, weight: 2,
    text: 'You feel worn thin and running on fumes.',
    choices: [
      { label: 'Take a real break', effects: { 'needs.energy': 16, mentalHealth: 10, stress: -12 } },
      { label: 'Push on anyway', effects: { performance: 6, mentalHealth: -8, stress: 10 } },
      { label: 'Call a friend', effects: { 'needs.social': 12, mentalHealth: 8, stress: -6 } },
    ],
  },
  {
    id: 'sc_confession', loc: 'any', cat: 'chaos', min: 13, max: 40, weight: 2,
    text: 'Someone nervously confesses they have feelings for you.',
    npc: 'npc_sam',
    choices: [
      { label: 'Say you feel the same', effects: { 'npc:npc_sam:romance': 22, 'meters.happiness': 14 } },
      { label: 'Let them down gently', effects: { 'npc:npc_sam:friendship': 4, kindness: 2 } },
      { label: 'Ask for time', effects: { 'npc:npc_sam:romance': 4, stress: 3 } },
      { label: 'String them along for favors', effects: { 'npc:npc_sam:romance': 6, evilness: 3, 'skill:Manipulation': 15, kindness: -3 } },
    ],
  },
  {
    id: 'sc_argument', loc: 'any', cat: 'chaos', min: 14, max: 99, weight: 1,
    text: 'A misunderstanding with someone close turns into an argument.',
    npc: 'npc_jamie',
    choices: [
      { label: 'Apologize first', effects: { 'npc:npc_jamie:friendship': 8, kindness: 1 } },
      { label: 'Talk it through', effects: { 'npc:npc_jamie:friendship': 4, 'skill:Negotiation': 8 } },
      { label: 'Hold your ground', effects: { 'npc:npc_jamie:friendship': -10, stress: 6 } },
      { label: 'Gaslight them', effects: { 'skill:Manipulation': 16, evilness: 4, 'npc:npc_jamie:friendship': -6 } },
    ],
  },
]

// ───────────────────────── Procedural scenario generator ─────────────────────
// Word-banks are combined into tens of thousands of distinct, location- and
// category-appropriate scenarios so pools never feel repetitive. Two kinds are
// produced:
//   • Passive flavor events (cat: 'mundane') — a line of narrative + stat delta.
//   • Branching choice scenarios (cat: 'social' | 'rare' | 'chaos') — a prompt
//     with 4 responses, so every seed band has a deep pool of real decisions.

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const BANK = {
  homeChores: ['tidied the desk', 'did the dishes', 'folded the laundry', 'vacuumed the floor', 'organized the closet', 'watered the plants', 'cleaned the windows', 'reorganized the shelves', 'wiped down the kitchen', 'made the bed', 'sorted the mail', 'dusted the shelves', 'scrubbed the sink', 'took out the recycling', 'swept the hallway', 'changed the sheets'],
  homeLeisure: ['read a few chapters', 'watched an old film', 'put on a full album', 'played a video game', 'baked something sweet', 'tried a new recipe', 'sketched in a notebook', 'took a long bath', 'napped on the couch', 'wrote in a journal', 'rearranged the furniture', 'brewed a slow pot of coffee', 'did a crossword', 'called an old friend', 'started a new book', 'listened to a podcast', 'practiced an instrument', 'people-watched from the window'],
  homeMood: ['felt cozy and safe', 'felt a little restless', 'felt quietly content', 'felt a touch lonely', 'felt suddenly inspired', 'felt pleasantly sleepy', 'felt grateful for the quiet', 'felt the day melt away', 'felt oddly nostalgic', 'felt ready for tomorrow', 'felt completely at ease', 'felt time slow down'],
  outPlace: ['the park', 'the river walk', 'a busy plaza', 'the old market', 'a side street', 'the rooftop garden', 'the bus stop', 'the corner cafe', 'the bookshop', 'the boardwalk', 'the botanical garden', 'the train station', 'the farmers market', 'the waterfront'],
  outSight: ['a street musician playing', 'a dog chasing pigeons', 'a couple sharing an umbrella', 'a mural being painted', 'kids selling lemonade', 'an old man feeding birds', 'a food truck with a long line', 'leaves spiraling in the wind', 'a double rainbow', 'a runner sprinting by', 'a chalk artist at work', 'a flock of starlings turning', 'a busker juggling fire', 'a wedding photo shoot'],
  outDoing: ['took a long walk', 'sat and people-watched', 'window-shopped for an hour', 'grabbed a quick bite', 'found a quiet bench', 'wandered with no plan', 'caught the sunset', 'browsed a flea market', 'fed the ducks', 'snapped a few photos', 'tried a street-food stall', 'followed a busker around', 'rested under a tree', 'watched the boats go by'],
  outWeather: ['Under a clear sky', 'In a light drizzle', 'On a crisp morning', 'In the golden evening light', 'As clouds rolled in', 'On a breezy afternoon', 'Under warm string lights', 'In a soft fog', 'After a sudden shower', 'As the first stars came out', 'In a warm spell', 'Under a heavy grey sky'],
  workTask: ['cleared a backlog of emails', 'sat through a long meeting', 'fixed a last-minute issue', 'prepped a big presentation', 'covered for a sick coworker', 'wrapped a tricky report', 'trained the new hire', 'survived a tense call', 'hit a small milestone', 'reorganized the workflow', 'chased down an approval', 'untangled a spreadsheet', 'rehearsed a pitch', 'closed out a project', 'audited the numbers', 'streamlined a process'],
  workVibe: ['and felt productive', 'and earned a nod from the boss', 'and counted the minutes', 'and bonded with the team', 'and craved a coffee', 'and powered through', 'and learned something new', 'and watched the clock', 'and felt the pressure ease', 'and caught a second wind', 'and traded jokes with a coworker', 'and quietly nailed it'],
  workPlace: ['At the office', 'In the break room', 'At your desk', 'In the conference room', 'On a video call', 'At the front desk', 'Down on the floor', 'In the back room', 'By the coffee machine', 'In the corner cubicle'],
  schoolSubj: ['math class', 'history class', 'science lab', 'the library', 'art class', 'gym class', 'the cafeteria', 'the study hall', 'English class', 'the computer lab', 'music class', 'the assembly'],
  schoolBeat: ['and aced a pop quiz', 'and zoned out by the window', 'and passed notes with a friend', 'and got picked to present', 'and finished early', 'and doodled in the margins', 'and made a new friend', 'and dreaded the homework', 'and asked a good question', 'and almost fell asleep'],
  schoolMood: ['feeling sharp', 'half-asleep', 'full of questions', 'daydreaming', 'eager to leave', 'oddly motivated', 'a little distracted', 'fully focused', 'running on no sleep', 'buzzing with ideas'],
  homeTime: ['Early in the morning', 'Late at night', 'On a lazy afternoon', 'Over the weekend', 'After dinner', 'Just before bed', 'At first light', 'Around midnight', 'On a quiet evening', 'Right after waking', 'In the small hours', 'Mid-afternoon'],
}

const FX = {
  homeChore: { tag: '+ Comfort', effects: { 'needs.comfort': 7, 'needs.fun': 2 } },
  homeLeisure: { tag: '+ Fun', effects: { 'needs.fun': 8, 'needs.comfort': 4 } },
  homeMood: { tag: '+ Mood', effects: { 'meters.happiness': 5, stress: -4 } },
  outWalk: { tag: '+ Health', effects: { 'needs.fun': 6, 'meters.health': 4, 'needs.energy': -3 } },
  outSight: { tag: '+ Mood', effects: { 'meters.happiness': 5, 'meters.creativity': 4 } },
  workTask: { tag: '+ Career', effects: { performance: 4, 'needs.energy': -6 } },
  school: { tag: '+ Logic', effects: { 'skill:Logic': 6, 'needs.energy': -4 } },
}

// ── Choice-scenario word-banks (shared across locations) ──
const PEOPLE = ['a close friend', 'an old friend', 'a good friend', 'a classmate', 'a coworker', 'a neighbor', 'your roommate', 'a friend of a friend', 'an acquaintance', 'a distant cousin', 'a familiar face', 'someone from your circle', 'a friend you rarely see', 'an ex you lost touch with']
const HOOKS = ['to vent about a rough day', 'to share a bit of gossip', 'to ask for a small favor', 'to invite you out this weekend', 'to ask your honest opinion', 'to catch up after ages', 'to borrow something', 'to rope you into a plan', 'to apologize for last time', 'to brag about good news', 'to ask for advice', 'to talk through a problem']
const BEATS = {
  outside: ['waves you over', 'falls into step beside you', 'flags you down', 'catches your eye', 'stops you on the path', 'pulls up a chair beside you', 'calls your name', 'sidles up to you'],
  work: ['stops by your desk', 'catches you in the break room', 'pings you on chat', 'corners you after the meeting', 'drops into the chair across from you', 'lingers by the coffee machine'],
  school: ['slides into the seat beside you', 'catches you in the hall', 'taps your shoulder', 'finds you at lunch', 'walks with you between classes', 'leans over during class'],
  home: ['calls you out of the blue', 'texts you', 'drops by unannounced', 'video-calls you', 'knocks on your door'],
}
const FINDS = ['a fat wallet', 'an envelope thick with cash', 'an abandoned phone', 'a dropped lottery ticket', 'a designer bag', 'an unattended tip jar', 'a bike with the key still in it', 'a gift card', 'a stack of concert tickets', 'a forgotten laptop', 'a roll of banknotes', 'a pricey watch']
const FIND_WHERE = {
  outside: ['on a bench', 'by the fountain', 'under a cafe table', 'on the curb', 'beside a trash bin', 'near the bus stop', 'on a low wall', 'in the grass', 'by the newsstand', 'at the crosswalk', 'on the steps', 'under a tree', 'near the entrance', 'by the bike rack'],
  work: ['in the copy room', 'left in the lobby', 'on an empty desk', 'in the break room', 'by the printer', 'in the elevator', 'near the water cooler', 'in the stairwell'],
  school: ['under a desk', 'in the locker room', 'in the hallway', 'by the lockers', 'in the cafeteria', 'near the gym', 'in the library', 'by the entrance'],
  home: ['on your doorstep', 'in the mail by mistake', 'in a delivery left at your door', 'in the hallway outside', 'wedged under your mat', 'by the mailboxes'],
}
const CHAOS = ['a shouting match erupts nearby', 'a fire alarm suddenly blares', 'two people start shoving each other', 'someone collapses to the ground', 'a thief snatches a bag and bolts', 'a glass shatters and the room goes still', 'a stranger loudly accuses you of something', 'someone gets aggressive with you', 'a small fire starts in a bin', 'a car screeches to a halt inches away', 'panic ripples through the crowd', 'someone is clearly having a panic attack']
const CHAOS_WHERE = {
  outside: ['on the street', 'in the plaza', 'by the entrance', 'at the corner', 'near the market', 'on the platform', 'in the crowd', 'outside the shop', 'along the path', 'by the fountain', 'at the crosswalk', 'near the cafe', 'in the park', 'on the boardwalk'],
  work: ['in the office', 'in the lobby', 'by the elevators', 'in the break room', 'mid-meeting', 'out on the floor', 'in the stairwell', 'near reception', 'in the hallway', 'by the exit'],
  school: ['in the hallway', 'in the cafeteria', 'in class', 'by the lockers', 'in the gym', 'on the stairs', 'in the courtyard', 'near the entrance'],
  home: ['in your building', 'in the hallway outside', 'next door', 'on your street', 'in the stairwell', 'by the entrance'],
}
// People who'd invite you somewhere, and the things they invite you to.
const FRIENDS = ['a close friend', 'your best friend', 'an old friend', 'a group of friends', 'your roommate', 'a coworker', 'a classmate', 'a neighbor', 'someone from your circle', 'a friend you rarely see']
const INVITES = ['to grab dinner out', 'to eat at a new spot', 'to play video games', 'for a game night', 'to hang out and party', 'to a house party', 'to hit the bar for drinks', 'out for a few rounds', 'to catch a movie', 'to a concert', 'to grab coffee', 'to go shopping', 'to a picnic in the park', 'to go dancing', 'on a spontaneous road trip', 'to watch the big game']
// A careless mark and the tell that makes them an easy target (theft opportunity).
const MARKS = ['a distracted tourist', 'a businessman glued to his phone', 'a woman digging through her bag', 'an old man dozing on a bench', 'a teenager lost in their headphones', 'a shopper buried under bags', 'someone asleep on the train', 'a street vendor counting cash', 'a person in a packed crowd', 'a tipsy reveller weaving past']
const TELLS = ['their wallet is sticking halfway out of their back pocket', 'their phone is poking out, easy to reach', 'their bag is gaping wide open and unwatched', 'a fat money clip is half-falling from their coat', 'their purse hangs loose off one shoulder', 'cash is bulging out of their jacket pocket', 'they left their wallet on the table and stepped away', 'their backpack zipper is wide open']

const socialChoices = () => [
  { label: 'Give them your full attention', effects: { 'needs.social': 14, 'needs.fun': 6, kindness: 1, 'meters.happiness': 4 } },
  { label: 'Keep it short and friendly', effects: { 'needs.social': 7, 'needs.comfort': 3 } },
  { label: 'Make a polite excuse', effects: { 'needs.social': -3, 'needs.comfort': 5 } },
  { label: 'Brush them off coldly', effects: { 'needs.social': 2, evilness: 1, kindness: -2, reputation: -2 } },
]
const rareChoices = (cash) => [
  { label: 'Track down the rightful owner', effects: { kindness: 3, reputation: 3, 'meters.happiness': 4 } },
  { label: 'Hand it in', effects: { kindness: 2, reputation: 1 } },
  { label: 'Quietly pocket it', effects: { cash, evilness: 2, kindness: -3, 'skill:Deception': 6 } },
  { label: 'Leave it be', effects: { 'needs.comfort': 2 } },
]
const chaosChoices = (cash) => [
  { label: 'Step in and help', effects: { kindness: 3, reputation: 4, stress: 6, 'needs.energy': -8 } },
  { label: 'Call for help', effects: { kindness: 2, reputation: 2 } },
  { label: 'Keep your head down', effects: { 'needs.comfort': 4, stress: 4, reputation: -1 } },
  { label: 'Turn the chaos to your advantage', effects: { cash, evilness: 4, 'skill:Deception': 12, kindness: -4, reputation: -3 } },
]
const inviteChoices = () => [
  { label: 'Go all in — say yes', effects: { 'needs.social': 18, 'needs.fun': 18, 'needs.energy': -10, cash: -25, 'meters.happiness': 8 } },
  { label: 'Drop by for a bit', effects: { 'needs.social': 9, 'needs.fun': 8, 'needs.energy': -4, cash: -10 } },
  { label: 'Take a rain check', effects: { 'needs.social': -3, 'needs.comfort': 5 } },
  { label: 'Flake at the last minute', effects: { 'needs.social': -5, kindness: -2, reputation: -1, 'needs.comfort': 4 } },
]
const theftChoices = (cash) => [
  { label: 'Walk away — not your business', effects: { 'needs.comfort': 2, kindness: 1 } },
  { label: 'Discreetly tip them off', effects: { kindness: 3, reputation: 2, 'meters.happiness': 3 } },
  { label: 'Lift it cleanly', effects: { cash, evilness: 3, kindness: -3, 'skill:Pickpocketing': 14, stress: 4 } },
  { label: 'Snatch it and bolt', effects: { cash: Math.round(cash * 1.5), evilness: 4, kindness: -4, reputation: -3, 'skill:Pickpocketing': 8, stress: 8 } },
]

// Per-location gating for the generated choice scenarios.
const LOC_OPTS = {
  outside: { min: 6 },
  work: { min: 16, req: 'job' },
  school: { min: 6, max: 25, req: 'student' },
  home: { min: 6 },
}

function generate() {
  const out = []
  let n = 0
  let cn = 0 // drives deterministic cash payouts so a given scenario always pays the same
  const add = (loc, text, fx, opts = {}) =>
    out.push({ id: `g${n++}`, loc, cat: 'mundane', min: opts.min ?? 6, max: opts.max ?? 99, weight: 0.4, req: opts.req, text, tag: fx.tag, effects: fx.effects })
  const addC = (loc, cat, text, choices, opts = {}) =>
    out.push({ id: `c${n++}`, loc, cat, blocks: opts.blocks, min: opts.min ?? 6, max: opts.max ?? 99, weight: opts.weight ?? 1, req: opts.req, text, choices })

  // ─── Passive flavor (mundane) ───
  // HOME
  for (const l of BANK.homeLeisure) for (const c of BANK.homeChores) add('home', `A slow day in — you ${l}, then ${c}.`, FX.homeLeisure)
  for (const l of BANK.homeLeisure) for (const m of BANK.homeMood) add('home', `Home alone, you ${l} and ${m}.`, FX.homeMood)
  for (const c of BANK.homeChores) for (const m of BANK.homeMood) add('home', `You ${c} and ${m}.`, FX.homeChore)
  for (const t of BANK.homeTime) for (const l of BANK.homeLeisure) add('home', `${t}, you ${l}.`, FX.homeLeisure)
  for (const t of BANK.homeTime) for (const c of BANK.homeChores) add('home', `${t}, you ${c}.`, FX.homeChore)
  for (const t of BANK.homeTime) for (const m of BANK.homeMood) add('home', `${t}, you ${m.replace('felt', 'felt')}.`, FX.homeMood)

  // OUTSIDE
  for (const s of BANK.outSight) for (const p of BANK.outPlace) add('outside', `At ${p}, you saw ${s}.`, FX.outSight)
  for (const d of BANK.outDoing) for (const p of BANK.outPlace) add('outside', `You ${d} around ${p}.`, FX.outWalk)
  for (const w of BANK.outWeather) for (const p of BANK.outPlace) add('outside', `${w}, you passed through ${p}.`, FX.outSight)
  for (const w of BANK.outWeather) for (const d of BANK.outDoing) add('outside', `${w}, you ${d}.`, FX.outWalk)
  for (const w of BANK.outWeather) for (const s of BANK.outSight) add('outside', `${w}, you noticed ${s}.`, FX.outSight)
  for (const d of BANK.outDoing) for (const s of BANK.outSight) add('outside', `You ${d} and watched ${s}.`, FX.outWalk)

  // WORK (employed)
  for (const t of BANK.workTask) for (const v of BANK.workVibe) add('work', `You ${t} ${v}.`, FX.workTask, { min: 16, req: 'job' })
  for (const p of BANK.workPlace) for (const t of BANK.workTask) for (const v of BANK.workVibe) add('work', `${p}, you ${t} ${v}.`, FX.workTask, { min: 16, req: 'job' })

  // SCHOOL (enrolled)
  for (const s of BANK.schoolSubj) for (const b of BANK.schoolBeat) add('school', `In ${s}, you sat through the lesson ${b}.`, FX.school, { min: 6, max: 25, req: 'student' })
  for (const s of BANK.schoolSubj) for (const m of BANK.schoolMood) add('school', `You showed up to ${s} ${m}.`, FX.school, { min: 6, max: 25, req: 'student' })
  for (const s of BANK.schoolSubj) for (const m of BANK.schoolMood) for (const b of BANK.schoolBeat) add('school', `In ${s} ${m}, you ${b.replace(/^and /, '')}.`, FX.school, { min: 6, max: 25, req: 'student' })

  // ─── Branching choice scenarios ───
  for (const loc of ['outside', 'work', 'school', 'home']) {
    const opts = LOC_OPTS[loc]

    // SOCIAL — someone approaches you with a reason
    for (const person of PEOPLE) for (const beat of BEATS[loc]) for (const hook of HOOKS) {
      addC(loc, 'social', `${cap(person)} ${beat} ${hook}.`, socialChoices(), opts)
    }

    // SOCIAL — an invitation to do something together
    for (const who of FRIENDS) for (const what of INVITES) {
      addC(loc, 'social', `${cap(who)} invites you ${what}.`, inviteChoices(), opts)
    }

    // RARE — a valuable thing turns up
    for (const thing of FINDS) for (const where of FIND_WHERE[loc]) {
      const cash = 40 + (cn++ % 14) * 15
      addC(loc, 'rare', `You spot ${thing} ${where}.`, rareChoices(cash), opts)
      const cash2 = 40 + (cn++ % 14) * 15
      addC(loc, 'rare', `Half-hidden ${where}, there's ${thing}.`, rareChoices(cash2), opts)
    }

    // RARE — a theft opportunity: a careless mark with something easy to lift.
    // (Not at home — you're not surrounded by strangers there.)
    if (loc !== 'home') for (const mark of MARKS) for (const tell of TELLS) {
      const cash = 60 + (cn++ % 12) * 25
      addC(loc, 'rare', `You notice ${mark} — ${tell}.`, theftChoices(cash), opts)
    }

    // CHAOS — sudden high-impact event
    for (const ev of CHAOS) for (const where of CHAOS_WHERE[loc]) {
      const cash = 25 + (cn++ % 12) * 20
      addC(loc, 'chaos', `Out of nowhere, ${ev} ${where}.`, chaosChoices(cash), opts)
      const cash2 = 25 + (cn++ % 12) * 20
      addC(loc, 'chaos', `${cap(ev)} ${where}.`, chaosChoices(cash2), opts)
    }
  }

  return out
}

export const GENERATED = generate()
export const ALL_SCENARIOS = [...AUTHORED, ...GENERATED]
export const SCENARIO_COUNT = ALL_SCENARIOS.length

// Count by category, for diagnostics / the spec's "1000 pool" framing.
export const SCENARIO_COUNT_BY_CAT = ALL_SCENARIOS.reduce((m, s) => ({ ...m, [s.cat]: (m[s.cat] || 0) + 1 }), {})

// ───────────────────────────── The 1000-seed matrix ─────────────────────────
// A scenario roll draws a seed in [1, 1000]. The band it lands in decides the
// *category* of event, per the design blueprint:
//   1–300   Mundane/Routine    (procedural flavor — finding a seat, chores…)
//   301–600 Social/Character   (acquaintances, gossip, a friend's request…)
//   601–850 Rare/Opportunity   (a dropped wallet, a one-off offer, temptation…)
//   851–1000 High-Impact/Chaos (a confrontation, a confession, an emergency…)
// (The original brief left 601–610 unassigned; Rare absorbs it so every seed
// maps to exactly one category.)
export const SEED_BANDS = [
  { cat: 'mundane', lo: 1, hi: 300 },
  { cat: 'social', lo: 301, hi: 600 },
  { cat: 'rare', lo: 601, hi: 850 },
  { cat: 'chaos', lo: 851, hi: 1000 },
]

export function seedCategory(seed) {
  const band = SEED_BANDS.find((b) => seed >= b.lo && seed <= b.hi)
  return band ? band.cat : 'mundane'
}

// If the rolled category has no scenario valid here/now, slide to the next-best
// category rather than firing nothing. Mundane is the universal backstop — the
// procedural pool always has something for the location. Chaos is kept LAST for
// non-chaos rolls so that a location with no social/rare content (e.g. Home)
// quietly falls back to routine flavor instead of spamming high-impact drama.
const FALLBACK = {
  mundane: ['mundane', 'social', 'rare', 'chaos'],
  social: ['social', 'rare', 'mundane', 'chaos'],
  rare: ['rare', 'social', 'mundane', 'chaos'],
  chaos: ['chaos', 'rare', 'social', 'mundane'],
}

function weightedPick(pool, rand) {
  const total = pool.reduce((sum, s) => sum + (s.weight || 1), 0)
  let roll = rand() * total
  for (const s of pool) {
    roll -= s.weight || 1
    if (roll <= 0) return s
  }
  return pool[pool.length - 1]
}

// Pick a scenario valid for the sim's age, situation, location, AND time block,
// chosen via the 1000-seed matrix. Returns the scenario augmented with the
// `seed`, `category`, and `block` that produced it (for display in the feed /
// scenario card), or null if nothing at all qualifies.
export function pickScenario(sim, location = 'home', block = null, rand = Math.random) {
  const age = sim.age
  const employed = !!sim.job
  const studying = !!sim.education?.enrolledIn
  const ok = (s) => {
    if (age < s.min || age > s.max) return false
    if (s.req === 'job' && !employed) return false
    if (s.req === 'student' && !studying) return false
    if (s.loc !== 'any' && s.loc !== location) return false
    if (block && s.blocks && !s.blocks.includes(block)) return false
    return true
  }

  const seed = 1 + Math.floor(rand() * 1000) // 1..1000
  const category = seedCategory(seed)

  let pool = []
  let resolvedCat = category
  for (const c of FALLBACK[category]) {
    pool = ALL_SCENARIOS.filter((s) => s.cat === c && ok(s))
    if (pool.length) {
      resolvedCat = c
      break
    }
  }
  if (!pool.length) return null

  const scenario = weightedPick(pool, rand)
  return { ...scenario, seed, category: resolvedCat, block }
}
