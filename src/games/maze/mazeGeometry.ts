import { gameConfig } from '../../config/gameConfig'

export interface MazePoint { x: number; y: number }
export interface MazeCell { row: number; column: number }
export interface MazeWall { x1: number; y1: number; x2: number; y2: number }
export type SegmentResult = 'clear' | 'collision' | 'goal'

const columns = gameConfig.mazeGame.width / gameConfig.mazeGame.cellSize
const rows = gameConfig.mazeGame.height / gameConfig.mazeGame.cellSize
const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]] as const
const fixedSeed = 20_260_912

export const startCell: MazeCell = { row: rows - 1, column: 0 }
export const goalCell: MazeCell = { row: 0, column: columns - 1 }

const cellKey = ({ row, column }: MazeCell) => `${row}:${column}`
const edgeKey = (a: MazeCell, b: MazeCell) => [cellKey(a), cellKey(b)].sort().join('|')
const inside = ({ row, column }: MazeCell) => row >= 0 && row < rows && column >= 0 && column < columns

function buildMaze() {
  let seed = fixedSeed
  const randomIndex = (length: number) => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0
    return seed % length
  }
  const passages = new Set<string>()
  const visited = new Set([cellKey(startCell)])
  const stack: MazeCell[] = [startCell]
  while (stack.length) {
    const current = stack[stack.length - 1]!
    const neighbors = directions
      .map(([row, column]) => ({ row: current.row + row, column: current.column + column }))
      .filter((cell) => inside(cell) && !visited.has(cellKey(cell)))
    if (!neighbors.length) {
      stack.pop()
      continue
    }
    const next = neighbors[randomIndex(neighbors.length)]!
    passages.add(edgeKey(current, next))
    visited.add(cellKey(next))
    stack.push(next)
  }
  return passages
}

export const mazePassages = buildMaze()

export function areCellsConnected(a: MazeCell, b: MazeCell): boolean {
  return mazePassages.has(edgeKey(a, b))
}

function buildWalls(): MazeWall[] {
  const walls: MazeWall[] = []
  const size = gameConfig.mazeGame.cellSize
  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const boundary = row === 0 || row === rows
      const connected = !boundary && areCellsConnected({ row: row - 1, column }, { row, column })
      if (!connected) walls.push({ x1: column * size, y1: row * size, x2: (column + 1) * size, y2: row * size })
    }
  }
  for (let column = 0; column <= columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const boundary = column === 0 || column === columns
      const connected = !boundary && areCellsConnected({ row, column: column - 1 }, { row, column })
      if (!connected) walls.push({ x1: column * size, y1: row * size, x2: column * size, y2: (row + 1) * size })
    }
  }
  return walls
}

export const mazeWalls = buildWalls()

export function cellCenter(cell: MazeCell): MazePoint {
  const size = gameConfig.mazeGame.cellSize
  return { x: (cell.column + 0.5) * size, y: (cell.row + 0.5) * size }
}

export const startPoint = cellCenter(startCell)
export const goalPoint = cellCenter(goalCell)

function routeToGoal(): MazeCell[] {
  const queue: MazeCell[] = [startCell]
  const previous = new Map<string, MazeCell | null>([[cellKey(startCell), null]])
  while (queue.length) {
    const current = queue.shift()!
    if (cellKey(current) === cellKey(goalCell)) break
    for (const [row, column] of directions) {
      const next = { row: current.row + row, column: current.column + column }
      if (!inside(next) || previous.has(cellKey(next)) || !areCellsConnected(current, next)) continue
      previous.set(cellKey(next), current)
      queue.push(next)
    }
  }
  const route: MazeCell[] = []
  let current: MazeCell | null | undefined = goalCell
  while (current) {
    route.push(current)
    current = previous.get(cellKey(current))
  }
  return route.reverse()
}

export const validRoute: readonly MazeCell[] = routeToGoal()

function distanceToWall(point: MazePoint, wall: MazeWall): number {
  const dx = wall.x2 - wall.x1
  const dy = wall.y2 - wall.y1
  const lengthSquared = dx * dx + dy * dy
  const position = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - wall.x1) * dx + (point.y - wall.y1) * dy) / lengthSquared))
  return Math.hypot(point.x - (wall.x1 + position * dx), point.y - (wall.y1 + position * dy))
}

export function isWalkable(point: MazePoint, tolerance: number = gameConfig.mazeGame.baseTolerance): boolean {
  if (point.x < 0 || point.y < 0 || point.x > gameConfig.mazeGame.width || point.y > gameConfig.mazeGame.height) return false
  const collisionRadius = Math.max(2.5, 8 - tolerance * 0.8)
  return mazeWalls.every((wall) => distanceToWall(point, wall) > collisionRadius)
}

export function isAtStart(point: MazePoint): boolean {
  return Math.hypot(point.x - startPoint.x, point.y - startPoint.y) <= 24
}

export function isAtGoal(point: MazePoint): boolean {
  return Math.hypot(point.x - goalPoint.x, point.y - goalPoint.y) <= 20
}

export function inspectSegment(from: MazePoint, to: MazePoint, tolerance: number = gameConfig.mazeGame.baseTolerance): SegmentResult {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  const steps = Math.max(1, Math.ceil(distance / 2))
  for (let index = 1; index <= steps; index += 1) {
    const fraction = index / steps
    const point = { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction }
    if (!isWalkable(point, tolerance)) return 'collision'
    if (isAtGoal(point)) return 'goal'
  }
  return 'clear'
}
