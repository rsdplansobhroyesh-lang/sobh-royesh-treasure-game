import type { MapLayout } from '../../config/mapConfig'
import { LandmarkArt, LockIcon } from './LandmarkArt'

export function TreasureChest({ layout, available, arriving, onOpen }: { layout: MapLayout; available: boolean; arriving: boolean; onOpen: () => void }) {
  const point = layout.landmarks.treasure
  return <button type="button" className={`map-checkpoint map-treasure ${available ? 'treasure-available' : ''} ${arriving ? 'treasure-arriving' : ''}`} disabled={!available}
    style={{ left: `${point.x / layout.width * 100}%`, top: `${point.y / layout.height * 100}%`, width: `${102 / layout.width * 100}%` }}
    aria-label={`گنج پایانی، ${available ? 'دیدن پایان مسیر' : 'قفل؛ پس از کامل کردن هر پنج مرحله باز می‌شود'}`} onClick={() => { if (available) onOpen() }}>
    <LandmarkArt theme="treasure" />
    {!available && !arriving && <span className="checkpoint-lock" aria-hidden="true"><LockIcon /></span>}
    <span className="checkpoint-label">گنج پایانی</span>
  </button>
}
