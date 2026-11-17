import type { ReactNode } from 'react'

import type { Destination } from '../lib/data'

type Variant = Destination['art']

const PALETTE: Record<Variant, { sky: [string, string, string]; glow: string; sun: [number, number] }> = {
  dubai: { sky: ['#0b1733', '#2b2a5e', '#e0a45f'], glow: '#f7d9a0', sun: [304, 86] },
  istanbul: { sky: ['#1a1030', '#4a2350', '#e98a5a'], glow: '#ffd6b0', sun: [298, 84] },
  london: { sky: ['#0a1424', '#1b3350', '#5d8fa8'], glow: '#cfe2ff', sun: [312, 72] },
  hunza: { sky: ['#08202c', '#155b66', '#7fd7c4'], glow: '#d8f7ef', sun: [300, 66] },
  skardu: { sky: ['#071a20', '#124a4a', '#8ad9b4'], glow: '#e8fbe8', sun: [86, 66] },
  alps: { sky: ['#071229', '#21395e', '#9fc0dd'], glow: '#e6f0ff', sun: [316, 64] },
}

const SCENES: Record<Variant, ReactNode> = {
  dubai: (
    <>
      <circle cx="304" cy="86" r="26" fill="#f8dca6" opacity="0.92" />
      <g fill="#050d1c" opacity="0.95">
        <path d="M118 244V132l9-44 9 44v112z" />
        <rect x="44" y="186" width="24" height="58" rx="2" />
        <rect x="76" y="164" width="16" height="80" rx="2" />
        <rect x="150" y="176" width="20" height="68" rx="2" />
        <path d="M186 244v-66l14-30 12 30v66z" />
        <rect x="226" y="200" width="28" height="44" rx="2" />
        <path d="M284 244v-54c18 8 26 28 30 54z" />
        <path d="M332 244v-46l10-18 8 18v46z" />
      </g>
      <rect y="244" width="400" height="56" fill="#03080f" />
      <g stroke="#f2c879" strokeOpacity="0.22" strokeWidth="1">
        <path d="M0 258h400" />
        <path d="M0 274h400" />
      </g>
    </>
  ),
  istanbul: (
    <>
      <circle cx="298" cy="84" r="24" fill="#ffe7c8" opacity="0.85" />
      <g fill="#0a0f1e">
        <path d="M150 218v-30a32 32 0 0 1 64 0v30z" />
        <rect x="142" y="210" width="80" height="10" rx="4" />
        <path d="M126 218v-50h7v-12l5-9 5 9v12h7v50z" />
        <path d="M250 218v-62h7v-12l5-9 5 9v12h7v62z" />
        <rect x="60" y="192" width="36" height="26" rx="2" />
        <rect x="300" y="198" width="46" height="20" rx="2" />
      </g>
      <rect y="218" width="400" height="82" fill="#070b16" />
      <g stroke="#f2c879" strokeOpacity="0.2" strokeWidth="1.5">
        <path d="M20 238h60" />
        <path d="M180 252h70" />
        <path d="M300 234h50" />
      </g>
      <path d="M64 264h52l-8 12H72z" fill="#0d1526" />
    </>
  ),
  london: (
    <>
      <circle cx="312" cy="72" r="22" fill="#e8f1ff" opacity="0.75" />
      <g fill="#060d1a">
        <rect x="58" y="146" width="26" height="82" rx="2" />
        <path d="M62 146v-18h18v18z" />
        <path d="M74 128v-30l5-12 5 12v30z" />
        <rect x="190" y="188" width="46" height="40" rx="2" />
        <rect x="250" y="196" width="24" height="32" rx="2" />
      </g>
      <g stroke="#0a1626" strokeWidth="3" fill="none">
        <circle cx="300" cy="176" r="46" />
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index * Math.PI) / 4
          return (
            <line
              key={index}
              x1={300 + Math.cos(angle) * 6}
              y1={176 + Math.sin(angle) * 6}
              x2={300 + Math.cos(angle) * 44}
              y2={176 + Math.sin(angle) * 44}
            />
          )
        })}
      </g>
      <rect y="228" width="400" height="72" fill="#050b16" />
      <g stroke="#7aa8ff" strokeOpacity="0.18" strokeWidth="1">
        <path d="M0 244h400" />
        <path d="M0 260h400" />
        <path d="M0 276h400" />
      </g>
    </>
  ),
  hunza: (
    <>
      <circle cx="300" cy="66" r="20" fill="#eafcff" opacity="0.82" />
      <path d="M-20 186 66 74l50 68 38-40 56 84z" fill="#0a2530" />
      <path d="M66 74l20 27-13 6 16 12-23 23z" fill="#d8eef4" opacity="0.85" />
      <path d="M196 186l62-78 36 38 32-24 50 64z" fill="#08202b" />
      <path d="M258 108l22 26-14 5 16 13-24 15z" fill="#d8eef4" opacity="0.8" />
      <rect y="182" width="400" height="118" fill="#0b3a49" />
      <rect y="182" width="400" height="118" fill="url(#trexifly-lake)" />
      <g stroke="#9ff2d6" strokeOpacity="0.3" strokeWidth="1.4">
        <path d="M120 208h80" />
        <path d="M40 226h70" />
        <path d="M210 236h90" />
        <path d="M290 214h60" />
        <path d="M150 252h64" />
      </g>
      <path d="M172 246h40l-7 9h-26z" fill="#f2c879" opacity="0.85" />
    </>
  ),
  skardu: (
    <>
      <circle cx="86" cy="66" r="18" fill="#f4ffe8" opacity="0.75" />
      <path d="M0 170 78 92l44 46 34-28 48 60z" fill="#08262a" />
      <path d="M78 92l18 22-12 5 14 11-20 16z" fill="#e2f5ef" opacity="0.8" />
      <path d="M200 170l58-56 40 36 34-20 68 40z" fill="#07211f" />
      <rect y="170" width="400" height="130" fill="#0b3b3a" />
      <rect y="170" width="400" height="130" fill="url(#trexifly-lake)" opacity="0.55" />
      <g fill="#04140f">
        <path d="M60 214l12-30 12 30z" />
        <path d="M96 220l10-24 10 24z" />
        <path d="M300 212l13-32 13 32z" />
        <path d="M336 222l11-26 11 26z" />
      </g>
      <g stroke="#9ff2d6" strokeOpacity="0.28" strokeWidth="1.4">
        <path d="M100 240h90" />
        <path d="M220 254h80" />
        <path d="M40 264h60" />
      </g>
    </>
  ),
  alps: (
    <>
      <circle cx="316" cy="64" r="20" fill="#eaf2ff" opacity="0.85" />
      <path d="M0 196 84 92l46 52 34-40 60 92z" fill="#0b1a33" />
      <path d="M84 92l20 24-14 6 18 12-24 22z" fill="#dbe8f7" opacity="0.9" />
      <path d="M200 196l74-96 44 52 34-26 48 70z" fill="#0a172c" />
      <path d="M274 100l22 26-15 5 18 14-26 16z" fill="#dbe8f7" opacity="0.85" />
      <rect y="196" width="400" height="104" fill="#050c17" />
      <path d="M40 226c60-10 120-10 180 0s120 10 180 0" stroke="#9fb6d6" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="4 6" />
      <path d="M232 226V196" stroke="#9fb6d6" strokeOpacity="0.5" strokeWidth="1.4" />
      <rect x="226" y="222" width="14" height="10" rx="2" fill="#f2c879" opacity="0.9" />
    </>
  ),
}

/**
 * Hand-drawn SVG scenery per destination, so the cards ship with artwork but
 * no external image requests. Swap for photography by replacing this component.
 */
export function DestinationArt({ variant, className }: { variant: Variant; className?: string }) {
  const palette = PALETTE[variant]
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`trexifly-sky-${variant}`} x1="0" y1="0" x2="0.18" y2="1">
          <stop offset="0" stopColor={palette.sky[0]} />
          <stop offset="0.55" stopColor={palette.sky[1]} />
          <stop offset="1" stopColor={palette.sky[2]} />
        </linearGradient>
        <radialGradient id={`trexifly-glow-${variant}`}>
          <stop offset="0" stopColor={palette.glow} stopOpacity="0.5" />
          <stop offset="1" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="trexifly-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f4b5c" />
          <stop offset="1" stopColor="#03141c" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#trexifly-sky-${variant})`} />
      <circle cx={palette.sun[0]} cy={palette.sun[1]} r="72" fill={`url(#trexifly-glow-${variant})`} />
      {SCENES[variant]}
    </svg>
  )
}
