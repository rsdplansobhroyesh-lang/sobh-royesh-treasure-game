import { gameConfig } from '../../config/gameConfig'

export type MemoryPhase = 'observing' | 'answering' | 'wrong' | 'success'

export interface MemoryGameState {
  phase: MemoryPhase
  attempt: number
  answer: string
}

export type MemoryGameAction =
  | { type: 'OBSERVATION_FINISHED' }
  | { type: 'SET_ANSWER'; answer: string }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'RETRY' }

const digitMap: Readonly<Record<string, string>> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
}

export function createMemoryGameState(): MemoryGameState {
  return { phase: 'observing', attempt: 1, answer: '' }
}

export function getObservationDuration(attempt: number): number {
  return attempt === 1
    ? gameConfig.memoryGame.initialObservationMs
    : gameConfig.memoryGame.retryObservationMs
}

export function parseMemoryAnswer(value: string): number | null {
  const normalized = value.trim().replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] ?? digit)
  if (!/^\d+$/.test(normalized)) return null
  const answer = Number(normalized)
  return Number.isSafeInteger(answer) ? answer : null
}

export function memoryGameReducer(state: MemoryGameState, action: MemoryGameAction): MemoryGameState {
  switch (action.type) {
    case 'OBSERVATION_FINISHED':
      return state.phase === 'observing' ? { ...state, phase: 'answering', answer: '' } : state
    case 'SET_ANSWER':
      return state.phase === 'answering' ? { ...state, answer: action.answer } : state
    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'answering') return state
      const answer = parseMemoryAnswer(state.answer)
      if (answer === null) return state
      return {
        ...state,
        phase: answer === gameConfig.memoryGame.correctAnswer ? 'success' : 'wrong',
        answer: '',
      }
    }
    case 'RETRY':
      return state.phase === 'wrong'
        ? { phase: 'observing', attempt: state.attempt + 1, answer: '' }
        : state
    default:
      return state
  }
}
