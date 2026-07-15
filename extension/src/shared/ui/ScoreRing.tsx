import type { RiskLevel } from '@/src/entities/analysis'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { LEVEL } from '@/src/shared/config/levels'

interface ScoreRingProps {
  score: number
  level: RiskLevel
  animated: boolean
}

export function ScoreRing({ score, level, animated }: ScoreRingProps) {
  const cfg = LEVEL[level]
  const r = 56
  const circ = 2 * Math.PI * r
  const dash = animated ? (score / 100) * circ : 0

  return (
    <div style={{ position: 'relative', width: 152, height: 152 }}>
      <svg width="152" height="152" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={T.accentGlow} />
            <stop offset="100%" stopColor={cfg.color} />
          </linearGradient>
        </defs>
        <circle cx="76" cy="76" r={r} fill="none" stroke={T.border} strokeWidth="9" />
        <circle
          cx="76" cy="76" r={r}
          fill="none"
          stroke={level === 'safe' ? 'url(#ring-grad)' : cfg.color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            filter: `drop-shadow(0 0 8px ${cfg.color})`,
            transition: animated ? 'stroke-dasharray 1.1s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="tabular" style={{
          fontSize: 36, fontWeight: 700, color: cfg.color,
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>
          {score}
        </span>
        <span style={{
          fontSize: 10, color: T.textDim, marginTop: 4,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: FONT_MONO,
        }}>
          / 100
        </span>
      </div>
    </div>
  )
}
