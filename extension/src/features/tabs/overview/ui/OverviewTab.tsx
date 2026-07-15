import type { AnalysisResult } from '@/src/entities/analysis'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
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
  const summary = result.level === 'safe'
    ? 'Признаков фишинга не обнаружено. URL прошёл 25+ проверок: гомограф, тайпсквоттинг, энтропия домена, обфускация и DOM-сигналы.'
    : result.level === 'suspicious'
    ? `Найдено ${result.signals.length} подозрительных признаков. Будь осторожен с вводом паролей и платёжных данных.`
    : `Обнаружено ${result.signals.filter((s) => s.severity === 'high').length} критических признаков фишинга. Не вводи здесь логины и пароли.`

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
          Краткая сводка
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>
          {summary}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatTile label="Сигналов" value={result.signals.length} accent={result.signals.length ? T.warn : T.ok} />
        <StatTile label="Длина URL" value={result.features.urlLength} sub={result.features.urlLength > 75 ? 'длинный' : 'норма'} />
        <StatTile label="Поддомены" value={result.features.subdomainDepth} sub={result.features.subdomainDepth > 3 ? 'глубоко' : 'норма'} />
        <StatTile label="Энтропия" value={result.features.domainEntropy.toFixed(2)} sub={result.features.domainEntropy > 3.5 ? 'высокая' : 'норма'} />
      </div>

      {result.features.nearestBrand && result.features.levenshteinDistance <= 2 && (
        <div style={{
          padding: '10px 12px', borderRadius: T.radTile,
          background: 'oklch(65% 0.24 25 / 0.08)',
          border: '1px solid oklch(65% 0.24 25 / 0.25)',
          fontSize: 12, color: T.danger,
        }}>
          ⚠ Похож на бренд: <strong>{result.features.nearestBrand}</strong> (расстояние {result.features.levenshteinDistance})
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
            Открытые базы
          </span>
          <span style={{
            fontSize: 9.5, color: T.accentSoft, fontFamily: FONT_MONO,
            letterSpacing: '0.1em',
          }}>
            → ВКЛАДКА «ДОМЕН»
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
