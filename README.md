# Wordsworth

> A text-based life simulation game. **A life in words.**
> By **Arcanoire Studio**.

A cozy, narrative, Sims/Paralives-style life sim rendered entirely in clean
typographic UI — no graphics, just type, color, status bars, and choices. Read
the moment → take an action → time advances → an event fires → repeat.

## Stack

- **React 18 + Vite 5 + Tailwind CSS 3**
- Global state via `useReducer` + Context (`src/game/GameContext.jsx`)
- Pure game logic in `src/game/engine.js` (needs decay, time advance, event
  generation, effect application, skill leveling)
- Persistence adapter (`src/game/persistence.js`): in-memory by default, auto-
  upgrades to `localStorage` when available — sandbox-safe.
- Single static build, Cloudflare Pages friendly.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  game/
    data.js          # catalogs, seed sim, event pools
    engine.js        # pure game logic
    persistence.js   # save/load adapter
    GameContext.jsx  # reducer + provider + actions
  components/
    Icons.jsx        # inline SVG icon set
    ui.jsx           # StatusBar, Card, Tabs, TraitChip, PrimaryButton, Avatar
    BottomNav.jsx    # Home · World · Journal · Goals · Menu
    PhoneFrame.jsx   # mobile-first device frame
    Toast.jsx        # transient feedback
  screens/
    Title.jsx               # title / continue / quick start
    CharacterCreation.jsx   # 8-step new-game flow
    Home.jsx                # dashboard (Life in Words)
    Overview.jsx            # Overview · Stats · Traits · Background tabs
    World.jsx               # travel + relationships
    Journal.jsx             # full event log + choice resolution
    Goals.jsx               # aspiration + milestones
    Menu.jsx                # save/load, inventory, about
  App.jsx            # screen router
  main.jsx           # entry
```

## Game systems

- **Needs** (decay over time): hunger, energy, hygiene, bladder, fun, social,
  comfort. Aggregated into **Happiness, Creativity, Health** meters.
- **Skills**: Writing, Charisma, Logic, Fitness, Cooking, Music, Painting,
  Gardening — level + XP (100 XP/level).
- **Relationships**: per-NPC friendship & romance with derived status labels.
- **Career**: title, level, performance, salary.
- **Finance**: configurable currency (default €).
- **Time**: turn-based. *Continue* advances one time block; *New Day* jumps four.
  Tracks block → day → season → year → age.
- **Events**: after each turn, a passive logged event or a branching choice
  prompt with 2–3 options that apply stat deltas.

## Design

Palette and layout pulled from the "Life in Words" mockup — deep-indigo
gradient, liquid-glass panels, `Space Grotesk` display + `Inter` body, tabular
numerals for all stats and money. Responsive phone-first, visible focus rings,
and `prefers-reduced-motion` respected.
