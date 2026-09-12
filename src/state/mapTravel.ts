import { gameReducer, getCurrentStage, type GameState, type StageId } from './gameState'

export interface MapTravel { id: number; from: StageId; to: StageId | 'treasure' }

/** A movement may only describe an actual one-stage completion accepted by the reducer. */
export function detectMapTravel(previous: GameState, next: GameState): Omit<MapTravel, 'id'> | null {
  const stage = getCurrentStage(previous)
  if (!stage || previous.screen !== `GAME_${stage}` || next.screen !== 'MAP') return null
  const expected = gameReducer(previous, { type: 'COMPLETE_GAME', stage })
  if (next.completedStages.length !== expected.completedStages.length ||
    next.completedStages.some((value, index) => value !== expected.completedStages[index])) return null
  return { from: stage, to: getCurrentStage(next) ?? 'treasure' }
}

export function playerDestination(state: GameState): 'start' | StageId | 'treasure' {
  return state.completedStages.length === 0 ? 'start' : getCurrentStage(state) ?? 'treasure'
}
