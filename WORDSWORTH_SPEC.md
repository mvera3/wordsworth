# Wordsworth — Build Spec

> A text-based life simulation game.
> Studio: **Arcanoire Studio**
> Tagline: *A life in words.*

This document is a build brief for Claude Code. Hand it the whole file and ask it to scaffold the app, then build screen by screen. Everything below is derived from the attached mobile mockup ("Life in Words" / Alex Morgan overview).

---

## 1. Concept

A Sims/Paralives-style life sim with **no graphics** — only text, status bars, and buttons. The player advances a life one decision at a time. Core loop: read the sim's state → take an action → time advances → an event fires → repeat. The appeal is cozy, narrative, slow-life simulation rendered entirely in clean typographic UI.

**Platform:** Mobile-first single-page web app (the mockup is a phone). Must also work on desktop.

---

## 2. Tech stack

- **React + Vite + Tailwind CSS** (matches existing Lumen toolchain)
- State: React `useState`/`useReducer` + Context for the global game state. No backend required for v1.
- Persistence: in-app save/load via an in-memory store first; add localStorage adapter only when running outside a sandbox.
- No graphics/canvas. Type, color, and layout only.
- Keep it a single deployable static build (Cloudflare Pages friendly).

---

## 3. Visual design

Pulled directly from the mockup.

### Palette
| Token | Hex | Use |
|---|---|---|
| `--bg-deep` | `#0B0E1F` | App background, top of gradient |
| `--bg-panel` | `#141A33` | Cards / panels |
| `--bg-panel-2` | `#1B2342` | Nested rows, inputs |
| `--accent` | `#5B6CFF` | Primary buttons, active bars |
| `--accent-2` | `#8A7CFF` | Gradient pair / creativity bar |
| `--gold` | `#E8B84B` | Finance / money accents |
| `--text-hi` | `#EDEFFA` | Headings |
| `--text-mid` | `#A6ADCB` | Body / labels |
| `--text-dim` | `#6B7299` | Captions, timestamps |
| `--stroke` | `#262E4E` | Hairline borders |

Background is a vertical deep-indigo gradient (`--bg-deep` → near-black) with a subtle purple glow. Panels are slightly lighter with soft rounded corners (16px radius) and a 1px `--stroke` border. Liquid-glass feel: faint translucency / backdrop blur on cards.

### Type
- **Display** (headings like "Life in Words", sim name): a characterful but clean sans — e.g. *Bricolage Grotesque*, *Hanken Grotesk*, or *Space Grotesk*. Used large and tight.
- **Body / UI**: *Inter* (labels, buttons, paragraphs).
- **Numeric / data**: tabular figures (Inter with `font-variant-numeric: tabular-nums`) for stat percentages and money.

### Components
- **Status bar**: label left, percentage right, thin rounded track below, filled with `--accent` (or gradient for Creativity). ~6px tall.
- **Card**: rounded panel, label + sublabel + optional right-aligned value or icon.
- **Pill / tab**: rounded segmented control (Overview / Stats / Traits / Background).
- **Trait chip**: small rounded outline pill.
- **Primary button**: filled `--accent`, big radius, icon + label + sub-label (e.g. "Continue / Next Turn").
- **Bottom nav**: 5 icons — Home, World, Journal, Goals, Menu.

---

## 4. Screens

### 4.1 Home (Dashboard) — left phone in mockup
- Header: hamburger menu, "Life in Words" display title, "A text-based life simulation" subtitle, people/relationships icon top-right.
- **Your Sim** card: avatar placeholder, name, "25 y/o · Aspiring Writer", a primary need readout ("Happiness 74%") with bar.
- 2×2 quick-stat grid:
  - **Needs** — "All good"
  - **Relationships** — "3 Active"
  - **Career** — "Freelance Writer · Level 2"
  - **Finance** — "€12,342 · Stable"
- **Latest Events** list (feed): icon + event text + tag (e.g. "+ Creativity") + timestamp ("2m ago"). "View all" link.
- Two big buttons: **Continue** (Next Turn) and **New Day** (Advance time).
- Bottom nav.

### 4.2 Character / Overview — right phone in mockup
- Back chevron, "Alex Morgan" title, "Overview" subtitle, "..." menu.
- Tabs: **Overview · Stats · Traits · Background**.
- 3-up info row: **Age 25 · Profession Aspiring Writer · Season Spring**.
- **Status** section: bars for Happiness, Energy, Creativity, Health (Creativity uses the gradient fill).
- **Personality Traits**: chips — Creative, Introverted, Empathetic, Perfectionist.
- **About Alex**: a paragraph bio.
- Footer cards: **Journal 12 entries · Relationships 3 active · Inventory 6 items**.

