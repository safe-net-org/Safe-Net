import { useMemo } from 'react'
import type { RecentEvent } from '@/src/entities/stats'
import { T } from '@/src/shared/config/tokens'

interface SparklineProps {
  events: RecentEvent[]
}

export function Sparkline({ events }: SparklineProps) {
  const buckets = useMemo(() => {
    const now = Date.now()
    const arr = new Array(12).fill(0).map(() => ({ s: 0, w: 0, d: 0 }))
    events.forEach((e) => {
      const ageH = (now - e.ts) / (60 * 60 * 1000)
      if (ageH > 24) return
      const idx = Math.min(11, Math.floor((24 - ageH) / 2))
      if (e.level === 'danger') arr[idx].d += 1
      else if (e.level === 'suspicious') arr[idx].w += 1
      else arr[idx].s += 1
    })
    return arr
  }, [events])

  const max = Math.max(1, ...buckets.map((b) => b.s + b.w + b.d))

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 36 }}>
      {buckets.map((b, i) => {
        const total = b.s + b.w + b.d
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', height: 36 }}>
            {b.s > 0 && <div style={{ height: (b.s / max) * 36, background: T.ok, borderRadius: 2 }} />}
            {b.w > 0 && <div style={{ height: (b.w / max) * 36, background: T.warn, borderRadius: 2 }} />}
            {b.d > 0 && <div style={{ height: (b.d / max) * 36, background: T.danger, borderRadius: 2 }} />}
            {total === 0 && <div style={{ height: 2, background: T.border, borderRadius: 2 }} />}
          </div>
        )
      })}
    </div>
  )
}
