import { useEffect, useReducer, useRef, useState } from 'react'
import { gameConfig } from '../../config/gameConfig'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MagicWand } from '../timer/MagicWand'
import { ImageGuessPhoto } from './ImageGuessPhoto'
import {
  createImageGuessState,
  imageGuessReducer,
  normalizePersianAnswer,
  remainingNormalAttempts,
} from './imageGuessGame'

interface ImageGuessGameScreenProps {
  onReturn: () => void
  onComplete: () => void
}

const persianNumber = new Intl.NumberFormat('fa-IR')

export function ImageGuessGameScreen({ onReturn, onComplete }: ImageGuessGameScreenProps) {
  const [state, dispatch] = useReducer(imageGuessReducer, undefined, createImageGuessState)
  const [answer, setAnswer] = useState('')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const submitLocked = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const choiceRef = useRef<HTMLButtonElement>(null)
  const continueRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    submitLocked.current = false
    if (state.phase === 'answering' && state.normalAttemptsUsed > 0) inputRef.current?.focus()
    if (state.phase === 'magic-choice') choiceRef.current?.focus()
    if (state.phase === 'revealed') continueRef.current?.focus()
  }, [state.hintLevel, state.normalAttemptsUsed, state.phase, state.validationError])

  useEffect(() => {
    if (state.phase !== 'magic-activating') return
    const delay = reducedMotion ? 0 : gameConfig.imageGuessGame.magicDurationMs
    const timeout = window.setTimeout(() => dispatch({ type: 'FINISH_MAGIC' }), delay)
    return () => window.clearTimeout(timeout)
  }, [reducedMotion, state.phase])

  const submitAnswer = () => {
    if (state.phase !== 'answering' || submitLocked.current) return
    submitLocked.current = true
    const hasAnswer = normalizePersianAnswer(answer).length > 0
    dispatch({ type: 'SUBMIT', answer })
    if (hasAnswer) setAnswer('')
  }

  const revealed = state.phase === 'revealed' || state.phase === 'magic-activating'
  const remaining = remainingNormalAttempts(state)

  return <section className="image-guess-screen screen" aria-labelledby="game-title">
    <div className="image-guess-heading">
      <div>
        <p className="eyebrow">مرحلهٔ ۳ از ۵ · معمای تصویر</p>
        <h1 id="game-title">این تصویر چیه؟</h1>
      </div>
      <span className="image-guess-stage-mark" aria-hidden="true">۳</span>
    </div>

    <div className="image-guess-card">
      <ImageGuessPhoto
        zoomScale={gameConfig.imageGuessGame.zoomScale}
        focalX={gameConfig.imageGuessGame.focalX}
        focalY={gameConfig.imageGuessGame.focalY}
        revealed={revealed}
      />

      {state.phase === 'answering' && <form className="image-guess-form" onSubmit={(event) => {
        event.preventDefault()
        submitAnswer()
      }}>
        <div className="image-guess-prompt">
          <h2>فکر می‌کنی این تصویر چیه؟</h2>
          <span data-testid="image-attempts">
            فرصت معمول باقی‌مانده: <strong>{persianNumber.format(remaining)}</strong>
          </span>
        </div>

        {state.hintLevel > 0 && <div className="image-guess-hint" role="status" data-testid={`hint-${state.hintLevel}`}>
          <strong>{state.hintLevel === 1 ? 'اشتباه گفتی.' : 'هنوز نه!'}</strong>
          <p>{state.hintLevel === 1
            ? 'راهنمایی: این تصویر مربوط به صبح رویش هست.'
            : 'راهنمایی دوم: این توی دبستان‌هاست.'}</p>
        </div>}

        <label htmlFor="image-answer">پاسخ تو</label>
        <input
          ref={inputRef}
          id="image-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          inputMode="text"
          autoComplete="off"
          dir="rtl"
          aria-describedby={state.validationError ? 'image-answer-error' : undefined}
        />
        {state.validationError && <p id="image-answer-error" className="image-guess-error" role="alert">{state.validationError}</p>}
        <button type="submit" className="button button-primary">ثبت پاسخ</button>
      </form>}

      {state.phase === 'magic-choice' && <div className="image-guess-choice" data-testid="magic-choice">
        <div className="image-guess-wand"><MagicWand active={false} /></div>
        <h2>دوباره می‌خوای از چوب جادو استفاده کنی؟</h2>
        <div className="image-guess-choice-actions">
          <button ref={choiceRef} type="button" className="button button-primary" onClick={() => dispatch({ type: 'ACTIVATE_MAGIC' })}>
            بله، چوب جادو!
          </button>
          <button type="button" className="button button-secondary" onClick={() => dispatch({ type: 'THINK_AGAIN' })}>
            یک بار دیگه فکر می‌کنم
          </button>
        </div>
      </div>}

      {state.phase === 'magic-activating' && <div className="image-guess-magic" role="status">
        <div className="image-guess-wand"><MagicWand active /></div>
        <p>چوب جادو تصویر کامل را آشکار می‌کند…</p>
      </div>}

      {state.phase === 'revealed' && <div className="image-guess-success" data-testid="image-reveal" role="status">
        <span aria-hidden="true">✓</span>
        <h2>{state.revealKind === 'correct'
          ? 'آفرین! اینجا دهکده صبح رویش هست.'
          : 'اینجا دهکده صبح رویش هست.'}</h2>
        <button ref={continueRef} type="button" className="button button-primary" onClick={onComplete}>
          مرحله بعد <span aria-hidden="true">←</span>
        </button>
      </div>}
    </div>

    {state.phase !== 'revealed' && <button type="button" className="button button-quiet image-guess-return" onClick={onReturn}>
      بازگشت به مسیر
    </button>}
  </section>
}
