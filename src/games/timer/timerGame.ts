import { gameConfig } from '../../config/gameConfig'

export type TimerPhase =
  | 'running'
  | 'failed'
  | 'success'
  | 'wand-ready'
  | 'wand-activating'
  | 'wand-success'

export interface TimerGameState {
  phase: TimerPhase
  attemptsRemaining: number
  displayedCentiseconds: number
}

export type TimerGameAction =
  | { type: 'TICK'; elapsedCentiseconds: number }
  | { type: 'STOP'; elapsedCentiseconds: number }
  | { type: 'RETRY' }
  | { type: 'ACTIVATE_WAND' }
  | { type: 'WAND_TICK'; elapsedCentiseconds: number }
  | { type: 'WAND_FINISHED' }

export function elapsedCentiseconds(startedAt: number, now: number): number {
  return Math.round(Math.max(0, now - startedAt) / 10)
}

export function formatTimer(centiseconds: number): string {
  const safeValue = Math.max(0, Math.round(centiseconds))
  const seconds = Math.floor(safeValue / 100)
  const fraction = String(safeValue % 100).padStart(2, '0')
  return `${seconds}:${fraction}`
}

export function createTimerGameState(): TimerGameState {
  return {
    phase: 'running',
    attemptsRemaining: gameConfig.timerGame.maxAttempts,
    displayedCentiseconds: 0,
  }
}

export function timerGameReducer(state: TimerGameState, action: TimerGameAction): TimerGameState {
  switch (action.type) {
    case 'TICK':
      return state.phase === 'running'
        ? { ...state, displayedCentiseconds: action.elapsedCentiseconds }
        : state
    case 'STOP': {
      if (state.phase !== 'running') return state
      if (action.elapsedCentiseconds === gameConfig.timerGame.targetCentiseconds) {
        return { ...state, phase: 'success', displayedCentiseconds: action.elapsedCentiseconds }
      }
      const attemptsRemaining = Math.max(0, state.attemptsRemaining - 1)
      return {
        phase: attemptsRemaining === 0 ? 'wand-ready' : 'failed',
        attemptsRemaining,
        displayedCentiseconds: action.elapsedCentiseconds,
      }
    }
    case 'RETRY':
      return state.phase === 'failed'
        ? { ...state, phase: 'running', displayedCentiseconds: 0 }
        : state
    case 'ACTIVATE_WAND':
      return state.phase === 'wand-ready' ? { ...state, phase: 'wand-activating' } : state
    case 'WAND_TICK':
      return state.phase === 'wand-activating'
        ? { ...state, displayedCentiseconds: action.elapsedCentiseconds }
        : state
    case 'WAND_FINISHED':
      return state.phase === 'wand-activating'
        ? {
            ...state,
            phase: 'wand-success',
            displayedCentiseconds: gameConfig.timerGame.targetCentiseconds,
          }
        : state
    default:
      return state
  }
}
