import { useId } from 'react'
import type { LandmarkTheme } from '../../config/mapConfig'

export function LockIcon() {
  return <svg viewBox="0 0 16 18" aria-hidden="true"><path d="M4 8V5a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="1" y="7" width="14" height="10" rx="3" fill="currentColor" /><path d="M8 10v4" stroke="white" strokeWidth="1.5" /></svg>
}

function LandmarkBase({ accent = '#0d7572' }: { accent?: string }) {
  return <g>
    <ellipse cx="55" cy="88" rx="42" ry="9" fill="#315f52" opacity=".14" />
    <path d="M11 75 55 58 100 75v8L55 99 11 83Z" fill="#79a184" />
    <path d="M11 75 55 58 100 75 55 92Z" fill="#edf1d1" />
    <path d="M17 75 55 61 94 75 55 88Z" fill={accent} opacity=".14" />
  </g>
}

export function LandmarkArt({ theme, open = false }: { theme: LandmarkTheme | 'treasure'; open?: boolean }) {
  const id = useId()
  return <svg className={`landmark-art ${theme === 'treasure' && open ? 'treasure-art-open' : ''}`} viewBox="0 0 110 100" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-teal`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#38a08f" /><stop offset="1" stopColor="#08635f" /></linearGradient>
      <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff8dc" /><stop offset="1" stopColor="#dcc79a" /></linearGradient>
      <linearGradient id={`${id}-coral`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0a172" /><stop offset="1" stopColor="#c65f4d" /></linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe6a0" /><stop offset="1" stopColor="#d39d42" /></linearGradient>
    </defs>

    <LandmarkBase accent={theme === 'observation' ? '#7c70a4' : theme === 'memory' ? '#dc7258' : '#0d7572'} />

    {theme === 'memory' && <g>
      <path d="M19 67 42 59 60 66 37 75 19 70Z" fill="#766aa0" /><path d="m22 63 22-7 15 6-22 8Z" fill="#b7acd5" /><path d="m27 64 10 4 18-6" fill="none" stroke="#fff5df" strokeWidth="2.5" />
      <path d="M36 30v-7c0-8 19-9 22 1v7" fill="none" stroke="#85513f" strokeWidth="5" strokeLinecap="round" />
      <path d="M25 36c1-9 8-13 17-12l18 4c9 2 14 8 14 17v29c0 9-7 14-16 12l-22-5c-7-2-11-7-11-14Z" fill={`url(#${id}-coral)`} />
      <path d="m60 28 4 1c7 3 10 8 10 16v29c0 8-5 12-13 12Z" fill="#a95346" opacity=".72" />
      <path d="m33 39 23 5c5 1 8 4 8 9v6l-31-7Z" fill="#f4bb7f" /><path d="M33 62l28 7v9l-28-7Z" fill="#c85d4b" />
      <rect x="44" y="46" width="10" height="10" rx="3" fill="#ffe29a" /><path d="M83 73 94 34l4-2 3 5-11 39Z" fill="#ecc45f" /><path d="m94 34 4-2 3 5-5 2Z" fill="#df806b" />
    </g>}

    {theme === 'timer' && <g>
      <path d="M33 38 57 29 80 40v39L56 89 33 79Z" fill={`url(#${id}-cream)`} /><path d="m57 29 23 11v39L56 89V47Z" fill="#cbb58c" />
      <path d="M25 39 56 14 88 39 56 52Z" fill={`url(#${id}-teal)`} /><path d="M25 39v7l31 13 32-13v-7L56 52Z" fill="#075451" />
      <path d="M55 14V5" stroke="#79583e" strokeWidth="3" /><path d="m57 5 17 4-17 7Z" fill="#e07b61" />
      <ellipse cx="49" cy="62" rx="12" ry="14" fill="#8c7352" /><ellipse cx="49" cy="61" rx="9.5" ry="11.5" fill="#fffbea" /><path d="M49 53v9l5 3" fill="none" stroke="#0d7572" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M67 58v19M72 56v19" stroke="#eee1bf" strokeWidth="3" /><ellipse cx="88" cy="79" rx="10" ry="4" fill="#72554a" /><path d="M80 74v5c4 5 12 5 16 0v-5" fill="#b7544c" /><ellipse cx="88" cy="74" rx="8" ry="4" fill="#ed8c75" />
    </g>}

    {theme === 'observation' && <g>
      <path d="M22 58 54 46 87 59v20L54 91 22 78Z" fill={`url(#${id}-cream)`} /><path d="m54 46 33 13v20L54 91Z" fill="#c9b28d" />
      <path d="M19 58c0-21 13-33 32-33 21 0 34 13 38 34L54 73Z" fill="#a89cca" /><path d="M52 25c20 3 32 15 36 34l-10 4c-3-20-12-32-26-38Z" fill="#756a9e" />
      <path d="m19 58 35 15 35-14v7L54 80 19 65Z" fill="#665d8c" />
      <path d="m45 42 23-24 12 10-22 26Z" fill={`url(#${id}-teal)`} /><ellipse cx="74" cy="22" rx="8" ry="11" transform="rotate(-48 74 22)" fill="#075754" /><ellipse cx="75" cy="21" rx="5" ry="8" transform="rotate(-48 75 21)" fill="#b8e5de" /><path d="m72 16 5 5" stroke="white" strokeWidth="2" opacity=".75" />
      <path d="M37 74v8M70 73v9" stroke="#8f819d" strokeWidth="4" />
    </g>}

    {theme === 'maze' && <g>
      <path d="M18 59 56 43 94 60v17L56 92 18 76Z" fill="#3d765c" /><path d="M18 56 56 40 94 57 56 73Z" fill="#e9d8a9" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 57 56 44 87 58M25 62 56 75 87 62M38 52l13 6-12 5M55 46l12 6-11 5 14 6M51 69l12-5" stroke="#356b55" strokeWidth="8" transform="translate(0 4)" />
        <path d="M25 57 56 44 87 58M25 62 56 75 87 62M38 52l13 6-12 5M55 46l12 6-11 5 14 6M51 69l12-5" stroke="#78ad72" strokeWidth="7" />
        <path d="M29 65 39 61 48 65 58 60 69 64 82 59" stroke="#fff0c9" strokeWidth="3.5" />
      </g>
      <path d="M72 38V25h17v18" fill="#f7edce" /><path d="m68 27 13-12 15 13-15 6Z" fill="#d78367" /><path d="M77 34h8v10h-8Z" fill="#0d7572" />
      <path d="M25 66v-9m8 6v-9M25 57h8" fill="none" stroke="#d5b46f" strokeWidth="2.5" /><path d="M28 47V31" stroke="#7d6244" strokeWidth="2" /><path d="m29 31 13 4-13 6Z" fill="#edbd60" />
    </g>}

    {theme === 'puzzle' && <g>
      <path d="M35 69v13M75 67v13" stroke="#8a6d4d" strokeWidth="5" strokeLinecap="round" />
      <g transform="rotate(-4 55 44)">
        <rect x="24" y="14" width="64" height="58" rx="7" fill="#325f57" />
        <rect x="28" y="18" width="56" height="50" rx="4" fill="#fff8df" />
        <path d="M46.5 18v50M65.5 18v50M28 43h56" stroke="#b9a57f" strokeWidth="1.5" />
        <path d="M28 43h56M65.5 18v50" stroke="#0d7572" strokeWidth="2.5" opacity=".75" />
        {[
          [37,35,'۱',false],[56,35,'۴',true],[75,35,'۲',false],
          [37,60,'۳',true],[56,60,'۲',false],[75,60,'۵',true],
        ].map(([x, y, number, highlighted]) => <g key={`${x}-${y}`}>
          {highlighted && <rect x={Number(x) - 8} y={Number(y) - 13} width="16" height="20" rx="3" fill="#dcebd1" />}
          <text x={Number(x)} y={Number(y)} textAnchor="middle" fontSize="13" fontWeight="700" fill={highlighted ? '#0d7572' : '#576b60'}>{number}</text>
        </g>)}
      </g>
      <path d="m22 77 13-5 10 4-13 5Z" fill="#e9b85f" /><path d="m76 75 10-4 7 3-10 4Z" fill="#d77a61" />
    </g>}

    {theme === 'treasure' && <g>
      <ellipse cx="56" cy="79" rx="35" ry="10" fill="#d6b965" opacity=".45" />
      <path d="M20 48 65 36 91 49v28L45 92 20 77Z" fill="#a96843" /><path d="m45 62 46-13v28L45 92Z" fill="#8d5238" />
      {open ? <>
        <path d="M20 48 64 36 91 49 45 64Z" fill="#5e3a2a" stroke="#e7bd62" strokeWidth="2" />
        <path d="m32 49 31-8 16 7-34 10Z" fill="#ffe58b" opacity=".9" />
        <circle cx="43" cy="50" r="4" fill="#f7ca53" /><circle cx="54" cy="47" r="3" fill="#fff0a1" /><path d="m66 43 5 7-7 4-5-7Z" fill="#5ac3a1" />
        <g className="treasure-lid"><path d="M20 48c-1-19 9-29 23-27l20 5c17-5 27 4 28 23L45 62Z" fill={`url(#${id}-coral)`} /><path d="M63 26c17-5 27 4 28 23L45 62c-2-18 4-30 18-36Z" fill="#b87348" /><path d="M20 48 45 62 91 49v7L45 69 20 55Z" fill={`url(#${id}-gold)`} /></g>
        <path d="M30 57v25l8 5V59M69 56v30l8-4V54" fill="none" stroke="#e5bb65" strokeWidth="7" />
      </> : <>
        <g><path d="M20 48c-1-19 9-29 23-27l20 5c17-5 27 4 28 23L45 62Z" fill={`url(#${id}-coral)`} /><path d="M63 26c17-5 27 4 28 23L45 62c-2-18 4-30 18-36Z" fill="#b87348" /></g>
        <path d="M20 48 45 62 91 49v8L45 70 20 56Z" fill={`url(#${id}-gold)`} />
        <path d="M30 24c-4 10-3 21-1 30v28l8 5V57c-3-15 0-26 6-35ZM70 27c-5 8-6 18-5 29v30l8-3V55c-1-13 1-22 7-26Z" fill="#e5bb65" />
        <path d="M51 67v-5c0-7 10-9 10-1v4" fill="none" stroke="#ffe8a9" strokeWidth="3" /><path d="m49 66 14-4v13l-14 4Z" fill="#f4d287" /><path d="M56 68v5" stroke="#775b35" strokeWidth="2" />
      </>}
      <circle cx="19" cy="72" r="2" fill="#f5ce68" /><circle cx="94" cy="65" r="2.5" fill="#f5ce68" />
    </g>}
  </svg>
}
