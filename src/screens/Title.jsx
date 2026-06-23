import { useGame, hasSave } from '../game/GameContext.jsx'
import { Button } from '../components/ui.jsx'
import { IconArrowRight, IconBook, IconSpark } from '../components/Icons.jsx'

export default function Title() {
  const { dispatch, go } = useGame()
  const canContinue = hasSave()

  return (
    <div className="flex-1 min-h-0 flex flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-8 animate-fade-in overflow-y-auto no-scrollbar">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow mb-6">
          <IconBook size={30} className="text-white" />
        </div>
        <p className="text-[12px] uppercase tracking-[0.25em] text-text-dim mb-2">Arcanoire Studio</p>
        <h1 className="font-display text-[44px] leading-[0.95] font-bold text-text-hi tracking-tight">
          Words
          <br />
          worth
        </h1>
        <p className="text-[14px] text-text-mid mt-4 italic">A life in words.</p>
        <p className="text-[12.5px] text-text-dim mt-2 max-w-[260px] leading-relaxed">
          A cozy, text-based life simulation. Read the moment, make a choice, watch a life unfold.
        </p>
      </div>

      <div className="space-y-3 shrink-0">
        {canContinue && (
          <Button
            full
            size="lg"
            sub="Resume your saved life"
            icon={<IconArrowRight size={18} />}
            trailing={<IconArrowRight size={16} />}
            onClick={() => dispatch({ type: 'CONTINUE_SAVE' })}
          >
            Continue
          </Button>
        )}
        <Button
          full
          size="lg"
          variant={canContinue ? 'ghost' : 'solid'}
          sub="Create a sim from scratch"
          icon={<IconSpark size={18} />}
          trailing={<IconArrowRight size={16} />}
          onClick={() => go('create')}
        >
          New Life
        </Button>
        <Button
          full
          size="lg"
          variant="ghost"
          sub="Play as Alex Morgan"
          icon={<IconBook size={18} />}
          trailing={<IconArrowRight size={16} />}
          onClick={() => dispatch({ type: 'LOAD_SEED' })}
        >
          Quick Start
        </Button>
      </div>
    </div>
  )
}
