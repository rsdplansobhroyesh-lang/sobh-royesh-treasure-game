import { describe, expect, it } from 'vitest'
import { gameConfig } from '../../config/gameConfig'
import { countSolutions, createSudokuState, getConflictingCells, isSolved, sudokuReducer } from './sudokuGame'

describe('mini sudoku', () => {
  it('uses a valid fixed 6×6 puzzle with exactly one solution', () => {
    expect(gameConfig.sudokuGame.puzzle).toHaveLength(36)
    expect(gameConfig.sudokuGame.solution).toHaveLength(36)
    expect(countSolutions(gameConfig.sudokuGame.puzzle)).toBe(1)
    expect(isSolved(gameConfig.sudokuGame.solution)).toBe(true)
  })

  it('keeps clues immutable and supports pencil notes, erasing, and restart', () => {
    let state = createSudokuState()
    state = sudokuReducer(state, { type: 'SELECT', index: 0 })
    expect(sudokuReducer(state, { type: 'INPUT', value: 6 })).toEqual(state)

    state = sudokuReducer(state, { type: 'SELECT', index: 1 })
    state = sudokuReducer(state, { type: 'TOGGLE_PENCIL' })
    state = sudokuReducer(state, { type: 'INPUT', value: 2 })
    expect(state.cells[1]).toEqual({ value: null, notes: [2] })
    state = sudokuReducer(state, { type: 'INPUT', value: 2 })
    expect(state.cells[1]?.notes).toEqual([])
    state = sudokuReducer(state, { type: 'TOGGLE_PENCIL' })
    state = sudokuReducer(state, { type: 'INPUT', value: 4 })
    state = sudokuReducer(state, { type: 'ERASE' })
    expect(state.cells[1]).toEqual({ value: null, notes: [] })
    expect(sudokuReducer(state, { type: 'RESTART' })).toEqual(createSudokuState())
  })

  it('marks row, column, and box duplicates without declaring an incorrect full board complete', () => {
    const rowConflict = [...gameConfig.sudokuGame.solution]
    rowConflict[1] = 1
    expect(getConflictingCells(rowConflict)).toEqual(expect.objectContaining(new Set([0, 1])))
    expect(isSolved(rowConflict)).toBe(false)

    const columnConflict = [...gameConfig.sudokuGame.solution]
    columnConflict[6] = 1
    expect(getConflictingCells(columnConflict).has(0)).toBe(true)
    expect(getConflictingCells(columnConflict).has(6)).toBe(true)

    const boxConflict = [...gameConfig.sudokuGame.puzzle]
    boxConflict[1] = 5
    expect(getConflictingCells(boxConflict).has(1)).toBe(true)
    expect(getConflictingCells(boxConflict).has(7)).toBe(true)
  })

  it('completes only after every editable cell matches the solution', () => {
    let state = createSudokuState()
    gameConfig.sudokuGame.solution.forEach((value, index) => {
      if (gameConfig.sudokuGame.puzzle[index] !== 0) return
      state = sudokuReducer(state, { type: 'SELECT', index })
      state = sudokuReducer(state, { type: 'INPUT', value })
    })
    expect(state.complete).toBe(true)
  })
})
