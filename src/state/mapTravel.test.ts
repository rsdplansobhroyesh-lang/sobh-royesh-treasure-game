import { describe, expect, it } from 'vitest'
import { stageIds } from '../config/gameConfig'
import { checkpoints, mapLayouts, pointOnSegment, segmentPath } from '../config/mapConfig'
import { createInitialState, gameReducer, getCheckpointStatus, type GameState } from './gameState'
import { detectMapTravel, playerDestination } from './mapTravel'

describe('map movement contract', () => {
  it('positions a fresh adventurer before checkpoint one', () => {
    expect(playerDestination(createInitialState())).toBe('start')
  })
  it.each(stageIds)('moves from completed checkpoint %s toward the next destination', stage => {
    const before: GameState = { screen: `GAME_${stage}`, completedStages: stageIds.slice(0, stage - 1) }
    const after = gameReducer(before, { type: 'COMPLETE_GAME', stage })
    const destination = stageIds.at(stage) ?? 'treasure'
    expect(detectMapTravel(before, after)).toEqual({ from: stage, to: destination })
    expect(playerDestination(after)).toBe(destination)
    expect(after.screen).toBe('MAP')
    expect(getCheckpointStatus(after, stage)).toBe('completed')
    if (destination !== 'treasure') expect(getCheckpointStatus(after, destination)).toBe('current')
  })
  it('does not animate a normal return, restored map, reset, or skipped completion', () => {
    const game: GameState = { screen: 'GAME_2', completedStages: [1] }
    const returned = gameReducer(game, { type: 'RETURN_TO_MAP' })
    expect(detectMapTravel(game, returned)).toBeNull()
    expect(detectMapTravel(returned, returned)).toBeNull()
    expect(detectMapTravel(game, createInitialState())).toBeNull()
    expect(detectMapTravel(game, { screen: 'MAP', completedStages: [1, 2, 3] })).toBeNull()
    expect(detectMapTravel(game, { screen: 'MAP', completedStages: [1, 3] })).toBeNull()
  })
})

describe('responsive map geometry', () => {
  it('defines the five unique themes in the existing stage order', () => {
    expect(checkpoints.map(checkpoint => checkpoint.id)).toEqual(stageIds)
    expect(new Set(checkpoints.map(checkpoint => checkpoint.theme)).size).toBe(5)
  })
  it.each(['portrait', 'wide'] as const)('%s has a continuous bounded path with exact destinations', mode => {
    const layout = mapLayouts[mode]
    expect(layout.segments).toHaveLength(6)
    expect(layout.segments[0]?.from).toEqual(layout.stops.start)
    expect(layout.segments[5]?.to).toEqual(layout.stops.treasure)
    layout.segments.forEach((segment, index) => {
      if (index > 0) expect(segment.from).toEqual(layout.segments[index - 1]?.to)
      expect(pointOnSegment(segment, 0)).toEqual(segment.from)
      expect(pointOnSegment(segment, 1)).toEqual(segment.to)
      expect(pointOnSegment(segment, -1)).toEqual(segment.from)
      expect(pointOnSegment(segment, 2)).toEqual(segment.to)
      expect(segmentPath(segment)).toMatch(/^M.+ C/)
      for (let step = 0; step <= 20; step++) {
        const point = pointOnSegment(segment, step / 20)
        expect(point.x).toBeGreaterThan(0)
        expect(point.x).toBeLessThan(layout.width)
        expect(point.y).toBeGreaterThan(0)
        expect(point.y).toBeLessThan(layout.height)
      }
    })
  })
})
