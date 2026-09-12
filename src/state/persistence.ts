import { gameConfig } from '../config/gameConfig'
import { createInitialState, isGameState, type GameState } from './gameState'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type PersistenceStatus =
  | 'missing'
  | 'restored'
  | 'invalid'
  | 'unsupported'
  | 'unavailable'

export interface PersistenceReadResult {
  status: PersistenceStatus
  state: GameState
}

export type PersistenceSaveResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'unsupported' | 'invalid-state' }

export type PersistenceClearResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' }

function freshResult(status: PersistenceStatus): PersistenceReadResult {
  return { status, state: createInitialState() }
}

export function readSavedGame(storage: StorageLike | null): PersistenceReadResult {
  if (!storage) return freshResult('unavailable')

  let serialized: string | null
  try {
    serialized = storage.getItem(gameConfig.storage.key)
  } catch {
    return freshResult('unavailable')
  }
  if (serialized === null) return freshResult('missing')

  let envelope: unknown
  try {
    envelope = JSON.parse(serialized) as unknown
  } catch {
    return freshResult('invalid')
  }
  if (typeof envelope !== 'object' || envelope === null || Array.isArray(envelope)) {
    return freshResult('invalid')
  }

  const record = envelope as Record<string, unknown>
  if (typeof record.version !== 'number' || !Number.isSafeInteger(record.version) || record.version < 1) {
    return freshResult('invalid')
  }
  if (record.version !== gameConfig.storage.schemaVersion) {
    return freshResult('unsupported')
  }
  if (Object.keys(record).some((key) => key !== 'version' && key !== 'state') || !isGameState(record.state)) {
    return freshResult('invalid')
  }

  return { status: 'restored', state: record.state }
}

export function saveGame(
  storage: StorageLike | null,
  state: GameState,
): PersistenceSaveResult {
  if (!isGameState(state)) return { ok: false, reason: 'invalid-state' }

  const existing = readSavedGame(storage)
  if (!storage || existing.status === 'unavailable') return { ok: false, reason: 'unavailable' }
  if (existing.status === 'unsupported') return { ok: false, reason: 'unsupported' }

  try {
    storage.setItem(
      gameConfig.storage.key,
      JSON.stringify({ version: gameConfig.storage.schemaVersion, state }),
    )
    return { ok: true }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}

export function clearSavedGame(storage: StorageLike | null): PersistenceClearResult {
  if (!storage) return { ok: false, reason: 'unavailable' }

  try {
    storage.removeItem(gameConfig.storage.key)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
