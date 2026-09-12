import { useEffect, useRef, useState } from 'react'
import { AppShell } from './components/AppShell'
import { ResetDialog } from './components/ResetDialog'
import { IntroScreen } from './screens/IntroScreen'
import { MapScreen } from './screens/MapScreen'
import { MemoryGameScreen } from './games/memory/MemoryGameScreen'
import { TimerGameScreen } from './games/timer/TimerGameScreen'
import { ImageGuessGameScreen } from './games/image-guess/ImageGuessGameScreen'
import { MazeGameScreen } from './games/maze/MazeGameScreen'
import { SudokuGameScreen } from './games/sudoku/SudokuGameScreen'
import { FinalTreasureScreen } from './screens/FinalTreasureScreen'
import { useAdventure } from './state/useAdventure'
import type { GameAction, GameState } from './state/gameState'
import type { MapTravel } from './state/mapTravel'

type ScreenProps = {
  state: GameState
  dispatch: (action: GameAction) => void
  onRestart: () => void
  mapTravel: MapTravel | null
  onArrive: (id: number) => void
}

function AdventureScreen({ state, dispatch, onRestart, mapTravel, onArrive }: ScreenProps) {
  const onReturn = () => dispatch({ type: 'RETURN_TO_MAP' })
  switch (state.screen) {
    case 'INTRO':
      return <IntroScreen onStart={() => dispatch({ type: 'START_ADVENTURE' })} />
    case 'MAP':
      return <MapScreen state={state} travel={mapTravel} onArrive={onArrive}
        onOpenGame={(stage) => dispatch({ type: 'OPEN_GAME', stage })}
        onOpenTreasure={() => dispatch({ type: 'OPEN_TREASURE' })} />
    case 'GAME_1':
      return <MemoryGameScreen
        onReturn={onReturn}
        onComplete={() => dispatch({ type: 'COMPLETE_GAME', stage: 1 })}
      />
    case 'GAME_2':
      return <TimerGameScreen
        onReturn={onReturn}
        onComplete={() => dispatch({ type: 'COMPLETE_GAME', stage: 2 })}
      />
    case 'GAME_3':
      return <ImageGuessGameScreen
        onReturn={onReturn}
        onComplete={() => dispatch({ type: 'COMPLETE_GAME', stage: 3 })}
      />
    case 'GAME_4':
      return <MazeGameScreen
        onReturn={onReturn}
        onComplete={() => dispatch({ type: 'COMPLETE_GAME', stage: 4 })}
      />
    case 'GAME_5':
      return <SudokuGameScreen
        onReturn={onReturn}
        onComplete={() => dispatch({ type: 'COMPLETE_GAME', stage: 5 })}
      />
    case 'TREASURE_COMPLETE':
      return <FinalTreasureScreen onRestart={onRestart} onReturn={onReturn} />
  }
}

export function App() {
  const adventure = useAdventure()
  const [resetOpen, setResetOpen] = useState(false)
  const previousScreen = useRef(adventure.state.screen)

  useEffect(() => {
    if (previousScreen.current === adventure.state.screen) return
    previousScreen.current = adventure.state.screen
    const heading = document.querySelector<HTMLElement>('main h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [adventure.state.screen])

  const onRestart = () => {
    adventure.clearResetError()
    setResetOpen(true)
  }

  return (
    <AppShell state={adventure.state} onRestart={onRestart}
      {...(adventure.storageMessage ? { storageMessage: adventure.storageMessage } : {})}>
      <AdventureScreen state={adventure.state} dispatch={adventure.dispatch} onRestart={onRestart}
        mapTravel={adventure.mapTravel} onArrive={adventure.finishMapTravel} />
      <ResetDialog open={resetOpen} onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          if (adventure.confirmReset()) setResetOpen(false)
        }}
        {...(adventure.resetError ? { error: adventure.resetError } : {})} />
    </AppShell>
  )
}
