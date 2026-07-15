import type { ReactNode } from 'react'
import { FONT_MONO, T } from '@/src/shared/config/tokens'

interface StatTileProps {
  label: string
  value: ReactNode
  sub?: string
  accent?: string
}

export function StatTile({ label, value, sub, accent }: StatTileProps) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radTile,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', overflow: 'hidden',
    }}>
      <span style={{
        fontSize: 10, color: T.textDim, fontFamily: FONT_MONO,
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span className="tabular" style={{
        fontSize: 20, fontWeight: 700,
        color: accent ?? T.text,
        letterSpacing: '-0.02em', lineHeight: 1.1,
      }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 10, color: T.textDim }}>{sub}</span>}
    </div>
  )
}
