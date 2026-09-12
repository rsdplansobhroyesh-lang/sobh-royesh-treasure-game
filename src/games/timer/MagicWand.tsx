import { useId } from 'react'

export function MagicWand({ active }: { active: boolean }) {
  const id = useId()
  return <svg
    className={`magic-wand${active ? ' magic-wand-active' : ''}`}
    viewBox="0 0 260 170"
    role="img"
    aria-label="چوب جادویی درخشان"
  >
    <defs>
      <linearGradient id={`${id}-wand`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#6a4e8f" /><stop offset="1" stopColor="#a98bc7" /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#fff" /><stop offset=".28" stopColor="#bfe9dc" /><stop offset="1" stopColor="#0d7572" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="130" cy="146" rx="77" ry="13" fill="#315f52" opacity=".1" />
    <circle className="wand-glow" cx="183" cy="49" r="47" fill={`url(#${id}-glow)`} />
    <g className="wand-object" transform="rotate(-38 130 90)">
      <rect x="114" y="40" width="31" height="116" rx="15" fill={`url(#${id}-wand)`} stroke="#554175" strokeWidth="5" />
      <path d="M119 130h21" stroke="#d8c8ea" strokeWidth="6" strokeLinecap="round" />
      <path d="m130 13 9 18 20 3-15 14 4 20-18-10-18 10 4-20-15-14 20-3Z" fill="#62b9aa" stroke="#0d7572" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="130" cy="40" r="7" fill="#e8fff6" />
    </g>
    <g className="wand-sparkles" fill="#69bdad">
      <path d="m46 58 5 10 11 5-11 5-5 11-5-11-11-5 11-5Z" />
      <path d="m205 105 4 8 9 4-9 4-4 9-4-9-9-4 9-4Z" />
      <path d="m221 34 3 6 7 3-7 3-3 7-3-7-7-3 7-3Z" />
      <circle cx="74" cy="117" r="5" /><circle cx="231" cy="80" r="4" />
    </g>
  </svg>
}
