import { useEffect, useReducer, useRef } from 'react'
import { gameConfig } from '../../config/gameConfig'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MagicWand } from './MagicWand'
import {
  createTimerGameState,
  elapsedCentiseconds,
  formatTimer,
  timerGameReducer,
} from './timerGame'

interface TimerGameScreenProps {
  onReturn: () => void
  onComplete: () => void
}

const persianNumber = new Intl.NumberFormat('fa-IR')

export function TimerGameScreen({ onReturn, onComplete }: TimerGameScreenProps) {
  const [state, dispatch] = useReducer(timerGameReducer, undefined, createTimerGameState)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const startedAt = useRef(0)
  const frameId = useRef<number | null>(null)
  const stopLocked = useRef(false)
  const wandFrom = useRef(0)
  const retryButton = useRef<HTMLButtonElement>(null)
  const wandButton = useRef<HTMLButtonElement>(null)
  const continueButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state.phase !== 'running') return
    stopLocked.current = false
    startedAt.current = performance.now()
    dispatch({ type: 'TICK', elapsedCentiseconds: 0 })
    let disposed = false
    const update = () => {
      if (disposed) return
      dispatch({
        type: 'TICK',
        elapsedCentiseconds: elapsedCentiseconds(startedAt.current, performance.now()),
      })
      frameId.current = requestAnimationFrame(update)
    }
    frameId.current = requestAnimationFrame(update)
    return () => {
      disposed = true
      if (frameId.current !== null) cancelAnimationFrame(frameId.current)
      frameId.current = null
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'wand-activating') return
    if (reducedMotion) {
      dispatch({ type: 'WAND_FINISHED' })
      return
    }
    const animationStartedAt = performance.now()
    const from = wandFrom.current
    let disposed = false
    const updateMagic = () => {
      if (disposed) return
      const fraction = Math.min(1, (performance.now() - animationStartedAt) / gameConfig.timerGame.magicDurationMs)
      const eased = 1 - (1 - fraction) ** 3
      const value = Math.round(from + (gameConfig.timerGame.targetCentiseconds - from) * eased)
      dispatch({ type: 'WAND_TICK', elapsedCentiseconds: value })
      if (fraction >= 1) {
        dispatch({ type: 'WAND_FINISHED' })
        return
      }
      frameId.current = requestAnimationFrame(updateMagic)
    }
    frameId.current = requestAnimationFrame(updateMagic)
    return () => {
      disposed = true
      if (frameId.current !== null) cancelAnimationFrame(frameId.current)
      frameId.current = null
    }
  }, [reducedMotion, state.phase])

  useEffect(() => {
    if (state.phase === 'failed') retryButton.current?.focus()
    if (state.phase === 'wand-ready') wandButton.current?.focus()
    if (state.phase === 'success' || state.phase === 'wand-success') continueButton.current?.focus()
  }, [state.phase])

  const stopTimer = () => {
    if (state.phase !== 'running' || stopLocked.current) return
    stopLocked.current = true
    dispatch({
      type: 'STOP',
      elapsedCentiseconds: elapsedCentiseconds(startedAt.current, performance.now()),
    })
  }

  const activateWand = () => {
    if (state.phase !== 'wand-ready') return
    wandFrom.current = state.displayedCentiseconds
    dispatch({ type: 'ACTIVATE_WAND' })
  }

  const successful = state.phase === 'success'
  const magicalSuccess = state.phase === 'wand-success'
  const showWand = state.phase === 'wand-ready' || state.phase === 'wand-activating' || magicalSuccess

  return <section className="timer-screen screen" aria-labelledby="game-title">
    <div className="timer-heading">
      <div>
        <p className="eyebrow">مرحلهٔ ۲ از ۵ · چالش زمان</p>
        <h1 id="game-title">ایست روی ده ثانیه</h1>
      </div>
      <span className="timer-stage-mark" aria-hidden="true">۲</span>
    </div>

    <div className={`timer-console timer-console-${state.phase}`}>
      <div className="timer-meta">
        <span>هدف: <strong dir="ltr">10:00</strong></span>
        <span data-testid="timer-attempts">فرصت باقی‌مانده: <strong>{persianNumber.format(state.attemptsRemaining)}</strong></span>
      </div>
      <p className="timer-instruction">تایمر را دقیقاً روی <bdi>10:00</bdi> متوقف کن.</p>
      <output
        className="timer-display"
        data-testid="timer-display"
        data-centiseconds={state.displayedCentiseconds}
        aria-label={`زمان ثبت‌شده ${formatTimer(state.displayedCentiseconds)}`}
        dir="ltr"
      >
        {formatTimer(state.displayedCentiseconds)}
      </output>

      {state.phase === 'running' && <button
        type="button"
        className="timer-stop"
        data-testid="timer-stop"
        onClick={stopTimer}
      >
        <span>ایست</span>
        <small>STOP</small>
      </button>}

      {state.phase === 'failed' && <div className="timer-result timer-result-failed" role="status" data-testid="timer-failed">
        <h2>نشد! دوباره تلاش کن.</h2>
        <p>زمان ثبت شد؛ فرصت بعدی از صفر شروع می‌شود.</p>
        <button ref={retryButton} type="button" className="button button-primary" onClick={() => dispatch({ type: 'RETRY' })}>
          تلاش دوباره
        </button>
      </div>}

      {successful && <div className="timer-result timer-result-success" role="status" data-testid="timer-success">
        <span className="timer-success-mark" aria-hidden="true">✓</span>
        <h2>عالی بود! دقیقاً روی <bdi>10:00</bdi>!</h2>
        <button ref={continueButton} type="button" className="button button-primary" onClick={onComplete}>
          ادامه مسیر <span aria-hidden="true">←</span>
        </button>
      </div>}

      {showWand && <div className="timer-magic" data-testid={magicalSuccess ? 'wand-success' : 'wand-state'}>
        <MagicWand active={state.phase === 'wand-activating'} />
        {state.phase === 'wand-ready' && <>
          <h2>عیب نداره! تو یه قدرت ویژه داری.</h2>
          <p>می‌تونی از چوب جادو استفاده کنی و بری مرحله بعد.</p>
          <button ref={wandButton} type="button" className="button button-primary" onClick={activateWand}>
            استفاده از چوب جادو
          </button>
        </>}
        {state.phase === 'wand-activating' && <p className="timer-magic-working" role="status">جادو در حال انجام است…</p>}
        {magicalSuccess && <>
          <h2 role="status">جادو انجام شد!</h2>
          <p>زمان درست روی <bdi>10:00</bdi> قرار گرفت.</p>
          <button ref={continueButton} type="button" className="button button-primary" onClick={onComplete}>
            ادامه مسیر <span aria-hidden="true">←</span>
          </button>
        </>}
      </div>}
    </div>

    {!successful && !magicalSuccess && <button type="button" className="button button-quiet timer-return" onClick={onReturn}>
      بازگشت به مسیر
    </button>}
  </section>
}
