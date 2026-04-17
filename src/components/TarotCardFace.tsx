type TarotCardFaceProps = {
  arcana: string
  role: string
  motif: string
  cardNo: number
  reversed?: boolean
}

const romanNumerals = [
  '0',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
]

const accentPalette = [
  { top: '#faf7ff', mid: '#d8d4e6', bottom: '#48506a', sigil: '#d7c6a3' },
  { top: '#f8f4ff', mid: '#d5d9eb', bottom: '#404a63', sigil: '#d3cdb1' },
  { top: '#fff8f3', mid: '#d9d0de', bottom: '#4d465e', sigil: '#e0caa8' },
  { top: '#f6f7ff', mid: '#cfd9e8', bottom: '#38465c', sigil: '#cfc8a7' },
  { top: '#fffaf7', mid: '#ddd5d0', bottom: '#564a51', sigil: '#e1c7a2' },
  { top: '#f5f7fb', mid: '#d0d6e2', bottom: '#3d4654', sigil: '#d9ceb3' },
]

function renderCenterGlyph(cardNo: number) {
  switch (cardNo % 6) {
    case 0:
      return (
        <>
          <path
            d="M0 -34 L10 -8 L38 0 L10 8 L0 34 L-10 8 L-38 0 L-10 -8 Z"
            fill="none"
            stroke="rgba(255,255,255,0.76)"
            strokeWidth="1.8"
          />
          <circle r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(247,236,205,0.62)" />
        </>
      )
    case 1:
      return (
        <>
          <polygon
            points="0,-34 29,16 -29,16"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.76)"
            strokeWidth="1.8"
          />
          <circle cx="0" cy="2" r="11" fill="none" stroke="rgba(247,236,205,0.58)" />
        </>
      )
    case 2:
      return (
        <>
          <rect
            x="-20"
            y="-20"
            width="40"
            height="40"
            rx="10"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.74)"
            strokeWidth="1.7"
          />
          <path
            d="M-24 0 H24 M0 -24 V24"
            fill="none"
            stroke="rgba(247,236,205,0.56)"
            strokeWidth="1.2"
          />
        </>
      )
    case 3:
      return (
        <>
          <path
            d="M0 -34 C10 -18 10 18 0 34 C-10 18 -10 -18 0 -34 Z"
            fill="rgba(255,255,255,0.09)"
            stroke="rgba(255,255,255,0.76)"
            strokeWidth="1.8"
          />
          <circle r="8" fill="rgba(247,236,205,0.76)" opacity="0.88" />
        </>
      )
    case 4:
      return (
        <>
          <path
            d="M-30 14 Q0 -38 30 14 Q0 2 -30 14 Z"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth="1.8"
          />
          <path
            d="M-26 20 Q0 0 26 20"
            fill="none"
            stroke="rgba(247,236,205,0.58)"
            strokeWidth="1.3"
          />
        </>
      )
    default:
      return (
        <>
          <circle r="28" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="1.7" />
          <path
            d="M0 -32 L28 0 L0 32 L-28 0 Z"
            fill="rgba(255,255,255,0.07)"
            stroke="rgba(247,236,205,0.6)"
            strokeWidth="1.4"
          />
        </>
      )
  }
}

function renderLowerCrest(cardNo: number) {
  switch (cardNo % 4) {
    case 0:
      return (
        <>
          <path d="M90 282 H150" fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="1.6" />
          <circle cx="120" cy="282" r="5" fill="rgba(247,236,205,0.7)" />
        </>
      )
    case 1:
      return (
        <path
          d="M84 292 C98 274 142 274 156 292"
          fill="none"
          stroke="rgba(255,255,255,0.36)"
          strokeWidth="1.8"
        />
      )
    case 2:
      return (
        <>
          <path
            d="M92 286 L120 272 L148 286"
            fill="none"
            stroke="rgba(255,255,255,0.34)"
            strokeWidth="1.7"
          />
          <path
            d="M104 296 H136"
            fill="none"
            stroke="rgba(247,236,205,0.54)"
            strokeWidth="1.2"
          />
        </>
      )
    default:
      return (
        <path
          d="M90 288 Q120 264 150 288 Q120 302 90 288 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth="1.5"
        />
      )
  }
}

