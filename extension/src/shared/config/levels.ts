import { T } from './tokens'
import type { RiskLevel } from '@/src/entities/analysis'

export interface LevelConfig {
  color: string
  glow: string
  dot: string
  emoji: string
}

export const LEVEL: Record<RiskLevel, LevelConfig> = {
  safe:       { color: T.ok,     glow: 'oklch(72% 0.18 155 / 0.18)', dot: T.ok,     emoji: '🟢' },
  suspicious: { color: T.warn,   glow: 'oklch(80% 0.16 80 / 0.18)',  dot: T.warn,   emoji: '🟡' },
  danger:     { color: T.danger, glow: 'oklch(65% 0.24 25 / 0.20)',  dot: T.danger, emoji: '🔴' },
}
