import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import {
  Screen,
  ScreenHeader,
  BackButton,
  IconButton,
  Card,
  StatusBar,
  SectionLabel,
  TraitChip,
  Tabs,
} from '../components/ui.jsx'
import { TRAIT_CATALOG, NEED_LABELS, NEED_KEYS, SKILL_CATEGORIES } from '../game/data.js'
import { deriveAlignment, moralLabel, reputationLabel } from '../game/morality.js'
import { IconDots } from '../components/Icons.jsx'

const TABS = ['Dashboard', 'Stats', 'Traits', 'Background']

function Field({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-[12px] text-text-dim shrink-0">{k}</dt>
      <dd className="text-[13px] text-text-hi font-medium text-right truncate">{v}</dd>
    </div>
  )
}

function DashboardTab({ sim, npcs, go }) {
  const cur = sim.currency || '$'
  const align = deriveAlignment(sim)
  const occupation = sim.job ? sim.profession : sim.education?.enrolledIn ? 'Student' : 'Unemployed'
  const degree = sim.education?.field ? `${sim.education.level} · ${sim.education.field}` : sim.education?.level
  const school = sim.education?.enrolledIn
    ? `${sim.education.enrolledIn.level}${sim.education.enrolledIn.field ? ` (${sim.education.enrolledIn.field})` : ''}`
    : '—'
  const activeRel = npcs.filter((n) => n.friendship >= 30 || n.romance >= 30).length

  return (
    <div className="space-y-5 animate-fade-in">
      {align && (
        <Card className="p-4 flex items-center gap-3" style={{ borderColor: `${align.tint}66` }}>
          <span className="text-[26px]">{align.emoji}</span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-text-dim">Ascension</p>
            <p className="text-[15px] font-semibold" style={{ color: align.tint }}>{align.title}</p>
          </div>
        </Card>
      )}

      <div>
        <SectionLabel>Identity</SectionLabel>
        <Card className="p-4">
          <dl className="divide-y divide-stroke/50">
            <Field k="Age" v={`${sim.age}`} />
            <Field k="Gender" v={sim.gender} />
            <Field k="Sexuality" v={sim.sexuality} />
            <Field k="Occupation" v={occupation} />
            <Field k="Education" v={degree} />
            <Field k="Current School" v={school} />
            <Field k="Criminal Record" v={sim.criminalRecord ? `${sim.criminalRecord} prior${sim.criminalRecord === 1 ? '' : 's'}` : 'Clean'} />
            <Field k="Wealth" v={`${cur}${sim.cash.toLocaleString()}`} />
          </dl>
        </Card>
      </div>

      <div>
        <SectionLabel>Well-being</SectionLabel>
        <Card className="p-4 space-y-3.5">
          <StatusBar label="Health" value={sim.meters.health} />
          <StatusBar label="Mental Health" value={sim.mentalHealth} />
          <StatusBar label="Happiness" value={sim.meters.happiness} />
          <StatusBar label="Stress" value={sim.stress} tone="gold" />
        </Card>
      </div>

      <div>
        <SectionLabel>Morality &amp; Standing</SectionLabel>
        <Card className="p-4 space-y-3.5">
          <StatusBar label={`Kindness · ${moralLabel(sim)}`} value={sim.kindness} />
          <StatusBar label="Evilness" value={sim.evilness} tone="low" />
          <StatusBar label={`Reputation · ${reputationLabel(sim.reputation)}`} value={sim.reputation} gradient />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center" onClick={() => go('skills')}>
          <div className="text-[13px] text-text-hi font-semibold">Skills</div>
          <div className="text-[11px] text-text-dim mt-1">view all</div>
        </Card>
        <Card className="p-3 text-center" onClick={() => go('world')}>
          <div className="text-[13px] text-text-hi font-semibold tnum">{activeRel}</div>
          <div className="text-[11px] text-text-dim mt-1">relationships</div>
        </Card>
        <Card className="p-3 text-center" onClick={() => go('shop')}>
          <div className="text-[13px] text-text-hi font-semibold tnum">{(sim.properties?.length || 0) + (sim.vehicles?.length || 0)}</div>
          <div className="text-[11px] text-text-dim mt-1">assets</div>
        </Card>
      </div>
    </div>
  )
}

