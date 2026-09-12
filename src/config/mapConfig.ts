import { gameConfig, type StageId } from './gameConfig'

export type Point = Readonly<{ x: number; y: number }>
export type MapStop = 'start' | StageId | 'treasure'
export type LandmarkTheme = 'memory' | 'timer' | 'observation' | 'maze' | 'puzzle'
export interface RouteSegment { from: Point; control1: Point; control2: Point; to: Point }
export interface MapLayout {
  width: number
  height: number
  landmarks: Record<StageId | 'treasure', Point>
  stops: Record<MapStop, Point>
  segments: readonly RouteSegment[]
  island: string
  river: string
  bridge: Point & { rotation: number }
}

const themes: Record<StageId, { theme: LandmarkTheme; shortTitle: string }> = {
  1: { theme: 'memory', shortTitle: 'حافظه' },
  2: { theme: 'timer', shortTitle: 'زمان' },
  3: { theme: 'observation', shortTitle: 'کشف تصویر' },
  4: { theme: 'maze', shortTitle: 'هزارتو' },
  5: { theme: 'puzzle', shortTitle: 'سودوکو' },
}

export const checkpoints = gameConfig.stages.map((stage) => ({ ...stage, ...themes[stage.id] }))
export const mapConfig = { wideBreakpoint: '(min-width: 768px)', travelDurationMs: 1350 } as const

const portraitStops: Record<MapStop, Point> = {
  start: { x: 324, y: 565 }, 1: { x: 247, y: 502 }, 2: { x: 155, y: 427 },
  3: { x: 225, y: 338 }, 4: { x: 163, y: 251 }, 5: { x: 237, y: 167 },
  treasure: { x: 181, y: 118 },
}
const wideStops: Record<MapStop, Point> = {
  start: { x: 875, y: 494 }, 1: { x: 785, y: 422 }, 2: { x: 610, y: 430 },
  3: { x: 393, y: 343 }, 4: { x: 538, y: 252 }, 5: { x: 318, y: 161 },
  treasure: { x: 197, y: 212 },
}

function routes(stops: Record<MapStop, Point>, controls: readonly (readonly [Point, Point])[]): RouteSegment[] {
  const order: readonly MapStop[] = ['start', 1, 2, 3, 4, 5, 'treasure']
  return controls.map(([control1, control2], index) => {
    const from = order[index]
    const to = order[index + 1]
    if (from === undefined || to === undefined) throw new Error('Route control count does not match map stops.')
    return { from: stops[from], control1, control2, to: stops[to] }
  })
}

export const mapLayouts: Record<'portrait' | 'wide', MapLayout> = {
  portrait: {
    width: 400, height: 620,
    landmarks: { 1: { x: 293, y: 477 }, 2: { x: 109, y: 404 }, 3: { x: 291, y: 314 }, 4: { x: 107, y: 228 }, 5: { x: 294, y: 142 }, treasure: { x: 119, y: 95 } },
    stops: portraitStops,
    segments: routes(portraitStops, [
      [{ x: 312, y: 552 }, { x: 278, y: 531 }],
      [{ x: 218, y: 482 }, { x: 177, y: 466 }],
      [{ x: 160, y: 406 }, { x: 202, y: 371 }],
      [{ x: 258, y: 303 }, { x: 207, y: 282 }],
      [{ x: 126, y: 222 }, { x: 194, y: 188 }],
      [{ x: 253, y: 143 }, { x: 215, y: 127 }],
    ]),
    island: 'M43 103 Q25 57 79 42 Q160 12 216 56 Q275 44 343 86 Q387 125 360 190 Q391 252 363 299 Q385 352 363 398 Q390 455 365 531 Q348 589 292 591 Q214 602 167 564 Q89 586 52 529 Q19 475 43 420 Q13 368 44 305 Q21 256 46 210 Q16 156 43 103Z',
    river: 'M25 390 C91 358 139 370 186 390 C239 413 293 388 378 353',
    bridge: { x: 187, y: 390, rotation: 45 },
  },
  wide: {
    width: 1000, height: 590,
    landmarks: { 1: { x: 828, y: 393 }, 2: { x: 553, y: 402 }, 3: { x: 304, y: 318 }, 4: { x: 600, y: 224 }, 5: { x: 387, y: 125 }, treasure: { x: 121, y: 186 } },
    stops: wideStops,
    segments: routes(wideStops, [
      [{ x: 854, y: 473 }, { x: 824, y: 444 }],
      [{ x: 742, y: 401 }, { x: 674, y: 438 }],
      [{ x: 557, y: 439 }, { x: 465, y: 369 }],
      [{ x: 356, y: 306 }, { x: 486, y: 282 }],
      [{ x: 565, y: 202 }, { x: 445, y: 186 }],
      [{ x: 284, y: 138 }, { x: 249, y: 188 }],
    ]),
    island: 'M50 208 Q43 130 140 110 Q186 51 304 80 Q401 45 468 98 Q535 72 628 122 Q728 109 777 199 Q899 180 946 262 Q978 332 943 385 Q977 470 905 510 Q826 558 735 521 Q623 562 544 528 Q439 548 365 501 Q231 521 190 459 Q84 448 70 375 Q26 303 50 208Z',
    river: 'M145 462 C278 405 421 495 500 390 C538 339 545 455 570 521',
    bridge: { x: 500, y: 390, rotation: -70 },
  },
}

export function segmentPath(segment: RouteSegment): string {
  const { from: a, control1: b, control2: c, to: d } = segment
  return `M${a.x} ${a.y} C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`
}

export function pointOnSegment(segment: RouteSegment, fraction: number): Point {
  const t = Math.min(1, Math.max(0, fraction))
  const u = 1 - t
  const { from: a, control1: b, control2: c, to: d } = segment
  return {
    x: u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y,
  }
}