export function TarotCardFace({
  arcana,
  role,
  motif,
  cardNo,
  reversed = false,
}: TarotCardFaceProps) {
  const palette = accentPalette[cardNo % accentPalette.length]
  const orbitRotation = cardNo * 17
  const sigilRotation = cardNo * 11
  const starCount = 5 + (cardNo % 4)
  const stars = Array.from({ length: starCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / starCount + cardNo * 0.07
    return {
      x: 120 + Math.cos(angle) * 66,
      y: 164 + Math.sin(angle) * 66,
      r: index % 2 === 0 ? 3.4 : 2.1,
    }
  })

  return (
    <div className={reversed ? 'tarot-face reversed' : 'tarot-face'}>
      <svg viewBox="0 0 240 380" role="img" aria-label={arcana}>
        <defs>
          <linearGradient id={`card-bg-${cardNo}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.top} />
            <stop offset="34%" stopColor={palette.mid} />
            <stop offset="72%" stopColor={palette.bottom} />
            <stop offset="100%" stopColor="#202635" />
          </linearGradient>
          <linearGradient id={`sigil-${cardNo}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffdf6" stopOpacity="0.98" />
            <stop offset="100%" stopColor={palette.sigil} stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={`halo-${cardNo}`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#fff7ea" stopOpacity="0.76" />
            <stop offset="55%" stopColor="#ddd0b0" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ddd0b0" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="8" y="8" width="224" height="364" rx="22" fill={`url(#card-bg-${cardNo})`} />
        <rect x="20" y="20" width="200" height="340" rx="18" fill="none" stroke="rgba(255,255,255,0.45)" />
        <rect x="28" y="28" width="184" height="324" rx="14" fill="rgba(18,22,28,0.18)" stroke="rgba(255,255,255,0.15)" />
        <rect x="36" y="36" width="168" height="308" rx="12" fill="none" stroke="rgba(242,232,203,0.22)" />

        <path d="M44 44 H80" fill="none" stroke="rgba(247,237,211,0.42)" strokeWidth="1.1" />
        <path d="M44 44 V80" fill="none" stroke="rgba(247,237,211,0.42)" strokeWidth="1.1" />
        <path d="M196 44 H160" fill="none" stroke="rgba(247,237,211,0.42)" strokeWidth="1.1" />
        <path d="M196 44 V80" fill="none" stroke="rgba(247,237,211,0.42)" strokeWidth="1.1" />
        <path d="M44 336 H80" fill="none" stroke="rgba(247,237,211,0.32)" strokeWidth="1.1" />
        <path d="M44 336 V300" fill="none" stroke="rgba(247,237,211,0.32)" strokeWidth="1.1" />
        <path d="M196 336 H160" fill="none" stroke="rgba(247,237,211,0.32)" strokeWidth="1.1" />
        <path d="M196 336 V300" fill="none" stroke="rgba(247,237,211,0.32)" strokeWidth="1.1" />

        <path d="M52 52 Q120 26 188 52" fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="1.2" />
        <path d="M52 330 Q120 356 188 330" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.1" />
        <circle cx="120" cy="44" r="3.2" fill="rgba(255,255,255,0.8)" />
        <circle cx="120" cy="338" r="2.7" fill="rgba(255,255,255,0.62)" />

        <text x="120" y="54" textAnchor="middle" className="card-number">
          {romanNumerals[cardNo]}
        </text>
        <text x="120" y="84" textAnchor="middle" className="card-title">
          {arcana}
        </text>

        <g transform={`translate(120 170) rotate(${orbitRotation})`}>
          <circle r="86" fill={`url(#halo-${cardNo})`} />
          <circle r="74" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          <circle r="64" fill="none" stroke="rgba(247,236,205,0.18)" strokeWidth="0.9" />
          <circle r="52" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="5 7" />
          <polygon
            points="0,-60 52,30 -52,30"
            fill="rgba(18,22,28,0.18)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
          />
          <polygon
            points="0,64 46,-18 -46,-18"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.3"
          />
        </g>

        <g transform={`translate(120 170) rotate(${sigilRotation})`}>
          <circle r="20" fill={`url(#sigil-${cardNo})`} opacity="0.9" />
          {renderCenterGlyph(cardNo)}
          <circle r="8" fill="#5b626d" />
          <circle r="4" fill="#f7f8fb" />
        </g>

        <g transform="translate(120 170)">
          <path
            d="M0 -84 L0 -98 M0 84 L0 98 M-84 0 L-98 0 M84 0 L98 0"
            fill="none"
            stroke="rgba(247,236,205,0.34)"
            strokeWidth="1"
          />
          <path
            d="M-60 -60 L-72 -72 M60 -60 L72 -72 M-60 60 L-72 72 M60 60 L72 72"
            fill="none"
            stroke="rgba(247,236,205,0.24)"
            strokeWidth="0.9"
          />
        </g>

        {stars.map((star, index) => (
          <circle
            key={`${cardNo}-${index}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="rgba(255,255,255,0.8)"
            opacity={0.88 - index * 0.08}
          />
        ))}

        <path
          d="M58 274 C88 248 154 248 184 274"
          fill="none"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth="2"
        />
        <path
          d="M68 290 C98 268 142 268 172 290"
          fill="none"
          stroke="rgba(18,22,28,0.24)"
          strokeWidth="1.2"
        />
        <path
          d="M82 302 C98 292 142 292 158 302"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
        />
        {renderLowerCrest(cardNo)}

        <text x="120" y="320" textAnchor="middle" className="card-role">
          {role}
        </text>
        <text x="120" y="346" textAnchor="middle" className="card-motif">
          {motif}
        </text>
      </svg>
    </div>
  )
}
