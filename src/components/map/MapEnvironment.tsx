import { useId } from 'react'
import type { MapLayout } from '../../config/mapConfig'

type Decoration = readonly [number, number, number]

export function MapEnvironment({ layout }: { layout: MapLayout }) {
  const id = useId()
  const wide = layout.width > 400
  const trees: readonly Decoration[] = wide
    ? [[92,310,1.15],[157,340,.78],[226,180,.98],[288,112,.72],[700,226,1.14],[744,288,.72],[908,350,1.02],[660,447,.76],[455,443,.72],[258,408,.7],[810,470,.65]]
    : [[57,509,.73],[88,491,.58],[325,405,.68],[57,302,.63],[91,291,.5],[339,220,.64],[315,207,.72],[74,146,.67],[52,161,.5],[219,63,.57]]
  const gardens: readonly Decoration[] = wide
    ? [[112,374,.9],[282,472,.8],[674,183,.82],[802,296,.76],[859,463,.72],[411,492,.72],[195,259,.7]]
    : [[198,550,.75],[320,530,.7],[216,451,.7],[64,366,.66],[314,282,.66],[80,199,.62],[254,88,.58]]
  const stones: readonly Decoration[] = wide ? [[188,400,.9],[746,429,.8],[867,270,.7],[356,96,.65],[646,320,.72]] : [[67,558,.65],[329,354,.65],[61,249,.58],[342,119,.58],[219,577,.55]]

  return <g aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-ground`} x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#e7efcf" /><stop offset=".48" stopColor="#cee4b8" /><stop offset="1" stopColor="#aed4a9" /></linearGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8fc09c" /><stop offset="1" stopColor="#4f8e76" /></linearGradient>
      <linearGradient id={`${id}-water`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9edbd0" /><stop offset="1" stopColor="#55aa9f" /></linearGradient>
      <linearGradient id={`${id}-tree`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#62aa88" /><stop offset="1" stopColor="#0d7572" /></linearGradient>
      <filter id={`${id}-soft-shadow`} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#315f52" floodOpacity=".14" /></filter>
      <symbol id={`${id}-tree-symbol`} viewBox="-24 -67 48 78">
        <ellipse cy="4" rx="20" ry="6" fill="#315f52" opacity=".13" /><path d="M-3 4v-33h7V4" fill="#9b7650" />
        <path d="M0-65C-12-64-21-45-20-31c1 13 9 18 20 17 15 0 22-8 20-20C18-49 10-66 0-65Z" fill={`url(#${id}-tree)`} />
        <path d="M-7-52c-5 8-7 15-7 21" fill="none" stroke="#bce0bb" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      </symbol>
      <symbol id={`${id}-garden-symbol`} viewBox="-22 -16 44 26">
        <ellipse cy="5" rx="21" ry="5" fill="#315f52" opacity=".12" /><path d="M-20 2c0-9 7-13 13-8C-2-17 8-16 10-6c9-2 14 7 8 12H-17Z" fill="#70a870" />
        <path d="M-11-4c2 4 2 7 2 9M2-9c0 5 1 9 3 13M13-3c-2 3-3 5-3 8" stroke="#b8d394" strokeWidth="2" strokeLinecap="round" />
      </symbol>
    </defs>

    <ellipse cx={layout.width / 2} cy={layout.height - 24} rx={layout.width * .39} ry={wide ? 18 : 14} fill="#2e6f62" opacity=".09" />
    <path d={layout.island} transform="translate(0 22)" fill="#4f8e76" /><path d={layout.island} transform="translate(0 13)" fill={`url(#${id}-edge)`} />
    <path d={layout.island} fill={`url(#${id}-ground)`} stroke="#f3f5d9" strokeWidth="3" /><path d={layout.island} transform="translate(0 -3)" fill="none" stroke="#fffbe6" strokeOpacity=".62" strokeWidth="2" />

    {wide
      ? <g fill="#85bc87" opacity=".2"><path d="M612 302c83-47 220-41 277 24 31 35 10 87-42 105-76 27-196 5-234-48-18-25-19-58-1-81Z" /><path d="M105 205c55-62 194-78 267-29 37 26 37 66-3 91-60 38-180 39-246 4-31-17-40-42-18-66Z" /><ellipse cx="507" cy="145" rx="106" ry="34" /></g>
      : <g fill="#85bc87" opacity=".2"><path d="M61 459c42-42 151-54 221-26 60 24 63 70 7 97-66 31-183 25-229-15-19-17-19-37 1-56Z" /><path d="M49 231c42-54 166-74 244-37 48 23 53 66 7 94-63 38-187 31-243-13-19-15-22-29-8-44Z" /><ellipse cx="226" cy="118" rx="109" ry="45" /></g>}

    <path d={layout.river} fill="none" stroke="#bdd2ae" strokeWidth={wide ? 38 : 34} strokeLinecap="round" />
    <path d={layout.river} fill="none" stroke={`url(#${id}-water)`} strokeWidth={wide ? 27 : 24} strokeLinecap="round" />
    <path d={layout.river} fill="none" stroke="#d9f3e9" strokeWidth="2.5" strokeDasharray="18 24" strokeLinecap="round" opacity=".88" />

    {trees.map(([x, y, scale], index) => <use key={`tree-${index}`} href={`#${id}-tree-symbol`} x={x - 24 * scale} y={y - 67 * scale} width={48 * scale} height={78 * scale} />)}
    {gardens.map(([x, y, scale], index) => <g key={`garden-${index}`}><use href={`#${id}-garden-symbol`} x={x - 22 * scale} y={y - 16 * scale} width={44 * scale} height={26 * scale} />{index % 2 === 0 && <g fill="#f4c879"><circle cx={x - 7 * scale} cy={y - 5 * scale} r={2 * scale} /><circle cx={x + 7 * scale} cy={y - 2 * scale} r={1.8 * scale} /></g>}</g>)}
    {stones.map(([x, y, scale], index) => <g key={`stone-${index}`} transform={`translate(${x} ${y}) scale(${scale})`}><ellipse cy="3" rx="13" ry="4" fill="#315f52" opacity=".12" /><path d="m-12 0 5-9 12 1 7 9-9 4Z" fill="#aebfa5" /><path d="m-12 0 5-9 12 1-4 6Z" fill="#d4dabb" /></g>)}

    <g transform={`translate(${wide ? 835 : 81} ${wide ? 167 : 466}) rotate(-12)`} filter={`url(#${id}-soft-shadow)`}><path d="m-28 4 38-11 8 5-38 11Z" fill="#f0c96d" /><path d="m-28 4-7 5 3-8Z" fill="#f8e5b7" /><path d="m-35 9 3-8 3 5Z" fill="#47665d" /><path d="m10-7 8 5-3 4-8-6Z" fill="#db8268" /></g>
    <g transform={`translate(${wide ? 872 : 171} ${wide ? 248 : 319})`}><ellipse cy="13" rx="22" ry="5" fill="#315f52" opacity=".1" /><path d="M-21 0 0-9 22 0v8L0 17-21 8Z" fill="#397f73" /><path d="m-17 2 17 7 18-7v4L0 14-17 7Z" fill="#f5e2b3" /><path d="m-21 0 21-9 22 9L0 9Z" fill="#79b7a2" /></g>
  </g>
}

export function MapBridge({ layout }: { layout: MapLayout }) {
  return <g transform={`translate(${layout.bridge.x} ${layout.bridge.y}) rotate(${layout.bridge.rotation})`} aria-hidden="true">
    <g transform="scale(.83)">
      <ellipse cx="0" cy="4" rx="29" ry="35" fill="#315f52" opacity=".15" />
      <path d="M-22-34Q0-27 22-34V34Q0 27-22 34Z" fill="#9a754c" />
      {[-27, -18, -9, 0, 9, 18, 27].map(y => <path key={y} d={`M-21 ${y}Q0 ${y + 5} 21 ${y}`} stroke="#e5c58e" strokeWidth="7" strokeLinecap="round" />)}
      <path d="M-25-32v64M25-32v64" stroke="#765a3f" strokeWidth="3" strokeLinecap="round" /><path d="M-29-27Q-32 0-29 27M29-27Q32 0 29 27" fill="none" stroke="#b58b59" strokeWidth="3" />
      {[-24, 0, 24].map(y => <g key={y}><circle cx="-29" cy={y} r="3" fill="#eacb94" /><circle cx="29" cy={y} r="3" fill="#eacb94" /></g>)}
    </g>
  </g>
}
