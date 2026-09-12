import { useState } from 'react'
import { MazeBoard } from './MazeBoard'

interface MazeGameScreenProps {
  onReturn: () => void
  onComplete: () => void
}

export function MazeGameScreen({ onReturn, onComplete }: MazeGameScreenProps) {
  const [complete, setComplete] = useState(false)

  return <section className="maze-screen screen" aria-labelledby="game-title">
    <div className="maze-heading">
      <div>
        <p className="eyebrow">مرحلهٔ ۴ از ۵ · هزارتوی مدرسه</p>
        <h1 id="game-title">راه مدرسه را پیدا کن</h1>
      </div>
      <span className="maze-stage-mark" aria-hidden="true">۴</span>
    </div>
    <p className="maze-instruction">پسر را لمس کن، انگشتت را نگه دار و از میان پرچین‌ها تا «مدرسه صبح رویش» برو.</p>
    <MazeBoard onSuccess={() => setComplete(true)} />
    {complete
      ? <div className="maze-success" data-testid="maze-success">
          <span aria-hidden="true">✓</span>
          <h2>رسیدی به مدرسه!</h2>
          <button type="button" className="button button-primary" onClick={onComplete}>ادامه مسیر <span aria-hidden="true">←</span></button>
        </div>
      : <button type="button" className="button button-quiet maze-return" onClick={onReturn}>بازگشت به مسیر</button>}
  </section>
}
