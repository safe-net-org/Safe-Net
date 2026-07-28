import type { AnalysisResult } from '@/src/entities/analysis'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { StatTile } from '@/src/shared/ui/StatTile'

interface OverviewTabProps {
  result: AnalysisResult
}

interface SourceBadge { name: string; color: string }

const OPEN_SOURCES: SourceBadge[] = [
  { name: 'RDAP',          color: T.accentSoft },
  { name: 'Cloudflare DoH', color: T.accentSoft },
  { name: 'Quad9',         color: T.ok },
  { name: 'AdGuard DNS',   color: T.ok },
  { name: 'crt.sh CT',     color: T.warn },
  { name: 'ipapi geo',     color: T.accent },
]

export function OverviewTab({ result }: OverviewTabProps) {
  const { t } = useExtensionI18n()
  const summary = result.level === 'safe'
    ? t('overview.safe')
    : result.level === 'suspicious'
      ? t('overview.suspicious', { count: result.signals.length })
      : t('overview.danger', {
          count: result.signals.filter((s) => s.severity === 'high').length,
        })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        padding: '12px 14px', borderRadius: T.radTile,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <div style={{
          fontSize: 11, color: T.textDim, marginBottom: 6,
          letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT_MONO,
        }}>
          {t('overview.title')}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>
          {summary}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatTile label={t('overview.signals')} value={result.signals.length} accent={result.signals.length ? T.warn : T.ok} />
        <StatTile label={t('overview.urlLength')} value={result.features.urlLength} sub={t(result.features.urlLength > 75 ? 'overview.long' : 'overview.normal')} />
        <StatTile label={t('overview.subdomains')} value={result.features.subdomainDepth} sub={t(result.features.subdomainDepth > 3 ? 'overview.deep' : 'overview.normal')} />
        <StatTile label={t('overview.entropy')} value={result.features.domainEntropy.toFixed(2)} sub={t(result.features.domainEntropy > 3.5 ? 'overview.high' : 'overview.normal')} />
      </div>

      {result.features.nearestBrand && result.features.levenshteinDistance <= 2 && (
        <div style={{
          padding: '10px 12px', borderRadius: T.radTile,
          background: 'oklch(65% 0.24 25 / 0.08)',
          border: '1px solid oklch(65% 0.24 25 / 0.25)',
          fontSize: 12, color: T.danger,
        }}>
          ⚠ {t('overview.brand', {
            brand: result.features.nearestBrand,
            distance: result.features.levenshteinDistance,
          })}
        </div>
      )}

      {/* OPEN DB SOURCES */}
      <div style={{
        padding: '12px 14px', borderRadius: T.radTile,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
        }}>
          <span style={{
            fontSize: 11, color: T.textDim,
            letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT_MONO,
          }}>
            {t('overview.sources')}
          </span>
          <span style={{
            fontSize: 9.5, color: T.accentSoft, fontFamily: FONT_MONO,
            letterSpacing: '0.1em',
          }}>
            {t('overview.domainTab')}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {OPEN_SOURCES.map((s) => (
            <span
              key={s.name}
              style={{
                padding: '4px 8px',
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 999,
                fontSize: 10.5,
                color: s.color,
                fontFamily: FONT_MONO,
                letterSpacing: '0.04em',
              }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
