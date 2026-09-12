import type { ReactNode } from 'react';
import type { GameState } from '../state/gameState';

interface AppShellProps {
  children: ReactNode;
  state: GameState;
  onRestart: () => void;
  storageMessage?: string;
}

const persianNumber = new Intl.NumberFormat('fa-IR');

export function AppShell({ children, state, onRestart, storageMessage }: AppShellProps) {
  return (
    <div className={`app-shell${state.screen === 'MAP' ? ' map-shell' : ''}`}>
      <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
      <header className="site-header">
        <div className="brand-name">صبح رویش</div>
        <span className="header-caption">ماجراجویی پنج‌مرحله‌ای</span>
      </header>

      {state.screen !== 'INTRO' && (
        <div className="journey-progress" aria-label="پیشرفت ماجراجویی">
          <span>مسیر کشف گنج</span>
          <span>{persianNumber.format(state.completedStages.length)} از ۵ مرحله کامل شده</span>
          <progress max={5} value={state.completedStages.length} aria-label="مراحل کامل‌شده" />
        </div>
      )}

      {storageMessage && <p className="storage-notice" role="status">{storageMessage}</p>}

      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <p>هر ماجراجویی، فرصتی برای کشف و رشد.</p>
        <button type="button" className="button button-quiet" onClick={onRestart}>
          شروع دوبارهٔ ماجراجویی
        </button>
      </footer>
    </div>
  );
}
