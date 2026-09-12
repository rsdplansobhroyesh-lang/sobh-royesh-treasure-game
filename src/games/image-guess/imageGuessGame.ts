import { gameConfig } from '../../config/gameConfig'

export type ImageGuessPhase = 'answering' | 'magic-choice' | 'magic-activating' | 'revealed'
export type RevealKind = 'correct' | 'magic' | null

export interface ImageGuessState {
  phase: ImageGuessPhase
  normalAttemptsUsed: number
  hintLevel: 0 | 1 | 2
  validationError: string | null
  revealKind: RevealKind
}

export type ImageGuessAction =
  | { type: 'SUBMIT'; answer: string }
  | { type: 'THINK_AGAIN' }
  | { type: 'ACTIVATE_MAGIC' }
  | { type: 'FINISH_MAGIC' }

const acceptedAnswers = new Set([
  'دهکده',
  'دهکده صبح رویش',
  'دهکده ی صبح رویش',
  'دهکدهی صبح رویش',
])

export function normalizePersianAnswer(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, ' ')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isAcceptedVillageAnswer(value: string): boolean {
  return acceptedAnswers.has(normalizePersianAnswer(value))
}

export function createImageGuessState(): ImageGuessState {
  return {
    phase: 'answering',
    normalAttemptsUsed: 0,
    hintLevel: 0,
    validationError: null,
    revealKind: null,
  }
}

export function imageGuessReducer(state: ImageGuessState, action: ImageGuessAction): ImageGuessState {
  switch (action.type) {
    case 'SUBMIT': {
      if (state.phase !== 'answering') return state
      const normalized = normalizePersianAnswer(action.answer)
      if (!normalized) return { ...state, validationError: 'اول پاسخت را بنویس.' }
      if (isAcceptedVillageAnswer(normalized)) {
        return { ...state, phase: 'revealed', validationError: null, revealKind: 'correct' }
      }

      if (state.normalAttemptsUsed >= gameConfig.imageGuessGame.maxNormalAttempts) {
        return { ...state, phase: 'magic-choice', validationError: null }
      }

      const normalAttemptsUsed = state.normalAttemptsUsed + 1
      if (normalAttemptsUsed >= gameConfig.imageGuessGame.maxNormalAttempts) {
        return { ...state, phase: 'magic-choice', normalAttemptsUsed, hintLevel: 2, validationError: null }
      }
      return {
        ...state,
        normalAttemptsUsed,
        hintLevel: normalAttemptsUsed === 1 ? 1 : 2,
        validationError: null,
      }
    }
    case 'THINK_AGAIN':
      return state.phase === 'magic-choice'
        ? { ...state, phase: 'answering', validationError: null }
        : state
    case 'ACTIVATE_MAGIC':
      return state.phase === 'magic-choice'
        ? { ...state, phase: 'magic-activating', validationError: null }
        : state
    case 'FINISH_MAGIC':
      return state.phase === 'magic-activating'
        ? { ...state, phase: 'revealed', revealKind: 'magic' }
        : state
    default:
      return state
  }
}

export function remainingNormalAttempts(state: ImageGuessState): number {
  return Math.max(0, gameConfig.imageGuessGame.maxNormalAttempts - state.normalAttemptsUsed)
}
