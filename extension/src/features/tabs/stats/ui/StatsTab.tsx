import type { GlobalStats } from '@/src/entities/stats'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { fmtDuration, fmtNum } from '@/src/shared/lib/format'
import { Sparkline } from '@/src/shared/ui/Sparkline'
import { StatTile } from '@/src/shared/ui/StatTile'

interface StatsTabProps {
  stats: GlobalStats
}

export function StatsTab({ stats }: StatsTabProps) {
  const sinceInstall = Date.now() - stats.installedAt
  const last24 = stats.last24h.length
  const blockedRate = stats.totalChecked > 0
    ? Math.round(((stats.totalBlocked + stats.totalSuspicious) / stats.totalChecked) * 100)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        padding: '12px 14px', borderRadius: T.radTile,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 11, color: T.textDim,
            letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT_MONO,
          }}>
            Активность 24ч
          </span>
          <span className="tabular" style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>
            {last24} проверок
          </span>
        </div>
        <Sparkline events={stats.last24h} />
        <div style={{
          display: 'flex', gap: 10, marginTop: 8,
          fontSize: 10, color: T.textDim, fontFamily: FONT_MONO,
        }}>
          <span><span style={{ color: T.ok }}>●</span> safe</span>
          <span><span style={{ color: T.warn }}>●</span> warn</span>
          <span><span style={{ color: T.danger }}>●</span> block</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatTile label="Всего проверено" value={fmtNum(stats.totalChecked)} accent={T.accent} />
        <StatTile label="Заблокировано" value={fmtNum(stats.totalBlocked)} accent={T.danger} />
        <StatTile label="Подозрительных" value={fmtNum(stats.totalSuspicious)} accent={T.warn} />
        <StatTile label="Безопасных" value={fmtNum(stats.totalSafe)} accent={T.ok} />
        <StatTile label="ML-срабатываний" value={fmtNum(stats.mlHits)} accent={T.accentSoft} />
        <StatTile label="DOM-сигналов" value={fmtNum(stats.domHits)} accent={T.accentViolet} />
        <StatTile label="% угроз" value={`${blockedRate}%`} sub="от всех проверок" />
        <StatTile label="Защита" value={fmtDuration(sinceInstall)} sub="с установки" />
      </div>

      {stats.topThreats.length > 0 && (
        <div>
          <div style={{
            fontSize: 11, color: T.textDim,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontFamily: FONT_MONO, marginBottom: 6,
          }}>
            Последние угрозы
          </div>
          {stats.topThreats.slice(0, 4).map((t) => (
            <div key={t.domain} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px',
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.radTile,
              marginBottom: 4,
              fontSize: 12,
            }}>
              <span style={{
                color: T.textMuted, fontFamily: FONT_MONO,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220,
              }}>
                {t.domain}
              </span>
              <span className="tabular" style={{
                color: t.score >= 70 ? T.danger : T.warn, fontWeight: 700,
              }}>
                {t.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
