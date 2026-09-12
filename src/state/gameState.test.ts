import { describe, expect, it } from 'vitest'
import { stageIds } from '../config/gameConfig'
import {
  createInitialState,
  gameReducer,
  getCheckpointStatus,
  getCurrentStage,
  isGameState,
  type GameState,
} from './gameState'

describe('adventure progression', () => {
  it('starts at the introduction with only the first checkpoint current', () => {
    const initial = createInitialState()
    expect(initial).toEqual({ screen: 'INTRO', completedStages: [] })
    expect(stageIds.map((stage) => getCheckpointStatus(initial, stage))).toEqual([
      'current', 'locked', 'locked', 'locked', 'locked',
    ])
    expect(gameReducer(initial, { type: 'OPEN_GAME', stage: 1 })).toBe(initial)
    expect(gameReducer(initial, { type: 'START_ADVENTURE' }).screen).toBe('MAP')
  })

  it('rejects locked stages, skipped completions, and premature treasure access', () => {
    const map = gameReducer(createInitialState(), { type: 'START_ADVENTURE' })
    for (const stage of stageIds) {
      if (stage !== 1) expect(gameReducer(map, { type: 'OPEN_GAME', stage })).toBe(map)
      expect(gameReducer(map, { type: 'COMPLETE_GAME', stage })).toBe(map)
    }
    expect(gameReducer(map, { type: 'OPEN_TREASURE' })).toBe(map)

    const game = gameReducer(map, { type: 'OPEN_GAME', stage: 1 })
    expect(gameReducer(game, { type: 'COMPLETE_GAME', stage: 2 })).toBe(game)
    expect(gameReducer(game, { type: 'OPEN_GAME', stage: 2 })).toBe(game)
    expect(gameReducer(game, { type: 'OPEN_TREASURE' })).toBe(game)
  })

  it('returns from an unfinished game without granting progress', () => {
    const game: GameState = { screen: 'GAME_3', completedStages: [1, 2] }
    const map = gameReducer(game, { type: 'RETURN_TO_MAP' })
    expect(map).toEqual({ screen: 'MAP', completedStages: [1, 2] })
    expect(gameReducer(map, { type: 'OPEN_GAME', stage: 3 })).toEqual(game)
  })

  it('completes each stage in order, returns to the map, and requires manual navigation', () => {
    let state = gameReducer(createInitialState(), { type: 'START_ADVENTURE' })

    for (const stage of stageIds) {
      expect(getCurrentStage(state)).toBe(stage)
      const game = gameReducer(state, { type: 'OPEN_GAME', stage })
      expect(game.screen).toBe(`GAME_${stage}`)
      expect(isGameState(game)).toBe(true)

      const previousCompleted = [...game.completedStages]
      state = gameReducer(game, { type: 'COMPLETE_GAME', stage })
      expect(state.screen).toBe('MAP')
      expect(state.completedStages).toEqual(stageIds.slice(0, stage))
      expect(game.completedStages).toEqual(previousCompleted)
      expect(getCheckpointStatus(state, stage)).toBe('completed')
      expect(gameReducer(state, { type: 'COMPLETE_GAME', stage })).toBe(state)
      expect(gameReducer(state, { type: 'OPEN_GAME', stage })).toBe(state)
      expect(isGameState(state)).toBe(true)
    }

    expect(getCurrentStage(state)).toBeNull()
    expect(state.screen).toBe('MAP')
    state = gameReducer(state, { type: 'OPEN_TREASURE' })
    expect(state).toEqual({ screen: 'TREASURE_COMPLETE', completedStages: [1, 2, 3, 4, 5] })
    expect(isGameState(state)).toBe(true)
    expect(gameReducer(state, { type: 'START_ADVENTURE' })).toBe(state)
    expect(gameReducer(state, { type: 'RETURN_TO_MAP' })).toEqual({
      screen: 'MAP', completedStages: [1, 2, 3, 4, 5],
    })
  })

  it('rejects replayed completion events after entering the next game', () => {
    const state: GameState = { screen: 'GAME_2', completedStages: [1] }
    expect(gameReducer(state, { type: 'COMPLETE_GAME', stage: 1 })).toBe(state)
    expect(gameReducer(state, { type: 'START_ADVENTURE' })).toBe(state)
  })

  it('creates independent initial states for a fresh adventure', () => {
    const first = createInitialState()
    const second = createInitialState()
    first.completedStages.push(1)
    expect(second).toEqual({ screen: 'INTRO', completedStages: [] })
  })
})

describe('saved-state validation', () => {
  it.each([
    null,
    [],
    {},
    { screen: 'UNKNOWN', completedStages: [] },
    { screen: 'MAP', completedStages: [2] },
    { screen: 'MAP', completedStages: [1, 1] },
    { screen: 'MAP', completedStages: [1, 3] },
    { screen: 'MAP', completedStages: [1, 2, 3, 4, 5, 6] },
    { screen: 'MAP', completedStages: ['1'] },
    { screen: 'MAP', completedStages: Array<unknown>(1) },
    { screen: 'INTRO', completedStages: [1] },
    { screen: 'GAME_2', completedStages: [] },
    { screen: 'GAME_1', completedStages: [1] },
    { screen: 'GAME_5', completedStages: [1, 2, 3, 4, 5] },
    { screen: 'TREASURE_COMPLETE', completedStages: [1, 2, 3, 4] },
    { screen: 'MAP', completedStages: [], unexpected: true },
  ])('rejects invalid or inconsistent state %#', (value) => {
    expect(isGameState(value)).toBe(false)
  })

  it.each<GameState>([
    { screen: 'INTRO', completedStages: [] },
    { screen: 'MAP', completedStages: [] },
    { screen: 'MAP', completedStages: [1, 2, 3] },
    { screen: 'GAME_1', completedStages: [] },
    { screen: 'GAME_4', completedStages: [1, 2, 3] },
    { screen: 'MAP', completedStages: [1, 2, 3, 4, 5] },
    { screen: 'TREASURE_COMPLETE', completedStages: [1, 2, 3, 4, 5] },
  ])('accepts a reachable state %#', (value) => {
    expect(isGameState(value)).toBe(true)
  })
})
