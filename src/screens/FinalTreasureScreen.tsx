import { LandmarkArt } from '../components/map/LandmarkArt'

interface FinalTreasureScreenProps {
  onRestart: () => void;
  onReturn: () => void;
}

export function FinalTreasureScreen({ onRestart, onReturn }: FinalTreasureScreenProps) {
  return (
    <section className="final-screen screen final-celebration" aria-labelledby="treasure-title">
      <div className="treasure-particles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} />)}</div>
      <p className="eyebrow">پایان یک ماجراجویی</p>
      <div className="final-open-chest" aria-hidden="true"><LandmarkArt theme="treasure" open /></div>
      <h1 id="treasure-title">گنج پیدا شد!</h1>
      <div className="final-message">
        <p>رسیدی به آخر مسیر.</p>
        <p>شاید رسیدن تا اینجا همیشه ساده نبود؛ اشتباه کردی، دوباره امتحان کردی و باز هم ادامه دادی.</p>
        <p>اما چیزی که تو را تا اینجا رساند، فقط حل کردن این چالش‌ها نبود؛ انتخابت برای ادامه دادن بود.</p>
        <p><strong>گنج واقعی همین است:</strong><br />تویی که وقتی مسیر سخت می‌شود، از موانع عبور می‌کنی و تا رسیدن به هدفت ادامه می‌دهی.</p>
        <p className="final-emphasis">این بار، گنج خودِ تویی.</p>
      </div>
      <div className="screen-actions">
        <button type="button" className="button button-primary" onClick={onReturn}>دیدن مسیر ماجراجویی</button>
        <button type="button" className="button button-secondary" onClick={onRestart}>بازی دوباره</button>
      </div>
    </section>
  );
}
