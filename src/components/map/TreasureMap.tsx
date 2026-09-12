import type { CSSProperties } from 'react'
import { checkpoints, mapConfig, mapLayouts } from '../../config/mapConfig'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { getCheckpointStatus, type GameState, type StageId } from '../../state/gameState'
import { playerDestination, type MapTravel } from '../../state/mapTravel'
import { Checkpoint } from './Checkpoint'
import { MapEnvironment, MapBridge } from './MapEnvironment'
import { MapPath } from './MapPath'
import { PlayerCharacter } from './PlayerCharacter'
import { TreasureChest } from './TreasureChest'

export interface TreasureMapProps { state: GameState; travel: MapTravel | null; onArrive: (id: number) => void; onOpenGame: (stage: StageId) => void; onOpenTreasure: () => void }

export function TreasureMap({ state, travel, onArrive, onOpenGame, onOpenTreasure }: TreasureMapProps) {
  const wide = useMediaQuery(mapConfig.wideBreakpoint)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const layout = mapLayouts[wide ? 'wide' : 'portrait']
  const destination = playerDestination(state)
  return <div className="treasure-world" data-layout={wide ? 'wide' : 'portrait'} data-moving={!!travel}
    style={{ aspectRatio: `${layout.width} / ${layout.height}`, '--map-travel-duration': `${mapConfig.travelDurationMs}ms` } as CSSProperties}>
    <svg className="world-landscape" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
      <MapEnvironment layout={layout} />
      <MapPath layout={layout} completedCount={state.completedStages.length} travel={travel} />
      <MapBridge layout={layout} />
      <g transform={`translate(${layout.stops.start.x + 20} ${layout.stops.start.y - 4})`}><path d="M0 0v-33" stroke="#977f57" strokeWidth="3" /><path d="M0-33h24l-5 7 5 7H0" fill="#f4e8be" /><path d="M7-26h8m-4-3 4 3-4 3" fill="none" stroke="#0d7572" strokeWidth="2" /></g>
    </svg>
    <div className="map-cloud cloud-one" aria-hidden="true" /><div className="map-cloud cloud-two" aria-hidden="true" />
    <div className="map-checkpoints" role="group" aria-label="مراحل ماجراجویی">
      {checkpoints.map(checkpoint => <Checkpoint key={checkpoint.id} checkpoint={checkpoint} layout={layout}
        status={getCheckpointStatus(state, checkpoint.id)} arriving={!!travel && destination === checkpoint.id} onOpen={onOpenGame} />)}
      <TreasureChest layout={layout} available={state.completedStages.length === checkpoints.length && !travel}
        arriving={travel?.to === 'treasure'} onOpen={onOpenTreasure} />
    </div>
    <svg className="world-player-layer" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
      <PlayerCharacter layout={layout} state={state} travel={travel} reducedMotion={reducedMotion} onArrive={onArrive} />
    </svg>
    <span className="map-north" aria-hidden="true"><span>ش</span>✧</span>
  </div>
}
