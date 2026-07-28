import type { AnalysisResult } from '@/src/entities/analysis'
import { LEVEL } from '@/src/shared/config/levels'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { Pill } from '@/src/shared/ui/Pill'
import { ScoreRing } from '@/src/shared/ui/ScoreRing'

interface ScoreBlockProps {
  result: AnalysisResult
  animated: boolean
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function getPath(url: string): string {
  try {
    const u = new URL(url)
    const p = (u.pathname + u.search).slice(0, 40)
    return p === '/' ? '' : p
  } catch { return '' }
}

interface SeverityBucket { high: number; medium: number; low: number }

function bucketize(signals: AnalysisResult['signals']): SeverityBucket {
  return {
    high: signals.filter((s) => s.severity === 'high').length,
    medium: signals.filter((s) => s.severity === 'medium').length,
    low: signals.filter((s) => s.severity === 'low').length,
  }
}

export function ScoreBlock({ result, animated }: ScoreBlockProps) {
  const { t } = useExtensionI18n()
  const cfg = LEVEL[result.level]
  const domain = getDomain(result.url)
  const path = getPath(result.url)
  const protocol = result.url.startsWith('https') ? 'HTTPS' : 'HTTP'
  const b = bucketize(result.signals)
  const total = Math.max(1, b.high + b.medium + b.low)

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px 14px',
      background: `radial-gradient(ellipse at center top, ${cfg.glow} 0%, transparent 70%)`,
      position: 'relative',
    }}>
      <ScoreRing score={result.score} level={result.level} animated={animated} />

      {/* DOMAIN + PATH */}
      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 4,
        maxWidth: 360, justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 15, fontWeight: 700, color: T.text,
          letterSpacing: '-0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: 240,
        }}>
          {domain}
        </span>
        {path && (
          <span style={{
            fontSize: 11, color: T.textDim, fontFamily: FONT_MONO,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 100,
          }}>
            {path}
          </span>
        )}
      </div>

      {/* PILLS */}
      <div style={{
        display: 'flex', gap: 6, marginTop: 10,
        alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <Pill color={cfg.color} bg={cfg.glow} border={cfg.color}>
          {cfg.emoji} {t(`level.${result.level}`)}
        </Pill>
        <Pill
          color={protocol === 'HTTPS' ? T.ok : T.danger}
          bg={protocol === 'HTTPS' ? 'oklch(72% 0.18 155 / 0.08)' : 'oklch(65% 0.24 25 / 0.08)'}
          border={protocol === 'HTTPS' ? 'oklch(72% 0.18 155 / 0.3)' : 'oklch(65% 0.24 25 / 0.3)'}
        >
          {protocol === 'HTTPS' ? '🔒' : '⚠'} {protocol}
        </Pill>
        {result.mlEnhanced && (
          <Pill color={T.accentSoft} bg="oklch(72% 0.12 205 / 0.12)" border="oklch(72% 0.12 205 / 0.35)">
            ✦ ML
          </Pill>
        )}
        {result.trusted && (
          <Pill color={T.ok} bg="oklch(72% 0.18 155 / 0.08)" border="oklch(72% 0.18 155 / 0.3)">
            ✓ {t('score.trusted')}
          </Pill>
        )}
      </div>

      {/* RISK BREAKDOWN BAR */}
      {result.signals.length > 0 && (
        <div style={{
          marginTop: 14, width: '100%', maxWidth: 340,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{
            display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden',
            background: T.border,
          }}>
            {b.high > 0 && (
              <div style={{
                width: `${(b.high / total) * 100}%`,
                background: T.danger,
                boxShadow: `0 0 8px ${T.danger}`,
              }} />
            )}
            {b.medium > 0 && (
              <div style={{ width: `${(b.medium / total) * 100}%`, background: T.warn }} />
            )}
            {b.low > 0 && (
              <div style={{ width: `${(b.low / total) * 100}%`, background: T.textMuted }} />
            )}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, color: T.textDim, fontFamily: FONT_MONO,
            letterSpacing: '0.08em',
          }}>
            <span><span style={{ color: T.danger }}>●</span> {t('score.high')} {b.high}</span>
            <span><span style={{ color: T.warn }}>●</span> {t('score.medium')} {b.medium}</span>
            <span><span style={{ color: T.textMuted }}>●</span> {t('score.low')} {b.low}</span>
          </div>
        </div>
      )}
    </div>
  )
}
