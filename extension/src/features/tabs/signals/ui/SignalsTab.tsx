import type { AnalysisResult } from '@/src/entities/analysis'
import { T } from '@/src/shared/config/tokens'
import { SignalItem } from '@/src/shared/ui/SignalItem'

interface SignalsTabProps {
  result: AnalysisResult
}

export function SignalsTab({ result }: SignalsTabProps) {
  if (result.signals.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 0',
        color: T.textDim, fontSize: 13,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 32 }}>✅</div>
        <span>Подозрительных признаков не найдено</span>
        <span style={{ fontSize: 11, color: T.textDim, maxWidth: 240, lineHeight: 1.5 }}>
          Проверено 25+ эвристик и ML-модель.
        </span>
      </div>
    )
  }

  return (
    <>
      {result.signals.map((s, i) => (
        <div key={s.key} className="fade-in" style={{ animationDelay: `${i * 40}ms` }}>
          <SignalItem signal={s} />
        </div>
      ))}
    </>
  )
}
