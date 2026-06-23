import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import { Screen, ScreenHeader, BackButton, Card, SectionLabel, Avatar, Button, Modal } from '../components/ui.jsx'
import { genderMeta, lifeSummary } from '../game/names.js'
import { IconArrowRight, IconHeart } from '../components/Icons.jsx'

// Friendly, generic messages — quality nudges the relationship gain a little.
const MESSAGES = [
  { text: 'Hey! Thinking of you 😊', gain: 0.3 },
  { text: 'Want to hang out soon?', gain: 0.4 },
  { text: 'You free this weekend?', gain: 0.4 },
  { text: 'Just checking in — how are you?', gain: 0.3 },
  { text: 'Had a great time last time. Let’s do it again!', gain: 0.5 },
]

export default function Phone() {
  const { state, dispatch, go } = useGame()
  const { sim, npcs } = state.game
  const [openId, setOpenId] = useState(null)
  const contact = npcs.find((n) => n.id === openId) || null

  if (!sim.hasPhone) {
    return (
      <Screen>
        <ScreenHeader title="Phone" subtitle="No device" left={<BackButton onClick={() => go('menu')} />} />
        <Card className="p-6 text-center">
          <p className="text-[14px] text-text-hi font-medium mb-1">You don’t own a phone yet.</p>
          <p className="text-[12.5px] text-text-mid mb-4">Buy a Smartphone from the Shop to text your contacts.</p>
          <Button onClick={() => go('shop')}>Go to Shop</Button>
        </Card>
      </Screen>
    )
  }

  return (
    <>
      <Screen>
        <ScreenHeader title="Phone" subtitle={`${npcs.length} contacts`} left={<BackButton onClick={() => go('menu')} />} />
        <SectionLabel>Contacts</SectionLabel>
        <div className="space-y-2.5">
          {npcs.map((n) => {
            const g = genderMeta(n.gender)
            return (
              <Card key={n.id} className="p-3 flex items-center gap-3" onClick={() => setOpenId(n.id)}>
                <Avatar name={n.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[14px] text-text-hi font-semibold truncate">{n.name}</h3>
                    <span className="text-[11px] text-accent-2 shrink-0">{g.symbol}</span>
                  </div>
                  <p className="text-[11.5px] text-text-mid truncate">{n.status} · {lifeSummary(n)}</p>
                </div>
                <IconArrowRight size={15} className="text-text-dim shrink-0" />
              </Card>
            )
          })}
        </div>
      </Screen>

      {contact && (
        <Modal onClose={() => setOpenId(null)}>
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={contact.name} size={48} />
            <div className="min-w-0">
              <h3 className="text-[16px] text-text-hi font-semibold truncate">{contact.name}</h3>
              <p className="text-[11.5px] text-text-mid">Friendship {Math.round(contact.friendship)}%</p>
            </div>
          </div>
          <p className="text-[12px] text-text-dim mb-2">Send a message</p>
          <div className="space-y-2">
            {MESSAGES.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => dispatch({ type: 'SEND_MESSAGE', npcId: contact.id, gain: m.gain })}
                className="w-full text-left rounded-xl bg-bg-panel-2 border border-stroke px-3.5 py-2.5 text-[13px] text-text-hi hover:border-accent transition-colors flex items-center justify-between gap-2"
              >
                <span className="truncate">{m.text}</span>
                <span className="text-[11px] text-accent-2 shrink-0">+{m.gain.toFixed(1)}</span>
              </button>
            ))}
          </div>
          <Button full variant="outline" className="mt-3" icon={<IconHeart size={15} />} onClick={() => setOpenId(null)}>
            Done
          </Button>
        </Modal>
      )}
    </>
  )
}
