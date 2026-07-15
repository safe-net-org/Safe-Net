import type { ReactNode } from 'react'
import { FONT_MONO, T } from '@/src/shared/config/tokens'

interface InfoRowProps {
  label: string
  value: ReactNode
  mono?: boolean
  color?: string
}

export function InfoRow({ label, value, mono, color }: InfoRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '5px 0',
      borderBottom: `1px dashed ${T.border}`,
      fontSize: 12,
    }}>
      <span style={{ color: T.textDim, flexShrink: 0 }}>{label}</span>
      <span
        className={mono ? 'tabular' : undefined}
        style={{
          color: color ?? T.text,
          fontFamily: mono ? FONT_MONO : undefined,
          fontWeight: 600,
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 220,
        }}
      >
        {value}
      </span>
    </div>
  )
}
