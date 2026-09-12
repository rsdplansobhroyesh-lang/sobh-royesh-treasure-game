import { describe, expect, it } from 'vitest'
import { gameConfig } from '../../config/gameConfig'
import {
  createTimerGameState,
  elapsedCentiseconds,
  formatTimer,
  timerGameReducer,
} from './timerGame'

describe('timer calculation', () => {
  it('rounds elapsed monotonic milliseconds to the displayed centisecond', () => {
    expect(elapsedCentiseconds(1_000, 1_000)).toBe(0)
    expect(elapsedCentiseconds(1_000, 10_994)).toBe(999)
    expect(elapsedCentiseconds(1_000, 10_995)).toBe(1_000)
    expect(elapsedCentiseconds(1_000, 11_004)).toBe(1_000)
    expect(elapsedCentiseconds(1_000, 11_005)).toBe(1_001)
  })

  it('formats seconds and centiseconds consistently', () => {
    expect(formatTimer(0)).toBe('0:00')
    expect(formatTimer(984)).toBe('9:84')
    expect(formatTimer(gameConfig.timerGame.targetCentiseconds)).toBe('10:00')
  })
})

describe('timer attempt state', () => {
  it('accepts only the exact displayed 10:00 value', () => {
    const initial = createTimerGameState()
    expect(timerGameReducer(initial, { type: 'STOP', elapsedCentiseconds: 999 }).phase).toBe('failed')
    expect(timerGameReducer(initial, { type: 'STOP', elapsedCentiseconds: 1_000 }).phase).toBe('success')
    expect(timerGameReducer(initial, { type: 'STOP', elapsedCentiseconds: 1_001 }).phase).toBe('failed')
  })

  it('leaves two attempts after the first miss and one after the second', () => {
    let state = timerGameReducer(createTimerGameState(), { type: 'STOP', elapsedCentiseconds: 984 })
    expect(state).toMatchObject({ phase: 'failed', attemptsRemaining: 2, displayedCentiseconds: 984 })
    state = timerGameReducer(state, { type: 'RETRY' })
    expect(state).toMatchObject({ phase: 'running', attemptsRemaining: 2, displayedCentiseconds: 0 })
    state = timerGameReducer(state, { type: 'STOP', elapsedCentiseconds: 1_017 })
    expect(state).toMatchObject({ phase: 'failed', attemptsRemaining: 1 })
  })

  it('opens the wand after the third miss and blocks more normal attempts', () => {
    let state = createTimerGameState()
    for (const elapsedCentiseconds of [850, 930, 1_080]) {
      state = timerGameReducer(state, { type: 'STOP', elapsedCentiseconds })
      if (state.phase === 'failed') state = timerGameReducer(state, { type: 'RETRY' })
    }
    expect(state).toMatchObject({ phase: 'wand-ready', attemptsRemaining: 0, displayedCentiseconds: 1_080 })
    expect(timerGameReducer(state, { type: 'RETRY' })).toBe(state)
    expect(timerGameReducer(state, { type: 'STOP', elapsedCentiseconds: 1_000 })).toBe(state)
  })

  it('finishes wand activation at exactly 10:00', () => {
    const ready = { phase: 'wand-ready' as const, attemptsRemaining: 0, displayedCentiseconds: 1_080 }
    let state = timerGameReducer(ready, { type: 'ACTIVATE_WAND' })
    state = timerGameReducer(state, { type: 'WAND_TICK', elapsedCentiseconds: 1_025 })
    expect(state).toMatchObject({ phase: 'wand-activating', displayedCentiseconds: 1_025 })
    state = timerGameReducer(state, { type: 'WAND_FINISHED' })
    expect(state).toEqual({ phase: 'wand-success', attemptsRemaining: 0, displayedCentiseconds: 1_000 })
  })
})
