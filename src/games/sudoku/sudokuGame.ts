import { gameConfig } from '../../config/gameConfig'

export const SUDOKU_SIZE = 6
export const BOX_ROWS = 2
export const BOX_COLUMNS = 3

export type SudokuCell = { value: number | null; notes: number[] }
export type SudokuState = {
  cells: SudokuCell[]
  selected: number | null
  pencilMode: boolean
  complete: boolean
}

export type SudokuAction =
  | { type: 'SELECT'; index: number }
  | { type: 'INPUT'; value: number }
  | { type: 'TOGGLE_PENCIL' }
  | { type: 'ERASE' }
  | { type: 'RESTART' }

export const isClue = (index: number) => gameConfig.sudokuGame.puzzle[index] !== 0

export function createSudokuState(): SudokuState {
  return {
    cells: gameConfig.sudokuGame.puzzle.map(value => ({ value: value || null, notes: [] })),
    selected: null,
    pencilMode: false,
    complete: false,
  }
}

export function isSolved(values: ReadonlyArray<number | null>): boolean {
  return values.length === 36 && values.every((value, index) => value === gameConfig.sudokuGame.solution[index])
}

export function sudokuReducer(state: SudokuState, action: SudokuAction): SudokuState {
  if (action.type === 'RESTART') return createSudokuState()
  if (action.type === 'SELECT') return { ...state, selected: action.index }
  if (action.type === 'TOGGLE_PENCIL') return { ...state, pencilMode: !state.pencilMode }
  if (state.selected === null || isClue(state.selected) || state.complete) return state

  const cells = state.cells.map(cell => ({ ...cell, notes: [...cell.notes] }))
  const cell = cells[state.selected]
  if (!cell) return state

  if (action.type === 'ERASE') {
    cells[state.selected] = { value: null, notes: [] }
    return { ...state, cells, complete: false }
  }

  if (action.type === 'INPUT') {
    if (state.pencilMode) {
      const notes = cell.notes.includes(action.value)
        ? cell.notes.filter(value => value !== action.value)
        : [...cell.notes, action.value].sort()
      cells[state.selected] = { value: null, notes }
    } else {
      cells[state.selected] = { value: action.value, notes: [] }
    }
    return { ...state, cells, complete: isSolved(cells.map(item => item.value)) }
  }
  return state
}

export function getConflictingCells(values: ReadonlyArray<number | null>): Set<number> {
  const conflicts = new Set<number>()
  const units: number[][] = []
  for (let row = 0; row < SUDOKU_SIZE; row += 1) units.push(Array.from({ length: 6 }, (_, column) => row * 6 + column))
  for (let column = 0; column < SUDOKU_SIZE; column += 1) units.push(Array.from({ length: 6 }, (_, row) => row * 6 + column))
  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxColumn = 0; boxColumn < 2; boxColumn += 1) {
      units.push(Array.from({ length: 6 }, (_, offset) =>
        (boxRow * BOX_ROWS + Math.floor(offset / BOX_COLUMNS)) * 6 + boxColumn * BOX_COLUMNS + offset % BOX_COLUMNS))
    }
  }
  for (const unit of units) {
    const positions = new Map<number, number[]>()
    for (const index of unit) {
      const value = values[index]
      if (value === null || value === undefined) continue
      positions.set(value, [...(positions.get(value) ?? []), index])
    }
    for (const indices of positions.values()) if (indices.length > 1) indices.forEach(index => conflicts.add(index))
  }
  return conflicts
}

export function countSolutions(puzzle: ReadonlyArray<number>, limit = 2): number {
  const board = [...puzzle]
  let count = 0
  const valid = (index: number, value: number) => {
    const row = Math.floor(index / 6)
    const column = index % 6
    for (let offset = 0; offset < 6; offset += 1) {
      if (board[row * 6 + offset] === value || board[offset * 6 + column] === value) return false
    }
    const startRow = Math.floor(row / 2) * 2
    const startColumn = Math.floor(column / 3) * 3
    for (let r = startRow; r < startRow + 2; r += 1) {
      for (let c = startColumn; c < startColumn + 3; c += 1) if (board[r * 6 + c] === value) return false
    }
    return true
  }
  const solve = () => {
    if (count >= limit) return
    const index = board.indexOf(0)
    if (index === -1) { count += 1; return }
    for (let value = 1; value <= 6; value += 1) {
      if (!valid(index, value)) continue
      board[index] = value
      solve()
      board[index] = 0
    }
  }
  solve()
  return count
}
