import { stageIds, type StageId } from '../config/gameConfig'

export type { StageId } from '../config/gameConfig'

export type GameScreen = `GAME_${StageId}`
export type Screen = 'INTRO' | 'MAP' | GameScreen | 'TREASURE_COMPLETE'

export interface GameState {
  screen: Screen
  completedStages: StageId[]
}

export type GameAction =
  | { type: 'START_ADVENTURE' }
  | { type: 'OPEN_GAME'; stage: StageId }
  | { type: 'RETURN_TO_MAP' }
  | { type: 'COMPLETE_GAME'; stage: StageId }
  | { type: 'OPEN_TREASURE' }

export type CheckpointStatus = 'locked' | 'current' | 'completed'

export function createInitialState(): GameState {
  return { screen: 'INTRO', completedStages: [] }
}

export function getCurrentStage(state: GameState): StageId | null {
  return stageIds[state.completedStages.length] ?? null
}

export function getCheckpointStatus(
  state: GameState,
  stage: StageId,
): CheckpointStatus {
  if (state.completedStages.includes(stage)) return 'completed'
  return getCurrentStage(state) === stage ? 'current' : 'locked'
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_ADVENTURE':
      return state.screen === 'INTRO' ? { ...state, screen: 'MAP' } : state
    case 'OPEN_GAME':
      return state.screen === 'MAP' && getCurrentStage(state) === action.stage
        ? { ...state, screen: `GAME_${action.stage}` }
        : state
    case 'RETURN_TO_MAP':
      return state.screen.startsWith('GAME_') || state.screen === 'TREASURE_COMPLETE'
        ? { ...state, screen: 'MAP' }
        : state
    case 'COMPLETE_GAME':
      return state.screen === `GAME_${action.stage}` &&
        getCurrentStage(state) === action.stage
        ? { screen: 'MAP', completedStages: [...state.completedStages, action.stage] }
        : state
    case 'OPEN_TREASURE':
      return state.screen === 'MAP' && getCurrentStage(state) === null
        ? { ...state, screen: 'TREASURE_COMPLETE' }
        : state
    default:
      return state
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  if (Object.keys(value).some((key) => key !== 'screen' && key !== 'completedStages')) {
    return false
  }

  const { screen, completedStages } = value
  if (!Array.isArray(completedStages) || completedStages.length > stageIds.length) {
    return false
  }
  if (!stageIds.slice(0, completedStages.length).every((stage, index) => completedStages[index] === stage)) {
    return false
  }

  if (screen === 'INTRO') return completedStages.length === 0
  if (screen === 'MAP') return true
  if (screen === 'TREASURE_COMPLETE') return completedStages.length === stageIds.length

  const currentStage = stageIds[completedStages.length]
  return currentStage !== undefined && screen === `GAME_${currentStage}`
}
