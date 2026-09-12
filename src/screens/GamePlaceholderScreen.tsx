import { gameConfig } from '../config/gameConfig';
import type { StageId } from '../state/gameState';

interface GamePlaceholderScreenProps {
  stage: StageId;
  onReturn: () => void;
}

const persianNumber = new Intl.NumberFormat('fa-IR');

export function GamePlaceholderScreen({ stage, onReturn }: GamePlaceholderScreenProps) {
  const stageConfig = gameConfig.stages.find((item) => item.id === stage);

  return (
    <section className="placeholder-screen screen" aria-labelledby="game-title">
      <p className="eyebrow">مرحلهٔ {persianNumber.format(stage)} از ۵</p>
      <h1 id="game-title">{stageConfig?.title}</h1>
      <div className="unavailable-panel">
        <span className="availability-badge">به‌زودی</span>
        <h2>این چالش هنوز آمادهٔ بازی نیست.</h2>
        <p>در نسخه‌های بعدی می‌تونی این مرحله را بازی کنی. فعلاً به مسیر ماجراجویی برگرد.</p>
      </div>
      <button type="button" className="button button-primary" onClick={onReturn}>
        بازگشت به مسیر <span aria-hidden="true">←</span>
      </button>
    </section>
  );
}
