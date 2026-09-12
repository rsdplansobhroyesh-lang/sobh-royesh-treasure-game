import { describe, expect, it } from 'vitest'
import {
  createImageGuessState,
  imageGuessReducer,
  isAcceptedVillageAnswer,
  normalizePersianAnswer,
  remainingNormalAttempts,
} from './imageGuessGame'

describe('image guess answer normalization', () => {
  it('normalizes whitespace, joiners, Arabic letters, punctuation, and marks', () => {
    expect(normalizePersianAnswer('  دهكده‌ي،   صبح رويش!  ')).toBe('دهکده ی صبح رویش')
  })

  it.each([
    'دهکده',
    'دهکده صبح رویش',
    'دهکده‌ی صبح رویش',
    'دهکده ی صبح رویش',
  ])('accepts the supported village answer %s', (answer) => {
    expect(isAcceptedVillageAnswer(answer)).toBe(true)
  })

  it.each(['مدرسه', 'صبح رویش', 'حیاط', 'ده'])('rejects unrelated or incomplete answer %s', (answer) => {
    expect(isAcceptedVillageAnswer(answer)).toBe(false)
  })
})

describe('image guess attempt flow', () => {
  it('does not spend an attempt for an empty answer', () => {
    const state = imageGuessReducer(createImageGuessState(), { type: 'SUBMIT', answer: '  ‌  ' })
    expect(state.validationError).toBe('اول پاسخت را بنویس.')
    expect(remainingNormalAttempts(state)).toBe(3)
  })

  it('shows both hints before offering magic on the third miss', () => {
    const first = imageGuessReducer(createImageGuessState(), { type: 'SUBMIT', answer: 'درخت' })
    expect(first).toMatchObject({ phase: 'answering', hintLevel: 1, normalAttemptsUsed: 1 })
    expect(remainingNormalAttempts(first)).toBe(2)

    const second = imageGuessReducer(first, { type: 'SUBMIT', answer: 'باغچه' })
    expect(second).toMatchObject({ phase: 'answering', hintLevel: 2, normalAttemptsUsed: 2 })
    expect(remainingNormalAttempts(second)).toBe(1)

    const third = imageGuessReducer(second, { type: 'SUBMIT', answer: 'خانه' })
    expect(third).toMatchObject({ phase: 'magic-choice', hintLevel: 2, normalAttemptsUsed: 3 })
    expect(remainingNormalAttempts(third)).toBe(0)
  })

  it('allows another manual answer and preserves hints', () => {
    const choice = { ...createImageGuessState(), phase: 'magic-choice' as const, normalAttemptsUsed: 3, hintLevel: 2 as const }
    const answering = imageGuessReducer(choice, { type: 'THINK_AGAIN' })
    expect(answering).toMatchObject({ phase: 'answering', hintLevel: 2, normalAttemptsUsed: 3 })
    expect(imageGuessReducer(answering, { type: 'SUBMIT', answer: 'اشتباه' }).phase).toBe('magic-choice')
  })

  it('reveals through either a correct answer or the magic wand', () => {
    const correct = imageGuessReducer(createImageGuessState(), { type: 'SUBMIT', answer: 'دهکده' })
    expect(correct).toMatchObject({ phase: 'revealed', revealKind: 'correct' })

    const choice = { ...createImageGuessState(), phase: 'magic-choice' as const, normalAttemptsUsed: 3, hintLevel: 2 as const }
    const activating = imageGuessReducer(choice, { type: 'ACTIVATE_MAGIC' })
    expect(activating.phase).toBe('magic-activating')
    expect(imageGuessReducer(activating, { type: 'FINISH_MAGIC' })).toMatchObject({ phase: 'revealed', revealKind: 'magic' })
  })
})