function StatsTab({ sim }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <SectionLabel>Needs</SectionLabel>
        <Card className="p-4 space-y-3.5">
          {NEED_KEYS.map((k) => (
            <StatusBar key={k} label={NEED_LABELS[k]} value={sim.needs[k]} tone="low" />
          ))}
        </Card>
      </div>
      {Object.entries(SKILL_CATEGORIES).map(([cat, list]) => {
        const owned = list.filter((n) => (sim.skills[n]?.level || 1) > 1 || (sim.skills[n]?.xp || 0) > 0)
        if (!owned.length) return null
        return (
          <div key={cat}>
            <SectionLabel>{cat} Skills</SectionLabel>
            <Card className="p-4 space-y-3">
              {owned.map((name) => {
                const s = sim.skills[name] || { level: 1, xp: 0 }
                return (
                  <div key={name}>
                    <div className="flex items-baseline justify-between mb-1.5 gap-2">
                      <span className="text-[13px] text-text-mid truncate">{name} <span className="text-text-dim">· Lvl {s.level}</span></span>
                      <span className="text-[12px] text-text-dim tnum shrink-0">{s.xp}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-bg-panel-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.xp}%`, background: 'linear-gradient(90deg,#5B6CFF,#8A7CFF)' }} />
                    </div>
                  </div>
                )
              })}
            </Card>
          </div>
        )
      })}
    </div>
  )
}

function TraitsTab({ sim }) {
  return (
    <div className="space-y-3 animate-fade-in">
      <SectionLabel>Your Traits</SectionLabel>
      {TRAIT_CATALOG.filter((t) => sim.traits.includes(t.name)).map((t) => (
        <Card key={t.name} className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-accent-2" />
            <h4 className="text-[14px] text-text-hi font-semibold">{t.name}</h4>
          </div>
          <p className="text-[12.5px] text-text-mid leading-relaxed">{t.desc}</p>
        </Card>
      ))}
    </div>
  )
}

function BackgroundTab({ sim, journal }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <SectionLabel>Backstory</SectionLabel>
        <Card className="p-4">
          <p className="text-[13px] text-text-mid leading-relaxed">{sim.bio}</p>
        </Card>
      </div>
      <div>
        <SectionLabel>Likes &amp; Dislikes</SectionLabel>
        <Card className="p-4 space-y-3">
          <Tags title="Likes" items={sim.likes} tone="accent" />
          <Tags title="Dislikes" items={sim.dislikes} tone="dim" />
          <Tags title="Hobbies" items={sim.hobbies} tone="gold" />
        </Card>
      </div>
      <div>
        <SectionLabel>Life History</SectionLabel>
        <Card className="p-4">
          <ol className="space-y-3">
            {journal.slice(0, 8).map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-[12.5px] text-text-mid leading-snug">{e.text}</span>
              </li>
            ))}
            {journal.length === 0 && <p className="text-[12.5px] text-text-dim">No history yet.</p>}
          </ol>
        </Card>
      </div>
    </div>
  )
}

function Tags({ title, items, tone }) {
  const color = tone === 'accent' ? 'text-accent-2' : tone === 'gold' ? 'text-gold' : 'text-text-dim'
  return (
    <div>
      <div className={`text-[11px] uppercase tracking-wider font-semibold mb-1.5 ${color}`}>{title}</div>
      <div className="flex flex-wrap gap-2">
        {(items || []).map((x) => (
          <span key={x} className="px-2.5 py-1 rounded-full border border-stroke text-[12px] text-text-mid">{x}</span>
        ))}
      </div>
    </div>
  )
}

export default function Overview() {
  const { state, go } = useGame()
  const { sim, npcs, journal } = state.game
  const [tab, setTab] = useState('Dashboard')

  return (
    <Screen>
      <ScreenHeader
        title={`${sim.firstName} ${sim.lastName}`}
        subtitle={tab}
        left={<BackButton onClick={() => go('home')} />}
        right={<IconButton icon={<IconDots size={20} />} label="More" onClick={() => go('menu')} />}
      />
      <div className="mb-5">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'Dashboard' && <DashboardTab sim={sim} npcs={npcs} go={go} />}
      {tab === 'Stats' && <StatsTab sim={sim} />}
      {tab === 'Traits' && <TraitsTab sim={sim} />}
      {tab === 'Background' && <BackgroundTab sim={sim} journal={journal} />}
    </Screen>
  )
}
