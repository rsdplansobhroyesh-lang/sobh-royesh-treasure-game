import { useEffect, useRef } from 'react'
import { mapConfig, pointOnSegment, type MapLayout } from '../../config/mapConfig'
import type { GameState } from '../../state/gameState'
import { playerDestination, type MapTravel } from '../../state/mapTravel'

interface Props { layout: MapLayout; state: GameState; travel: MapTravel | null; reducedMotion: boolean; onArrive: (id: number) => void }

export function PlayerCharacter({ layout, state, travel, reducedMotion, onArrive }: Props) {
  const playerRef = useRef<SVGGElement>(null)
  const startedRef = useRef<{ id: number; time: number } | null>(null)
  const destination = travel?.to ?? playerDestination(state)
  const initial = layout.stops[travel?.from ?? destination]
  useEffect(() => {
    if (!travel) return
    const player = playerRef.current
    const segment = layout.segments[travel.from]
    if (!player || !segment) return
    let frame = 0
    let disposed = false
    if (startedRef.current?.id !== travel.id) startedRef.current = { id: travel.id, time: performance.now() }
    const start = startedRef.current.time
    const finish = () => {
      if (disposed) return
      cancelAnimationFrame(frame)
      const point = layout.stops[travel.to]
      player.setAttribute('transform', `translate(${point.x} ${point.y})`)
      onArrive(travel.id)
    }
    const draw = (now: number) => {
      if (disposed) return
      const progress = Math.min(1, (now - start) / mapConfig.travelDurationMs)
      const point = pointOnSegment(segment, progress * progress * (3 - 2 * progress))
      player.setAttribute('transform', `translate(${point.x} ${point.y})`)
      if (progress >= 1) finish()
      else frame = requestAnimationFrame(draw)
    }
    const onVisibility = () => { if (document.hidden) finish() }
    if (reducedMotion || document.hidden) finish()
    else frame = requestAnimationFrame(draw)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { disposed = true; cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', onVisibility) }
  }, [layout, travel, reducedMotion, onArrive])

  return <g ref={playerRef} transform={`translate(${initial.x} ${initial.y})`} className="map-player" data-testid="map-player" data-destination={destination} data-travelling={!!travel} aria-hidden="true">
    <ellipse cy="3" rx="15" ry="5" fill="#2b685b" opacity=".22" />
    <g className={travel && !reducedMotion ? 'player-walking' : undefined}>
      <path d="M-7-15-9 0h6l4-16m4 0L6 0h6l-4-20" stroke="#2e4e4c" strokeWidth="4" strokeLinecap="round" />
      <path d="M-10 0h7m9 0h7" stroke="#63503e" strokeWidth="4" strokeLinecap="round" />
      <path d="M-12-32q-7 1-7 9v11l9 2" fill="#d18f4f" stroke="#ab7341" strokeWidth="1.5" />
      <path d="M-8-33q8-5 15 2l6 17q-11 7-24 0Z" fill="#0d7572" /><path d="M-6-31v15" stroke="#e4b461" strokeWidth="3" />
      <path d="M9-28 15-18m-26-10-4 12" stroke="#e0ae83" strokeWidth="5" strokeLinecap="round" />
      <path d="m-2-35 1 8 8-3-3-7" fill="#d6a178" /><ellipse cx="1" cy="-43" rx="9" ry="11" fill="#ebbd92" />
      <path d="M-8-44q-4-17 11-13 9 1 8 14l-6-4-4-7-3 8" fill="#504b3d" />
      <path d="M-10-50q3-10 13-8 9 0 10 9" fill="#d6b078" /><ellipse cx="1" cy="-49" rx="16" ry="4" fill="#edd1a0" /><path d="M-10-52q11 3 20 0" fill="none" stroke="#8f7551" strokeWidth="3" />
      <circle cx="6" cy="-42" r="1" fill="#55493e" /><path d="M3-35q3 2 5-1" fill="none" stroke="#a56e54" strokeWidth="1" />
      <path d="m-5-33 11 2-1 7-11-6Z" fill="#edc365" />
    </g>
  </g>
}
