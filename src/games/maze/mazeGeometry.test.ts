import { describe, expect, it } from 'vitest'
import { cellCenter, goalCell, inspectSegment, isAtGoal, isAtStart, mazeWalls, startCell, validRoute } from './mazeGeometry'

describe('deterministic maze geometry', () => {
  it('identifies the required start and destination', () => {
    expect(isAtStart(cellCenter(startCell))).toBe(true)
    expect(isAtGoal(cellCenter(goalCell))).toBe(true)
  })

  it('keeps every segment of the approved route inside a corridor', () => {
    expect(validRoute.length).toBeGreaterThan(15)
    expect(mazeWalls.length).toBeGreaterThan(30)
    for (let index = 1; index < validRoute.length; index += 1) {
      const result = inspectSegment(cellCenter(validRoute[index - 1]!), cellCenter(validRoute[index]!))
      expect(['clear', 'goal']).toContain(result)
    }
  })

  it('detects a direct fast swipe that crosses walls', () => {
    expect(inspectSegment(cellCenter(startCell), cellCenter(goalCell))).toBe('collision')
  })

  it('detects crossing a closed wall next to the start', () => {
    expect(inspectSegment(cellCenter(startCell), cellCenter({ row: 7, column: 0 }))).toBe('collision')
  })
})
