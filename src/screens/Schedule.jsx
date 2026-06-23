import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel } from '../components/ui.jsx'
import { DOW, SCHOOL_SCHEDULE, dowIndex } from '../game/scheduling.js'
import { fmtClock } from '../game/engine.js'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Block({ label, color, start, end }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: `${color}1f`, border: `1px solid ${color}55` }}>
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[12px] text-text-hi truncate">{label}</span>
      <span className="text-[11px] text-text-dim tnum ml-auto shrink-0">{fmtClock(start)}–{fmtClock(end)}</span>
    </div>
  )
}

export default function Schedule() {
  const { state, go } = useGame()
  const { sim } = state.game
  const today = dowIndex(sim.totalDays || 0)

  const school = sim.education?.enrolledIn ? SCHOOL_SCHEDULE : null
  const job = sim.job?.schedule || null

  return (
    <Screen>
      <ScreenHeader title="Schedule" subtitle="Your weekly commitments" left={<BackButton onClick={() => go('menu')} />} />

      <SectionLabel>This Week</SectionLabel>
      <div className="space-y-2.5">
        {DOW.map((d, i) => {
          const blocks = []
          if (school && school.days.includes(i)) blocks.push(<Block key="s" label="School" color="#8A7CFF" start={school.start} end={school.end} />)
          if (job && job.days.includes(i)) blocks.push(<Block key="w" label={sim.job.company || 'Work'} color="#E8B84B" start={job.start} end={job.end} />)
          return (
            <Card key={d} className={`p-3 ${i === today ? 'border-accent' : ''}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[13px] text-text-hi font-semibold">{DAY_NAMES[i]}</span>
                {i === today && <span className="text-[10px] uppercase tracking-wider text-accent-2 font-semibold">Today</span>}
              </div>
              {blocks.length ? <div className="space-y-1.5">{blocks}</div> : <p className="text-[12px] text-text-dim">Free day</p>}
            </Card>
          )
        })}
      </div>

      {!school && !job && (
        <p className="text-[12.5px] text-text-dim text-center mt-5">
          No commitments yet — enroll in school or take a job to fill your week.
        </p>
      )}
    </Screen>
  )
}
