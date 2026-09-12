import { useEffect, useReducer, useRef, useState, type FormEvent } from 'react'
import { MemoryScene } from './MemoryScene'
import {
  createMemoryGameState,
  getObservationDuration,
  memoryGameReducer,
} from './memoryGame'

interface MemoryGameScreenProps {
  onReturn: () => void
  onComplete: () => void
}

const persianNumber = new Intl.NumberFormat('fa-IR')

export function MemoryGameScreen({ onReturn, onComplete }: MemoryGameScreenProps) {
  const [state, dispatch] = useReducer(memoryGameReducer, undefined, createMemoryGameState)
  const duration = getObservationDuration(state.attempt)
  const [remainingSeconds, setRemainingSeconds] = useState(() => Math.ceil(duration / 1000))
  const answerInput = useRef<HTMLInputElement>(null)
  const retryButton = useRef<HTMLButtonElement>(null)
  const continueButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state.phase !== 'observing') return
    const startedAt = performance.now()
    setRemainingSeconds(Math.ceil(duration / 1000))
    const updateCountdown = () => {
      const remaining = Math.max(0, duration - (performance.now() - startedAt))
      setRemainingSeconds(Math.max(1, Math.ceil(remaining / 1000)))
    }
    const countdownId = window.setInterval(updateCountdown, 100)
    const finishId = window.setTimeout(() => {
      window.clearInterval(countdownId)
      dispatch({ type: 'OBSERVATION_FINISHED' })
    }, duration)
    return () => {
      window.clearInterval(countdownId)
      window.clearTimeout(finishId)
    }
  }, [duration, state.attempt, state.phase])

  useEffect(() => {
    if (state.phase === 'answering') answerInput.current?.focus()
    if (state.phase === 'wrong') retryButton.current?.focus()
    if (state.phase === 'success') continueButton.current?.focus()
  }, [state.phase])

  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: 'SUBMIT_ANSWER' })
  }

  return <section className="memory-screen screen" aria-labelledby="game-title">
    <div className="memory-heading">
      <div>
        <p className="eyebrow">مرحلهٔ ۱ از ۵ · حافظهٔ تصویری</p>
        <h1 id="game-title">کلاس پر از نشانه</h1>
      </div>
      <span className="memory-stage-mark" aria-hidden="true">۱</span>
    </div>

    {state.phase === 'observing' && <div
      className="memory-observation"
      data-testid="memory-observation"
      data-attempt={state.attempt}
      data-duration-ms={duration}
    >
      <div className="memory-instruction">
        <div>
          <h2>{state.attempt === 1 ? 'تصویر را خوب به خاطر بسپار' : 'این بار دقیق‌تر نگاه کن'}</h2>
          <p>به رنگ وسایل و جزئیات کلاس دقت کن.</p>
        </div>
        <div className="memory-countdown" role="timer" aria-label={`${persianNumber.format(remainingSeconds)} ثانیه باقی مانده`}>
          <span>{persianNumber.format(remainingSeconds)}</span>
          <small>ثانیه</small>
        </div>
      </div>
      <div className="memory-scene-frame">
        <MemoryScene />
      </div>
    </div>}

    {state.phase === 'answering' && <div className="memory-question-panel memory-panel-enter" data-testid="memory-answer-screen">
      <span className="memory-panel-icon" aria-hidden="true">؟</span>
      <h2>چند شیء زرد توی تصویر بود؟</h2>
      <p>عددی که به خاطر داری وارد کن.</p>
      <form className="memory-answer-form" onSubmit={submitAnswer}>
        <label htmlFor="memory-answer">تعداد اشیای زرد</label>
        <input
          ref={answerInput}
          id="memory-answer"
          name="memory-answer"
          className="memory-answer-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9۰-۹٠-٩]+"
          maxLength={2}
          required
          value={state.answer}
          onChange={(event) => {
            if (/^[0-9۰-۹٠-٩]*$/.test(event.target.value)) {
              dispatch({ type: 'SET_ANSWER', answer: event.target.value })
            }
          }}
        />
        <button type="submit" className="button button-primary">ثبت پاسخ</button>
      </form>
    </div>}

    {state.phase === 'wrong' && <div className="memory-feedback memory-feedback-wrong memory-panel-enter" data-testid="memory-wrong-state" role="alert">
      <span className="memory-feedback-symbol" aria-hidden="true">↻</span>
      <h2>سوختی! دوباره امتحان کن.</h2>
      <p>پاسخ درست نمایش داده نمی‌شود؛ یک بار دیگر تصویر را ببین.</p>
      <button ref={retryButton} type="button" className="button button-primary" onClick={() => dispatch({ type: 'RETRY' })}>
        دوباره ببین
      </button>
    </div>}

    {state.phase === 'success' && <div className="memory-feedback memory-feedback-success memory-panel-enter" data-testid="memory-success-state" role="status">
      <span className="memory-feedback-symbol" aria-hidden="true">✓</span>
      <h2>آفرین! حالا برو مرحله بعدی.</h2>
      <p>نشانه‌ها را دقیق دیدی و مرحلهٔ حافظه را کامل کردی.</p>
      <button ref={continueButton} type="button" className="button button-primary" onClick={onComplete}>
        ادامه مسیر <span aria-hidden="true">←</span>
      </button>
    </div>}

    {state.phase !== 'success' && <button type="button" className="button button-quiet memory-return" onClick={onReturn}>
      بازگشت به مسیر
    </button>}
  </section>
}
