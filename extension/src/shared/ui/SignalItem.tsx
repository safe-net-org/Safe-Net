import type { RiskSignal } from '@/src/entities/analysis'
import { T } from '@/src/shared/config/tokens'

const MAP: Record<RiskSignal['severity'], { color: string; bg: string; border: string }> = {
  high:   { color: T.danger,    bg: 'oklch(65% 0.24 25 / 0.08)', border: 'oklch(65% 0.24 25 / 0.25)' },
  medium: { color: T.warn,      bg: 'oklch(80% 0.16 80 / 0.08)', border: 'oklch(80% 0.16 80 / 0.25)' },
  low:    { color: T.textMuted, bg: T.surface,                   border: T.border },
}

interface SignalItemProps { signal: RiskSignal }

export function SignalItem({ signal }: SignalItemProps) {
  const c = MAP[signal.severity]
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: T.radTile,
      padding: '10px 12px',
      marginBottom: 6,
    }}>
      <span style={{
        width: 3, alignSelf: 'stretch',
        background: c.color, borderRadius: 999, flexShrink: 0,
        boxShadow: signal.severity !== 'low' ? `0 0 8px ${c.color}` : undefined,
      }} />
      <span style={{ fontSize: 12.5, color: c.color, lineHeight: 1.45, flex: 1 }}>
        {signal.message}
      </span>
    </div>
  )
}
