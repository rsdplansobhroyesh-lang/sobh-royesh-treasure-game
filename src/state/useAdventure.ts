import { useCallback, useEffect, useRef, useState } from 'react'
import { gameConfig } from '../config/gameConfig'
import { createInitialState, gameReducer } from './gameState'
import type { GameAction, GameState } from './gameState'
import { clearSavedGame, readSavedGame, saveGame } from './persistence'
import type { PersistenceStatus, StorageLike } from './persistence'
import { detectMapTravel, type MapTravel } from './mapTravel'

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const storageMessages: Partial<Record<PersistenceStatus, string>> = {
  invalid: 'ذخیرهٔ قبلی قابل خواندن نبود. می‌تونی ماجراجویی تازه‌ای شروع کنی.',
  unsupported: 'ذخیرهٔ قبلی مربوط به نسخهٔ دیگری است و تغییر نمی‌کند. برای شروع تازه، از «شروع دوبارهٔ ماجراجویی» استفاده کن.',
  unavailable: 'مرورگر اجازهٔ ذخیره نمی‌دهد؛ پیشرفت این نوبت ممکن است با بستن یا تازه‌کردن صفحه از دست برود.',
}

export function useAdventure() {
  const [session, setSession] = useState(() => readSavedGame(browserStorage()))
  const [storageMessage, setStorageMessage] = useState(() => storageMessages[session.status])
  const [resetError, setResetError] = useState<string | undefined>()
  const stateRef = useRef(session.state)
  const [mapTravel, setMapTravel] = useState<MapTravel | null>(null)
  const travelRef = useRef<MapTravel | null>(null)
  const travelId = useRef(0)

  const replaceState = useCallback((state: GameState) => {
    const movement = detectMapTravel(stateRef.current, state)
    const travel = movement ? { ...movement, id: ++travelId.current } : null
    travelRef.current = travel
    setMapTravel(travel)
    stateRef.current = state
    setSession({ status: 'restored', state })
  }, [])

  const dispatch = useCallback((action: GameAction) => {
    if (travelRef.current && (action.type === 'OPEN_GAME' || action.type === 'OPEN_TREASURE')) return
    const next = gameReducer(stateRef.current, action)
    if (next === stateRef.current) return

    const result = saveGame(browserStorage(), next)
    setStorageMessage(result.ok ? undefined : result.reason === 'unsupported'
      ? storageMessages.unsupported
      : storageMessages.unavailable)
    replaceState(next)
  }, [replaceState])

  const confirmReset = useCallback(() => {
    const result = clearSavedGame(browserStorage())
    if (!result.ok) {
      setResetError('پاک‌کردن ذخیره انجام نشد. تنظیمات ذخیره‌سازی مرورگر را بررسی کن و دوباره تلاش کن.')
      return false
    }
    replaceState(createInitialState())
    setStorageMessage(undefined)
    setResetError(undefined)
    return true
  }, [replaceState])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== browserStorage()) return
      if (event.key !== null && event.key !== gameConfig.storage.key) return
      const restored = readSavedGame(browserStorage())
      if (restored.status === 'unavailable') {
        setStorageMessage(storageMessages.unavailable)
        return
      }
      replaceState(restored.state)
      setStorageMessage(storageMessages[restored.status])
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [replaceState])

  const finishMapTravel = useCallback((id: number) => {
    if (travelRef.current?.id !== id) return
    travelRef.current = null
    setMapTravel(null)
  }, [])

  return {
    state: session.state,
    mapTravel,
    finishMapTravel,
    dispatch,
    storageMessage,
    resetError,
    clearResetError: () => setResetError(undefined),
    confirmReset,
  }
}
