import { checkpoints, type MapLayout } from '../../config/mapConfig'
import type { CheckpointStatus, StageId } from '../../state/gameState'
import { LandmarkArt, LockIcon } from './LandmarkArt'

const persian = new Intl.NumberFormat('fa-IR')
const labels = { locked: 'قفل', current: 'مرحلهٔ فعلی، آماده', completed: 'کامل شده' }

export function Checkpoint({ checkpoint, layout, status, arriving, onOpen }: {
  checkpoint: (typeof checkpoints)[number]; layout: MapLayout; status: CheckpointStatus; arriving: boolean; onOpen: (stage: StageId) => void
}) {
  const point = layout.landmarks[checkpoint.id]
  const available = status === 'current' && !arriving
  const visualStatus = arriving ? 'arriving' : status
  return <button type="button" className={`map-checkpoint checkpoint-${visualStatus}`} data-stage={checkpoint.id} data-status={visualStatus}
    style={{ left: `${point.x / layout.width * 100}%`, top: `${point.y / layout.height * 100}%`, width: `${110 / layout.width * 100}%` }}
    disabled={!available} aria-current={available ? 'step' : undefined}
    aria-label={`مرحلهٔ ${persian.format(checkpoint.id)}، ${checkpoint.title}، ${arriving ? 'در مسیر، قفل' : labels[status]}`}
    onClick={() => { if (available) onOpen(checkpoint.id) }}>
    <span className="checkpoint-aura" aria-hidden="true" />
    <LandmarkArt theme={checkpoint.theme} />
    <span className="checkpoint-marker" aria-hidden="true">{status === 'completed' ? '✓' : persian.format(checkpoint.id)}</span>
    {status === 'completed' && <span className="checkpoint-flag" aria-hidden="true">✓</span>}
    {(status === 'locked' || arriving) && <span className="checkpoint-lock" aria-hidden="true"><LockIcon /></span>}
    <span className="checkpoint-label">{checkpoint.shortTitle}<span className="sr-only">، {labels[status]}</span></span>
  </button>
}
