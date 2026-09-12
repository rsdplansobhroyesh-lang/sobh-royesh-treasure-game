import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { gameConfig } from '../../config/gameConfig'
import {
  goalPoint,
  inspectSegment,
  isAtStart,
  mazeWalls,
  startPoint,
  type MazePoint,
} from './mazeGeometry'

interface MazeBoardProps {
  onSuccess: () => void
}

type MazePhase = 'idle' | 'active' | 'success'

export function MazeBoard({ onSuccess }: MazeBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const activeRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const previousRef = useRef<MazePoint>(startPoint)
  const [phase, setPhase] = useState<MazePhase>('idle')
  const [failures, setFailures] = useState(0)
  const [trail, setTrail] = useState<MazePoint[]>([])
  const [message, setMessage] = useState('پسر را لمس کن و بدون برخورد به پرچین‌ها تا مدرسه ببر.')
  const assisted = failures >= gameConfig.mazeGame.assistanceAfterFailures

  useEffect(() => () => {
    activeRef.current = false
    pointerIdRef.current = null
  }, [])

  const pointFromEvent = (event: PointerEvent<SVGSVGElement>): MazePoint => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: (event.clientX - bounds.left) * gameConfig.mazeGame.width / bounds.width,
      y: (event.clientY - bounds.top) * gameConfig.mazeGame.height / bounds.height,
    }
  }

  const endAttempt = (nextMessage: string, countFailure: boolean) => {
    activeRef.current = false
    pointerIdRef.current = null
    previousRef.current = startPoint
    setPhase('idle')
    setTrail([])
    setMessage(nextMessage)
    if (countFailure) setFailures((value) => value + 1)
  }

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (phase === 'success' || activeRef.current) return
    const point = pointFromEvent(event)
    if (!isAtStart(point)) {
      setMessage('برای شروع، اول خودِ پسر را لمس کن.')
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    activeRef.current = true
    pointerIdRef.current = event.pointerId
    previousRef.current = startPoint
    setTrail([startPoint])
    setPhase('active')
    setMessage('آفرین، حالا مسیر را تا مدرسه ادامه بده.')
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!activeRef.current || pointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    const point = pointFromEvent(event)
    const tolerance = assisted ? gameConfig.mazeGame.assistedTolerance : gameConfig.mazeGame.baseTolerance
    const result = inspectSegment(previousRef.current, point, tolerance)
    if (result === 'collision') {
      endAttempt('اوه! به دیوار خوردی. دوباره امتحان کن.', true)
      return
    }
    previousRef.current = point
    setTrail((points) => [...points, point])
    if (result === 'goal') {
      activeRef.current = false
      pointerIdRef.current = null
      setPhase('success')
      setMessage('رسیدی به مدرسه!')
      onSuccess()
    }
  }

  const handlePointerEnd = (event: PointerEvent<SVGSVGElement>) => {
    if (!activeRef.current || pointerIdRef.current !== event.pointerId) return
    endAttempt('مسیر نیمه‌کاره موند. دوباره از پسر شروع کن.', true)
  }

  const boy = phase === 'success' ? goalPoint : startPoint

  return <div className={`maze-board-wrap${assisted ? ' maze-assisted' : ''}`}>
    <svg
      ref={svgRef}
      className={`maze-board maze-board-${phase}`}
      data-testid="maze-board"
      data-phase={phase}
      data-assisted={assisted}
      viewBox={`0 0 ${gameConfig.mazeGame.width} ${gameConfig.mazeGame.height}`}
      role="application"
      aria-label="هزارتوی باغ مدرسه"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
    >
      <defs>
        <linearGradient id="maze-ground" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff8e6" /><stop offset="1" stopColor="#f4e5bc" /></linearGradient>
        <filter id="maze-wall-shadow" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#143f34" floodOpacity=".26" /></filter>
        <pattern id="maze-speckle" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="5" cy="7" r="1" fill="#bfae7c" opacity=".18" /><circle cx="18" cy="17" r=".8" fill="#bfae7c" opacity=".14" /></pattern>
      </defs>
      <rect width="350" height="450" rx="18" fill="url(#maze-ground)" />
      <rect width="350" height="450" rx="18" fill="url(#maze-speckle)" />
      <g className="maze-walls" filter="url(#maze-wall-shadow)">
        {mazeWalls.map((wall, index) => <line key={index} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} />)}
      </g>

      <g className="maze-school" role="img" aria-label="پایان مسیر: مدرسه صبح رویش" pointerEvents="none">
        <rect x="273" y="4" width="72" height="42" rx="6" fill="#fff9df" stroke="#0d7572" strokeWidth="2" />
        <path d="m269 14 40-13 40 13Z" fill="#d97855" stroke="#9e4c36" strokeWidth="2" />
        <rect x="303" y="25" width="13" height="21" rx="2" fill="#0d7572" />
        <text x="309" y="20" textAnchor="middle" direction="rtl" fontSize="7.2" fontWeight="700" fill="#203e3c">مدرسه صبح رویش</text>
      </g>

      {trail.length > 1 && <polyline
        data-testid="maze-trail"
        points={trail.map((point) => `${point.x},${point.y}`).join(' ')}
        fill="none" stroke="#0d7572" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity=".5"
      />}

      <g className={`maze-boy maze-boy-${phase}`} data-testid="maze-boy" role="img" aria-label="شروع مسیر: پسر دانش‌آموز" transform={`translate(${boy.x} ${boy.y})`}>
        <circle className="maze-boy-hit" r="24" fill="transparent" />
        <ellipse cy="17" rx="13" ry="5" fill="#214c40" opacity=".16" />
        <path d="M-9 2Q0-8 9 2v15H-9Z" fill="#0d7572" />
        <circle cy="-10" r="9" fill="#d99d75" />
        <path d="M-9-12Q-5-23 7-17Q13-12 7-7Q5-15-9-12Z" fill="#49372f" />
        <path d="m-5 17-4 10M5 17l5 10" stroke="#304d68" strokeWidth="5" strokeLinecap="round" />
        <circle cx="3" cy="-10" r="1.2" fill="#203e3c" />
        <path d="M1-6q3 2 5 0" fill="none" stroke="#8c4f43" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M-12 3-19 10M12 3l18-10" stroke="#d99d75" strokeWidth="4" strokeLinecap="round" />
        <rect x="20" y="-14" width="12" height="15" rx="2" fill="#e6b94f" transform="rotate(-12 26 -7)" />
      </g>
    </svg>
    <p className="maze-status" role="status" data-testid="maze-status">{message}</p>
    {assisted && phase !== 'success' && <p className="maze-assist-note">لبه‌های مسیر کمی مهربان‌تر شدند.</p>}
  </div>
}
