import type { ReactNode } from 'react'
import { T } from '@/src/shared/config/tokens'

interface PillProps {
  children: ReactNode
  color: string
  bg?: string
  border?: string
}

export function Pill({ children, color, bg, border }: PillProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px',
      borderRadius: T.radPill,
      background: bg ?? 'transparent',
      border: `1px solid ${border ?? T.borderStrong}`,
      fontSize: 11,
      fontWeight: 600,
      color,
      letterSpacing: '0.04em',
    }}>
      {children}
    </span>
  )
}
