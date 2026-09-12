import type { Page } from '@playwright/test'
import { gameConfig, stageIds } from '../src/config/gameConfig'
import { createInitialState, gameReducer, type GameState } from '../src/state/gameState'
import { saveGame, type StorageLike } from '../src/state/persistence'

/** Build saved fixtures through the same transitions and serializer used by the app. */
export function stateAfterStages(completedCount: number): GameState {
  if (!Number.isInteger(completedCount) || completedCount < 0 || completedCount > stageIds.length) {
    throw new Error('A fixture must complete between zero and five stages.')
  }

  let state = gameReducer(createInitialState(), { type: 'START_ADVENTURE' })
  for (const stage of stageIds.slice(0, completedCount)) {
    state = gameReducer(state, { type: 'OPEN_GAME', stage })
    state = gameReducer(state, { type: 'COMPLETE_GAME', stage })
  }
  return state
}

export function serializeSavedGame(state: GameState): string {
  const values = new Map<string, string>()
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value) },
    removeItem: (key) => { values.delete(key) },
  }
  if (!saveGame(storage, state).ok) throw new Error('The production serializer rejected a fixture.')
  const serialized = values.get(gameConfig.storage.key)
  if (!serialized) throw new Error('The fixture was not saved.')
  return serialized
}

export async function openSerializedGame(page: Page, serialized: string): Promise<void> {
  await page.goto('./')
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: gameConfig.storage.key,
    value: serialized,
  })
  await page.reload()
}

export async function openSavedGame(page: Page, state: GameState): Promise<void> {
  await openSerializedGame(page, serializeSavedGame(state))
}

export async function readSavedValue(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), gameConfig.storage.key)
}
