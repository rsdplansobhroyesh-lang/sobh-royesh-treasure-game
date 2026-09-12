import { describe, expect, it } from 'vitest'
import { gameConfig } from '../../config/gameConfig'
import {
  createMemoryGameState,
  getObservationDuration,
  memoryGameReducer,
  parseMemoryAnswer,
} from './memoryGame'

describe('memory game configuration', () => {
  it('defines exactly seven named yellow objects and answer seven centrally', () => {
    expect(gameConfig.memoryGame.correctAnswer).toBe(7)
    expect(gameConfig.memoryGame.yellowObjects).toHaveLength(7)
    expect(new Set(gameConfig.memoryGame.yellowObjects).size).toBe(7)
  })

  it('uses ten seconds first and five seconds for every retry', () => {
    expect(getObservationDuration(1)).toBe(10_000)
    expect(getObservationDuration(2)).toBe(5_000)
    expect(getObservationDuration(8)).toBe(5_000)
  })
})

describe('memory game state', () => {
  it('moves from observation to an unanswered question', () => {
    const state = memoryGameReducer(createMemoryGameState(), { type: 'OBSERVATION_FINISHED' })
    expect(state).toEqual({ phase: 'answering', attempt: 1, answer: '' })
  })

  it('keeps a wrong result local and starts a five-second retry', () => {
    let state = memoryGameReducer(createMemoryGameState(), { type: 'OBSERVATION_FINISHED' })
    state = memoryGameReducer(state, { type: 'SET_ANSWER', answer: '6' })
    state = memoryGameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state).toEqual({ phase: 'wrong', attempt: 1, answer: '' })
    state = memoryGameReducer(state, { type: 'RETRY' })
    expect(state).toEqual({ phase: 'observing', attempt: 2, answer: '' })
    expect(getObservationDuration(state.attempt)).toBe(5_000)
  })

  it('accepts Latin, Persian, and Arabic seven without broad fuzzy matching', () => {
    expect(parseMemoryAnswer('7')).toBe(7)
    expect(parseMemoryAnswer(' ۷ ')).toBe(7)
    expect(parseMemoryAnswer('٧')).toBe(7)
    expect(parseMemoryAnswer('هفت')).toBeNull()
    expect(parseMemoryAnswer('7.0')).toBeNull()
  })

  it('reaches success only from a submitted correct answer', () => {
    let state = memoryGameReducer(createMemoryGameState(), { type: 'OBSERVATION_FINISHED' })
    state = memoryGameReducer(state, { type: 'SET_ANSWER', answer: '۷' })
    state = memoryGameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.phase).toBe('success')
    expect(memoryGameReducer(state, { type: 'RETRY' })).toBe(state)
  })
})
