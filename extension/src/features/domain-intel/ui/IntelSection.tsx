import type { ReactNode } from 'react'
import { FONT_MONO, T } from '@/src/shared/config/tokens'

interface IntelSectionProps {
  title: string
  badge?: ReactNode
  children: ReactNode
}

export function IntelSection({ title, badge, children }: IntelSectionProps) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radTile,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{
          fontSize: 10.5, color: T.textDim, fontFamily: FONT_MONO,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          {title}
        </span>
        {badge}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  )
}
