import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel, Tabs, Button } from '../components/ui.jsx'
import { useDragScroll } from '../components/useDragScroll.js'
import { SHOP } from '../game/shop.js'

const CATS = Object.keys(SHOP)

export default function Shop() {
  const { state, dispatch, go } = useGame()
  const { sim } = state.game
  const cur = sim.currency || '$'
  const [cat, setCat] = useState(CATS[0])
  const drag = useDragScroll()

  const owned = new Set([
    ...(sim.properties || []).map((p) => p.id),
    ...(sim.vehicles || []).map((v) => v.id),
  ])

  return (
    <Screen>
      <ScreenHeader
        title="Shop"
        subtitle={`${cur}${sim.cash.toLocaleString()} available`}
        left={<BackButton onClick={() => go('menu')} />}
      />

      <div
        {...drag}
        className="mb-4 -mx-4 px-4 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'pan-x' }}
      >
        <div className="flex gap-2 w-max">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={[
                'px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border whitespace-nowrap transition-colors',
                cat === c ? 'bg-accent text-white border-accent' : 'border-stroke text-text-mid hover:text-text-hi',
              ].join(' ')}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <SectionLabel>{cat}</SectionLabel>
      <div className="space-y-3">
        {SHOP[cat].map((it) => {
          const have = owned.has(it.id)
          const tooPoor = sim.cash < it.price
          return (
            <Card key={it.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[14.5px] text-text-hi font-semibold truncate">{it.name}</h3>
                  {it.note && <p className="text-[12px] text-accent-2 mt-0.5">{it.note}</p>}
                  {it.gift && <p className="text-[12px] text-text-mid mt-0.5">Giftable · up to +{it.gift.toFixed(1)} relationship</p>}
                </div>
                <span className="text-[13px] text-gold tnum shrink-0">{cur}{it.price.toLocaleString()}</span>
              </div>
              <Button
                full
                size="sm"
                variant={have ? 'outline' : 'subtle'}
                disabled={have || tooPoor}
                className="mt-3"
                onClick={() => dispatch({ type: 'BUY_ITEM', itemId: it.id })}
              >
                {have ? 'Owned' : tooPoor ? 'Not enough money' : 'Buy'}
              </Button>
            </Card>
          )
        })}
      </div>
    </Screen>
  )
}
