// Achievements — checked against game state after each meaningful action.
// `check(game)` returns true once earned.

export const ACHIEVEMENTS = [
  { id: 'first_job', name: 'On the Payroll', desc: 'Land your first job.', check: (g) => !!g.sim.job },
  { id: 'graduate', name: 'Scholar', desc: 'Earn a Bachelor’s degree or higher.', check: (g) => ['Bachelor', 'Master', 'Doctorate'].includes(g.sim.education?.level) },
  { id: 'rich', name: 'Six Figures', desc: 'Hold $100,000 at once.', check: (g) => (g.sim.cash || 0) >= 100000 },
  { id: 'millionaire', name: 'Millionaire', desc: 'Hold $1,000,000 at once.', check: (g) => (g.sim.cash || 0) >= 1000000 },
  { id: 'homeowner', name: 'Homeowner', desc: 'Buy a property.', check: (g) => (g.sim.properties || []).length > 0 },
  { id: 'driver', name: 'On the Road', desc: 'Buy a vehicle.', check: (g) => (g.sim.vehicles || []).length > 0 },
  { id: 'social', name: 'Social Butterfly', desc: 'Know 8 or more people.', check: (g) => (g.npcs || []).length >= 8 },
  { id: 'in_love', name: 'In Love', desc: 'Reach a romance of 60+ with someone.', check: (g) => (g.npcs || []).some((n) => n.romance >= 60) },
  { id: 'saint', name: 'Saintly', desc: 'Reach 95+ Kindness.', check: (g) => (g.sim.kindness || 0) >= 95 },
  { id: 'villain', name: 'Down a Dark Road', desc: 'Reach 50+ Evilness.', check: (g) => (g.sim.evilness || 0) >= 50 },
  { id: 'pure_evil', name: 'Pure Evil', desc: 'Reach 100 Evilness.', check: (g) => (g.sim.evilness || 0) >= 100 },
  { id: 'criminal', name: 'Rap Sheet', desc: 'Get caught committing a crime.', check: (g) => (g.sim.criminalRecord || 0) > 0 },
  { id: 'promoted', name: 'Moving Up', desc: 'Earn a promotion.', check: (g) => (g.sim.job?.levelIndex || 0) >= 1 },
]

// Return the list of newly-earned achievement ids given prior earned ids.
export function newlyEarned(game, earned = []) {
  const set = new Set(earned)
  return ACHIEVEMENTS.filter((a) => !set.has(a.id) && a.check(game)).map((a) => a.id)
}
