import { useGame } from './game/GameContext.jsx'
import { useGameClock } from './game/useGameClock.jsx'
import PhoneFrame from './components/PhoneFrame.jsx'
import BottomNav from './components/BottomNav.jsx'
import Toast from './components/Toast.jsx'
import ScenarioModal from './components/ScenarioModal.jsx'
import MatchModal from './components/MatchModal.jsx'
import GameOverModal from './components/GameOverModal.jsx'

import Title from './screens/Title.jsx'
import CharacterCreation from './screens/CharacterCreation.jsx'
import Home from './screens/Home.jsx'
import Overview from './screens/Overview.jsx'
import World from './screens/World.jsx'
import Journal from './screens/Journal.jsx'
import Goals from './screens/Goals.jsx'
import Menu from './screens/Menu.jsx'
import Career from './screens/Career.jsx'
import Skills from './screens/Skills.jsx'
import Shop from './screens/Shop.jsx'
import Phone from './screens/Phone.jsx'
import Achievements from './screens/Achievements.jsx'
import LifePath from './screens/LifePath.jsx'
import Schedule from './screens/Schedule.jsx'

// Map each screen to the bottom-nav tab it should highlight.
const NAV_SCREENS = {
  home: 'home',
  overview: 'home',
  career: 'home',
  world: 'world',
  journal: 'journal',
  goals: 'goals',
  menu: 'menu',
  skills: 'menu',
  shop: 'menu',
  phone: 'menu',
  achievements: 'menu',
  lifepath: 'menu',
  schedule: 'menu',
}

const SCREENS = {
  home: Home,
  overview: Overview,
  career: Career,
  world: World,
  journal: Journal,
  goals: Goals,
  menu: Menu,
  skills: Skills,
  shop: Shop,
  phone: Phone,
  achievements: Achievements,
  lifepath: LifePath,
  schedule: Schedule,
}

export default function App() {
  const { state, dispatch, go } = useGame()
  useGameClock() // drives the game clock while running
  const { screen, game, toast } = state

  // Pre-game screens render full-bleed with no bottom nav.
  if (!game || screen === 'title' || screen === 'create') {
    return (
      <PhoneFrame>
        {screen === 'create' ? <CharacterCreation /> : !game ? <Title /> : <CharacterCreation />}
      </PhoneFrame>
    )
  }

  const Screen = SCREENS[screen] || Home
  const navActive = NAV_SCREENS[screen] || 'home'

  return (
    <PhoneFrame>
      <Screen />
      <ScenarioModal />
      <MatchModal />
      <GameOverModal />
      <Toast message={toast} onClear={() => dispatch({ type: 'CLEAR_TOAST' })} />
      <BottomNav active={navActive} onNavigate={go} />
    </PhoneFrame>
  )
}
