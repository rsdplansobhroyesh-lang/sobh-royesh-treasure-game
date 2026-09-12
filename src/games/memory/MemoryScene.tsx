import { useId } from 'react'
import { gameConfig } from '../../config/gameConfig'

const yellow = '#f2c94c'

export function MemoryScene() {
  const id = useId()
  return <svg
    className="memory-scene"
    viewBox="0 0 720 480"
    role="img"
    aria-label="تصویر یک کلاس با میز و وسایل گوناگون آموزشی"
    data-testid="memory-scene"
    data-yellow-count={gameConfig.memoryGame.yellowObjects.length}
  >
    <defs>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#eff7ec" /><stop offset="1" stopColor="#dcebd8" /></linearGradient>
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d4e5cf" /><stop offset="1" stopColor="#b9d5bc" /></linearGradient>
      <linearGradient id={`${id}-desk`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bb8768" /><stop offset="1" stopColor="#8f5f4d" /></linearGradient>
      <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#244f49" floodOpacity=".18" /></filter>
    </defs>

    <rect width="720" height="480" rx="28" fill={`url(#${id}-wall)`} />
    <path d="M0 314 720 276v204H0Z" fill={`url(#${id}-floor)`} />
    <path d="M0 314 720 276" stroke="#9fbfa7" strokeWidth="5" />

    <g transform="translate(35 45)">
      <rect width="150" height="116" rx="12" fill="#f7fbf6" stroke="#8db8ad" strokeWidth="7" />
      <path d="M75 3v110M3 58h144" stroke="#8db8ad" strokeWidth="5" />
      <path d="m9 49 54-40h9L12 57Zm68 62 60-46h9l-60 46Z" fill="#d5eef0" opacity=".75" />
    </g>
    <g transform="translate(217 52)">
      <rect width="270" height="116" rx="13" fill="#286b64" stroke="#174f4a" strokeWidth="7" />
      <path d="M28 34c29-13 58-13 87 0M154 76c23-18 48-22 76-12" fill="none" stroke="#d8ebe3" strokeWidth="5" strokeLinecap="round" opacity=".75" />
      <circle cx="207" cy="35" r="7" fill="#d8ebe3" opacity=".7" />
    </g>
    <g transform="translate(616 37)">
      <circle cx="31" cy="31" r="29" fill="#fff" stroke="#0d7572" strokeWidth="7" />
      <path d="M31 12v20l14 9" fill="none" stroke="#445c58" strokeWidth="5" strokeLinecap="round" />
      <circle cx="31" cy="31" r="4" fill="#cf665b" />
    </g>

    <g transform="translate(520 76)">
      <path d="M0 97h162v13H0Z" fill="#7a5b50" /><path d="M8 0h146v96H8Z" fill="#f4f2eb" stroke="#a9bdb5" strokeWidth="5" />
      <path d="M17 28h126M17 59h126" stroke="#c5d2cc" strokeWidth="4" />
      <g fill="#6d6598"><rect x="23" y="10" width="34" height="15" rx="3" /><rect x="61" y="8" width="22" height="17" rx="3" /></g>
      <g fill="#4b9ba1"><rect x="91" y="9" width="42" height="16" rx="3" /><rect x="23" y="40" width="48" height="15" rx="3" /></g>
      <g fill="#d87668"><rect x="78" y="39" width="28" height="16" rx="3" /><rect x="112" y="39" width="22" height="16" rx="3" /></g>
      <path d="M25 89h38V69H25Z" fill="#6c89b5" /><path d="M70 90h27V67H70Z" fill="#ca6b74" />
      <g transform="translate(120 77)"><path d="M0 13c-2-18 7-31 22-32 15 1 22 14 18 32Z" fill="#5b9b6f" /><path d="M20 12V-8m0 9L9-10m11 9 13-12" fill="none" stroke="#2f7758" strokeWidth="4" strokeLinecap="round" /><path d="M5 13h32l-5 21H10Z" fill="#96645a" /></g>
    </g>

    <g transform="translate(267 180)" filter={`url(#${id}-shadow)`}>
      <ellipse cx="90" cy="65" rx="66" ry="14" fill="#315f52" opacity=".15" />
      <path d="M30 34c2-38 28-63 62-63 35 0 62 26 62 63Z" fill="#f4f2ea" stroke="#7c6c9e" strokeWidth="6" />
      <path d="M90-29c35 0 62 26 64 63H90Z" fill="#6f91b6" />
      <ellipse cx="91" cy="34" rx="64" ry="19" fill="#486b88" />
      <ellipse cx="91" cy="31" rx="57" ry="16" fill="#62aec0" />
      <path d="M91-22v50M51-3c25 8 53 8 80 0M38 16c34 8 71 8 106 0" fill="none" stroke="#e9f2ef" strokeWidth="3" opacity=".65" />
      <path d="M91-26c-19 16-23 38-18 58m18-58c20 16 24 38 19 58" fill="none" stroke="#e9f2ef" strokeWidth="3" opacity=".65" />
      <path d="M91 49v22" stroke="#7a5b50" strokeWidth="7" /><path d="M65 76h52" stroke="#7a5b50" strokeWidth="8" strokeLinecap="round" />
    </g>

    <g transform="translate(29 198)">
      <path d="M18 85h116v16H18Z" fill="#79594c" /><path d="M27 0h98v84H27Z" fill="#f2f0ea" stroke="#9cadab" strokeWidth="5" />
      <path d="M35 24h82M35 50h82" stroke="#c4d0cb" strokeWidth="4" />
      <g fill="#537aaa"><rect x="40" y="8" width="31" height="12" rx="2" /><rect x="77" y="7" width="34" height="13" rx="2" /></g>
      <g fill="#cf6f62"><rect x="39" y="34" width="42" height="12" rx="2" /><rect x="87" y="33" width="24" height="13" rx="2" /></g>
      <g transform="translate(78 67)"><path d="M0 10c3-20 16-26 30-14 14-12 28-5 29 14Z" fill="#3f8d69" /><path d="M29 8V-14m0 9L18-18m11 11 13-15" fill="none" stroke="#25684d" strokeWidth="4" strokeLinecap="round" /><path d="M10 10h39l-6 25H16Z" fill="#b16c62" /></g>
    </g>

    <g transform="translate(42 304)" data-yellow-object="backpack">
      <path d="M31 10V0c0-18 39-20 43 0v10" fill="none" stroke="#89613d" strokeWidth="8" strokeLinecap="round" />
      <path d="M11 25C12 8 24 1 40 4l31 6c14 3 22 13 22 29v70H10Z" fill={yellow} stroke="#a97827" strokeWidth="5" />
      <path d="M70 10c14 3 22 13 22 29v70H64V9Z" fill="#dba932" />
      <path d="M22 34h47c8 0 13 5 13 13v18H22Z" fill="#f6dc78" /><path d="M24 79h55v22H24Z" fill="#d7a72e" /><rect x="43" y="42" width="15" height="15" rx="4" fill="#fff6dc" />
    </g>

    <g transform="translate(182 315)" filter={`url(#${id}-shadow)`}>
      <path d="M0 25 372 0l101 48-370 36Z" fill={`url(#${id}-desk)`} />
      <path d="m103 84 370-36v18l-370 40Z" fill="#7d5145" /><path d="M0 25 103 84v22L0 46Z" fill="#94604d" />
      <path d="M38 61v94M422 64v74" stroke="#765044" strokeWidth="16" />
    </g>

    <g transform="translate(210 339) rotate(-4)" data-yellow-object="ruler">
      <rect width="122" height="20" rx="5" fill={yellow} stroke="#a97827" strokeWidth="3" />
      {[16,32,48,64,80,96,112].map((x, index) => <path key={x} d={`M${x} 2v${index % 2 ? 7 : 11}`} stroke="#755c32" strokeWidth="2" />)}
    </g>
    <g transform="translate(322 356) rotate(3)" data-yellow-object="notebook">
      <rect width="92" height="67" rx="7" fill="#aa764f" opacity=".22" transform="translate(4 5)" /><rect width="92" height="67" rx="7" fill={yellow} stroke="#a97827" strokeWidth="3" />
      <path d="M17 0v67M28 18h49M28 32h49M28 46h37" stroke="#fff5ce" strokeWidth="3" /><g fill="#476b67">{[11,24,37,50].map(y => <circle key={y} cx="10" cy={y} r="3" />)}</g>
    </g>
    <g transform="translate(443 367) rotate(-5)" data-yellow-object="pencil-case">
      <rect width="105" height="38" rx="18" fill={yellow} stroke="#a97827" strokeWidth="4" /><path d="M19 7h65" stroke="#fff3c3" strokeWidth="4" strokeLinecap="round" /><circle cx="91" cy="18" r="5" fill="#805f36" />
    </g>
    <g transform="translate(566 286)" data-yellow-object="cup">
      <path d="M0 8h52v69H8Z" fill={yellow} stroke="#a97827" strokeWidth="4" /><path d="M52 22h12c17 0 17 32 0 34H52" fill="none" stroke="#a97827" strokeWidth="7" /><ellipse cx="26" cy="8" rx="26" ry="8" fill="#f7dc79" />
      <g strokeLinecap="round" strokeWidth="5"><path d="M15 4 3-34" stroke="#cf665b" /><path d="M27 4 32-39" stroke="#4e79a9" /><path d="M39 4 53-31" stroke="#6b5c91" /></g>
    </g>
    <g transform="translate(158 429)" data-yellow-object="ball">
      <circle r="32" fill={yellow} stroke="#a97827" strokeWidth="4" /><path d="M-28-12C-7-6 7 6 18 25M-8-30c1 16-5 28-19 40M16-25C3-14-2-3 1 11" fill="none" stroke="#fff2bd" strokeWidth="6" />
    </g>
    <g transform="translate(565 389)" data-yellow-object="lunch-box">
      <path d="M22 10V0c0-18 47-18 47 0v10" fill="none" stroke="#825e3d" strokeWidth="7" /><rect width="92" height="65" rx="13" fill={yellow} stroke="#a97827" strokeWidth="4" /><path d="M0 26h92" stroke="#a97827" strokeWidth="4" /><rect x="38" y="22" width="17" height="12" rx="4" fill="#fff3c6" />
    </g>

    <g transform="translate(485 215)">
      <path d="M0 50h68v21H0Z" fill="#4e83a5" /><rect x="8" y="6" width="12" height="45" rx="6" fill="#0d7572" /><path d="M14 6V-8" stroke="#d8eeee" strokeWidth="4" />
      <path d="M31 10h28v41H31Z" fill="#6f6498" /><path d="M35 18h20M35 27h20" stroke="#eeeaf5" strokeWidth="3" />
    </g>
    <g transform="translate(246 287)">
      <circle cx="16" cy="15" r="12" fill="none" stroke="#ce655c" strokeWidth="6" /><circle cx="49" cy="15" r="12" fill="none" stroke="#ce655c" strokeWidth="6" /><path d="m25 24 31 34M41 24 16 57" stroke="#7a5f6a" strokeWidth="5" strokeLinecap="round" />
    </g>
    <g transform="translate(426 278)">
      <path d="M13 42c0-18 29-18 29 0Z" fill="#c76558" /><path d="M27 8v22" stroke="#80584c" strokeWidth="6" /><path d="M14 8h27l7 8H7Z" fill="#dc7b6c" /><circle cx="27" cy="4" r="6" fill="#8d5f54" />
    </g>
    <g transform="translate(368 285) rotate(8)">
      <rect width="48" height="24" rx="6" fill="#f4f2ed" stroke="#d5746b" strokeWidth="4" /><path d="M10 8h27" stroke="#d9d5ce" strokeWidth="3" />
    </g>
  </svg>
}
