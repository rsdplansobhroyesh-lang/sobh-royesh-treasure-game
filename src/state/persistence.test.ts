import { describe, expect, it } from 'vitest'
import { gameConfig } from '../config/gameConfig'
import { createInitialState, type GameState } from './gameState'
import { clearSavedGame, readSavedGame, saveGame, type StorageLike } from './persistence'

function memoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value) },
    removeItem: (key) => { values.delete(key) },
  }
}

describe('adventure persistence', () => {
  it('initializes missing storage without modifying it', () => {
    const storage = memoryStorage()
    expect(readSavedGame(storage)).toEqual({ status: 'missing', state: createInitialState() })
    expect(storage.getItem(gameConfig.storage.key)).toBeNull()
  })

  it.each<GameState>([
    { screen: 'INTRO', completedStages: [] },
    { screen: 'MAP', completedStages: [1, 2] },
    { screen: 'GAME_3', completedStages: [1, 2] },
    { screen: 'MAP', completedStages: [1, 2, 3, 4, 5] },
    { screen: 'TREASURE_COMPLETE', completedStages: [1, 2, 3, 4, 5] },
  ])('restores a versioned state after a refresh %#', (state) => {
    const storage = memoryStorage()
    expect(saveGame(storage, state)).toEqual({ ok: true })
    expect(JSON.parse(storage.getItem(gameConfig.storage.key) ?? '')).toEqual({
      version: gameConfig.storage.schemaVersion,
      state,
    })
    const loaded = readSavedGame(storage)
    expect(loaded).toEqual({ status: 'restored', state })
    expect(loaded.state).not.toBe(state)
  })

  it.each([
    '',
    'not json',
    'null',
    '[]',
    '{}',
    JSON.stringify({ version: '1', state: createInitialState() }),
    JSON.stringify({ version: -1, state: createInitialState() }),
    JSON.stringify({ version: 1.5, state: createInitialState() }),
    JSON.stringify({ version: 1, state: { screen: 'GAME_5', completedStages: [] } }),
    JSON.stringify({ version: 1, state: { screen: 'MAP', completedStages: [1, 3] } }),
    JSON.stringify({ version: 1, state: createInitialState(), unexpected: true }),
  ])('recovers from corrupt or invalid persisted data %#', (serialized) => {
    const storage = memoryStorage()
    storage.setItem(gameConfig.storage.key, serialized)
    expect(readSavedGame(storage)).toEqual({ status: 'invalid', state: createInitialState() })
    expect(saveGame(storage, createInitialState())).toEqual({ ok: true })
    expect(readSavedGame(storage).status).toBe('restored')
  })

  it('preserves data from a future schema until an explicit clear', () => {
    const storage = memoryStorage()
    const futureData = JSON.stringify({ version: 2, state: { future: true } })
    storage.setItem(gameConfig.storage.key, futureData)

    expect(readSavedGame(storage)).toEqual({ status: 'unsupported', state: createInitialState() })
    expect(saveGame(storage, createInitialState())).toEqual({ ok: false, reason: 'unsupported' })
    expect(storage.getItem(gameConfig.storage.key)).toBe(futureData)
    expect(clearSavedGame(storage)).toEqual({ ok: true })
    expect(readSavedGame(storage).status).toBe('missing')
  })

  it('checks the current stored version on every save', () => {
    const storage = memoryStorage()
    expect(saveGame(storage, createInitialState())).toEqual({ ok: true })
    storage.setItem(gameConfig.storage.key, JSON.stringify({ version: 3, state: {} }))
    expect(saveGame(storage, { screen: 'MAP', completedStages: [] })).toEqual({
      ok: false, reason: 'unsupported',
    })
  })

  it('refuses to save an inconsistent state', () => {
    const storage = memoryStorage()
    expect(saveGame(storage, { screen: 'GAME_5', completedStages: [] })).toEqual({
      ok: false, reason: 'invalid-state',
    })
    expect(storage.getItem(gameConfig.storage.key)).toBeNull()
  })

  it('clears only this adventure and leaves unrelated storage intact', () => {
    const storage = memoryStorage()
    storage.setItem('another-app', 'keep')
    saveGame(storage, { screen: 'GAME_3', completedStages: [1, 2] })

    expect(clearSavedGame(storage)).toEqual({ ok: true })
    expect(readSavedGame(storage)).toEqual({ status: 'missing', state: createInitialState() })
    expect(storage.getItem('another-app')).toBe('keep')
  })

  it('reports unavailable storage without throwing', () => {
    expect(readSavedGame(null)).toEqual({ status: 'unavailable', state: createInitialState() })
    expect(saveGame(null, createInitialState())).toEqual({ ok: false, reason: 'unavailable' })
    expect(clearSavedGame(null)).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('handles security restrictions when reading browser storage', () => {
    const storage = memoryStorage()
    storage.getItem = () => { throw new Error('Storage access denied') }
    expect(readSavedGame(storage)).toEqual({ status: 'unavailable', state: createInitialState() })
    expect(saveGame(storage, createInitialState())).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('reports write failure without changing the last saved progress', () => {
    const storage = memoryStorage()
    const previous: GameState = { screen: 'MAP', completedStages: [1] }
    saveGame(storage, previous)
    storage.setItem = () => { throw new Error('Storage quota exceeded') }

    expect(saveGame(storage, { screen: 'GAME_2', completedStages: [1] })).toEqual({
      ok: false, reason: 'unavailable',
    })
    expect(readSavedGame(storage)).toEqual({ status: 'restored', state: previous })
  })

  it('reports a failed clear and preserves existing progress', () => {
    const storage = memoryStorage()
    const previous: GameState = { screen: 'GAME_3', completedStages: [1, 2] }
    saveGame(storage, previous)
    storage.removeItem = () => { throw new Error('Storage access denied') }

    expect(clearSavedGame(storage)).toEqual({ ok: false, reason: 'unavailable' })
    expect(readSavedGame(storage)).toEqual({ status: 'restored', state: previous })
  })
})
