import { useEffect, useReducer, useRef, useState } from 'react'
import { BOX_COLUMNS, BOX_ROWS, createSudokuState, getConflictingCells, isClue, sudokuReducer } from './sudokuGame'

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶']

export function SudokuGameScreen({ onReturn, onComplete }: { onReturn: () => void; onComplete: () => void }) {
  const [state, dispatch] = useReducer(sudokuReducer, undefined, createSudokuState)
  const [restartOpen, setRestartOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const values = state.cells.map(cell => cell.value)
  const conflicts = getConflictingCells(values)
  const selectedValue = state.selected === null ? null : state.cells[state.selected]?.value

  useEffect(() => {
    const dialog = dialogRef.current
    if (restartOpen && dialog && !dialog.open) dialog.showModal()
    if (!restartOpen && dialog?.open) dialog.close()
  }, [restartOpen])

  const input = (value: number) => dispatch({ type: 'INPUT', value })
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (/^[1-6]$/.test(event.key)) { event.preventDefault(); input(Number(event.key)); return }
    if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); dispatch({ type: 'ERASE' }); return }
    if (event.key.toLowerCase() === 'p') { event.preventDefault(); dispatch({ type: 'TOGGLE_PENCIL' }); return }
    if (state.selected === null || !event.key.startsWith('Arrow')) return
    const row = Math.floor(state.selected / 6)
    const column = state.selected % 6
    const next = event.key === 'ArrowRight' ? row * 6 + Math.max(0, column - 1)
      : event.key === 'ArrowLeft' ? row * 6 + Math.min(5, column + 1)
      : event.key === 'ArrowUp' ? Math.max(0, row - 1) * 6 + column
      : Math.min(5, row + 1) * 6 + column
    event.preventDefault()
    dispatch({ type: 'SELECT', index: next })
    document.querySelector<HTMLButtonElement>(`[data-sudoku-cell="${next}"]`)?.focus()
  }

  return <section className="sudoku-screen screen" aria-labelledby="sudoku-title">
    <header className="sudoku-header">
      <div><p className="eyebrow">مرحلهٔ پنجم · آخرین چالش</p><h1 id="sudoku-title">سودوکوی کوچک</h1></div>
      <button type="button" className="button button-quiet" onClick={onReturn}>بازگشت به مسیر</button>
    </header>
    <p className="sudoku-instruction">خانه‌های خالی را با عددهای ۱ تا ۶ کامل کن؛ هر عدد در هر ردیف، ستون و کادر فقط یک‌بار می‌آید.</p>

    <div className="sudoku-board-wrap">
      <div className="sudoku-board" role="grid" aria-label="جدول سودوکوی شش در شش" onKeyDown={onKeyDown}>
        {state.cells.map((cell, index) => {
          const row = Math.floor(index / 6), column = index % 6
          const selectedRow = state.selected === null ? -1 : Math.floor(state.selected / 6)
          const selectedColumn = state.selected === null ? -1 : state.selected % 6
          const sameBox = state.selected !== null && Math.floor(row / BOX_ROWS) === Math.floor(selectedRow / BOX_ROWS)
            && Math.floor(column / BOX_COLUMNS) === Math.floor(selectedColumn / BOX_COLUMNS)
          const peer = row === selectedRow || column === selectedColumn || sameBox
          const matching = selectedValue !== null && cell.value === selectedValue
          const classes = ['sudoku-cell', isClue(index) ? 'is-clue' : 'is-entry', state.selected === index ? 'is-selected' : '', peer ? 'is-peer' : '', matching ? 'is-matching' : '', conflicts.has(index) ? 'is-conflict' : '', column === 2 ? 'box-edge-inline' : '', row === 1 || row === 3 ? 'box-edge-block' : ''].filter(Boolean).join(' ')
          return <button key={index} type="button" role="gridcell" className={classes} data-sudoku-cell={index}
            aria-selected={state.selected === index} aria-label={`ردیف ${row + 1}، ستون ${column + 1}${cell.value ? `، عدد ${cell.value}${isClue(index) ? '، راهنما' : ''}` : '، خالی'}`}
            onClick={() => dispatch({ type: 'SELECT', index })}>
            {cell.value ? <span className="cell-value">{persianDigits[cell.value]}</span> : cell.notes.length > 0 && <span className="cell-notes">{Array.from({ length: 6 }, (_, note) => <span key={note}>{cell.notes.includes(note + 1) ? persianDigits[note + 1] : ''}</span>)}</span>}
          </button>
        })}
      </div>
    </div>

    {conflicts.size > 0 && <p className="sudoku-feedback" role="status">این عدد با خانه‌های مشخص‌شده تداخل دارد.</p>}

    {!state.complete ? <div className="sudoku-controls">
      <div className="sudoku-numpad" aria-label="انتخاب عدد">{[1, 2, 3, 4, 5, 6].map(value => <button type="button" key={value} aria-label={`عدد ${value}`} onClick={() => input(value)}>{persianDigits[value]}</button>)}</div>
      <div className="sudoku-tools">
        <button type="button" className={`sudoku-tool ${state.pencilMode ? 'is-active' : ''}`} aria-pressed={state.pencilMode} onClick={() => dispatch({ type: 'TOGGLE_PENCIL' })}><span aria-hidden="true">✎</span> مداد</button>
        <button type="button" className="sudoku-tool" onClick={() => dispatch({ type: 'ERASE' })}><span aria-hidden="true">⌫</span> پاک‌کن</button>
        <button type="button" className="sudoku-tool" onClick={() => setRestartOpen(true)}><span aria-hidden="true">↻</span> شروع دوباره</button>
      </div>
    </div> : <div className="sudoku-success" role="status">
      <span className="sudoku-success-mark" aria-hidden="true">✓</span>
      <div><h2>عالیه! سودوکو کامل شد.</h2><p>گنج درست در انتهای مسیر منتظر توست.</p></div>
      <button type="button" className="button button-primary" onClick={onComplete}>رسیدن به گنج</button>
    </div>}

    <dialog ref={dialogRef} className="reset-dialog" onCancel={event => { event.preventDefault(); setRestartOpen(false) }} onClose={() => setRestartOpen(false)} aria-labelledby="sudoku-restart-title">
      <h2 id="sudoku-restart-title">جدول از نو شروع شود؟</h2>
      <p>عددها و یادداشت‌هایی که وارد کرده‌ای پاک می‌شوند.</p>
      <div className="dialog-actions"><button type="button" className="button button-primary" autoFocus onClick={() => { dispatch({ type: 'RESTART' }); setRestartOpen(false) }}>بله، از نو</button><button type="button" className="button button-secondary" onClick={() => setRestartOpen(false)}>ادامه می‌دهم</button></div>
    </dialog>
  </section>
}