### 4.3 Remaining screens (build after the two above)
- **Stats tab**: full needs/skill breakdown with bars.
- **Traits tab**: full trait list + descriptions.
- **Background tab**: backstory, family tree, life history log.
- **World**: travel menu (Home, Park, Gym, Cafe, Library, Work…) with location events.
- **Journal**: chronological life-event log (the "Latest Events" feed, full).
- **Goals**: aspiration + milestones with progress.
- **Menu**: save/load, settings, new game, about.
- **Character creation** flow (see §6).

---

## 5. Game systems

### Needs (decay over time, restored by actions)
Hunger, Energy, Hygiene, Bladder, Fun, Social, Comfort. Plus higher-level meters shown on Overview: **Happiness, Creativity, Health** (derived/aggregate).

### Skills
Writing, Charisma, Logic, Fitness, Cooking, Music, Painting, Gardening — level + XP bar each.

### Relationships
Per-NPC friendship and romance values, a status label, and a contacts list. v1 can ship with 3 seeded NPCs (e.g. Jamie from the mockup event).

### Career
Job title, level, performance meter, salary, "go to work" action.

### Finance
Cash balance, income, recurring bills, simple buy/sell. Currency shown as € in mockup — make it configurable.

### Time
Turn-based. "Continue / Next Turn" advances a block (morning/afternoon/evening/night); "New Day" jumps a full day. Track Day, Season (Spring…), Year, and sim Age.

### Events
After each turn, possibly fire an event: a line of narrative + stat deltas (tags like "+ Creativity") + timestamp. Some events are passive (logged), some are **choice prompts** (2–3 buttons that branch). The three seeded events from the mockup: "Wrote a short story (+Creativity)", "Had a deep conversation with Jamie (+Relationship)", "Felt inspired by the rain (+Mood)".

---

## 6. Character creation (new game)

Stepped flow, one panel per step, matching the design language:
1. Name (first/last)
2. Age stage
3. Pronouns
4. Personality traits — pick exactly 4 (chips)
5. Aspiration / life goal
6. Starting profession
7. Likes / dislikes / hobbies
8. Confirm → generates the sim and lands on Home.

---

## 7. State shape (suggested)

```ts
type Sim = {
  id: string;
  firstName: string; lastName: string;
  age: number; ageStage: 'Child'|'Teen'|'Adult'|'Elder';
  pronouns: string;
  profession: string; careerLevel: number; performance: number; salary: number;
  season: 'Spring'|'Summer'|'Autumn'|'Winter'; day: number; year: number; timeBlock: 'Morning'|'Afternoon'|'Evening'|'Night';
  cash: number;
  needs: Record<'hunger'|'energy'|'hygiene'|'bladder'|'fun'|'social'|'comfort', number>; // 0–100
  meters: Record<'happiness'|'creativity'|'health', number>; // 0–100, derived
  skills: Record<string, { level: number; xp: number }>;
  traits: string[];
  bio: string;
  likes: string[]; dislikes: string[];
};

type NPC = { id: string; name: string; friendship: number; romance: number; status: string };

type GameEvent = {
  id: string; text: string; tag?: string; timestamp: number;
  choices?: { label: string; effects: Partial<Record<string, number>> }[];
};

type GameState = {
  sim: Sim;
  npcs: NPC[];
  events: GameEvent[]; // newest first
  journal: GameEvent[];
  inventory: { id: string; name: string }[];
  goals: { id: string; title: string; progress: number }[];
};
```

---

## 8. Build order

1. Scaffold Vite + React + Tailwind; wire the palette tokens as Tailwind theme colors and load the three fonts.
2. Shared components: `StatusBar`, `Card`, `Pill/Tabs`, `TraitChip`, `PrimaryButton`, `BottomNav`.
3. **Home** screen (static data first).
4. **Overview** screen with all four tabs.
5. Game reducer: needs decay, turn advance, event generation, stat deltas.
6. Wire actions → reducer → re-render.
7. Character creation flow.
8. World / Journal / Goals / Menu.
9. Save/Load.
10. Polish: transitions between screens, reduced-motion support, keyboard focus states, mobile + desktop layouts.

---

## 9. Quality floor
- Responsive: designed at phone width, scales up cleanly.
- Visible keyboard focus rings; all actions reachable by keyboard.
- Respect `prefers-reduced-motion`.
- Tabular numerals for all stats and money.
- No localStorage in sandboxed preview; use in-memory state, add persistence behind a flag.

---

*Reference: the attached "Life in Words" mockup is the source of truth for layout and palette. Title is **Wordsworth**; the in-app hero text in the mockup reads "Life in Words" and can be used as the home-screen header or swapped for the final title.*
