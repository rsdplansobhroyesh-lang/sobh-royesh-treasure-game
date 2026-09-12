import { TreasureMap, type TreasureMapProps } from '../components/map/TreasureMap'
import { checkpoints } from '../config/mapConfig'
import { getCurrentStage } from '../state/gameState'

export function MapScreen(props: TreasureMapProps) {
  const current = getCurrentStage(props.state)
  const checkpoint = checkpoints.find(item => item.id === current)
  return <section className="map-screen screen" aria-labelledby="map-title">
    <div className="map-heading"><div><p className="eyebrow">پنج کشف، یک ماجراجویی</p><h1 id="map-title">مسیر ماجراجویی</h1></div><span className="map-edition" aria-hidden="true">سفر کشف و رشد</span></div>
    <TreasureMap {...props} />
    <div className="map-caption" aria-live="polite" aria-atomic="true">
      <span className="caption-dot" aria-hidden="true" />
      <p>{props.travel ? 'یک قدم نزدیک‌تر به گنج…' : checkpoint ? <><strong>{checkpoint.shortTitle}</strong> در انتظار توست؛ روی نشانهٔ روشن بزن.</> : 'هر پنج مرحله کامل شده؛ به پایان مسیر رسیدی.'}</p>
    </div>
    <p className="availability-note map-availability">چالش‌ها در نسخه‌های بعدی آمادهٔ بازی می‌شوند.</p>
  </section>
}
