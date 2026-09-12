interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <section className="intro-screen screen" aria-labelledby="intro-title">
      <div className="intro-kicker"><span aria-hidden="true" />کشف کن، بازی کن، رشد کن</div>
      <h1 id="intro-title">ماموریت پنج‌مرحله‌ای <span>صبح رویش</span></h1>
      <p className="screen-lead">پنج چالش را پشت سر بگذار و به گنج برس!</p>
      <div className="intro-route" aria-label="پنج مرحله تا گنج">
        <span>۵ مرحله</span>
        <span className="intro-route-line" aria-hidden="true" />
        <span>یک ماجراجویی</span>
        <span className="intro-route-line" aria-hidden="true" />
        <span>کشف گنج</span>
      </div>
      <button type="button" className="button button-primary intro-start" onClick={onStart}>
        شروع ماجراجویی <span aria-hidden="true">←</span>
      </button>
      <p className="availability-note">مسیر آماده است؛ چالش‌ها در نسخه‌های بعدی در دسترس قرار می‌گیرند.</p>
    </section>
  );
}
