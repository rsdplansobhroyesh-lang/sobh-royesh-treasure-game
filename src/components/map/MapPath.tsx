import { segmentPath, type MapLayout } from '../../config/mapConfig'
import type { MapTravel } from '../../state/mapTravel'

export function MapPath({ layout, completedCount, travel }: { layout: MapLayout; completedCount: number; travel: MapTravel | null }) {
  return <g className="map-route" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {layout.segments.map((segment, index) => {
      const completed = completedCount > 0 && index <= completedCount && index !== travel?.from
      return <g key={index} data-route-segment={index} data-completed={completed}>
        <path className="route-shadow" d={segmentPath(segment)} />
        <path className="route-edge" d={segmentPath(segment)} />
        <path className="route-surface" d={segmentPath(segment)} />
        <path className="route-stitch" d={segmentPath(segment)} />
        {completed && <path className="route-progress" d={segmentPath(segment)} />}
        {index === travel?.from && <path key={travel.id} className="route-progress route-reveal" d={segmentPath(segment)} pathLength="1" />}
        {index === completedCount && !travel && completedCount === 0 && <path className="route-current" d={segmentPath(segment)} />}
      </g>
    })}
  </g>
}
