import type { AnalysisResult } from '@/src/entities/analysis'
import { RecheckButton } from '@/src/features/recheck/ui/RecheckButton'
import { ReportButton } from '@/src/features/report/ui/ReportButton'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { fmtTime } from '@/src/shared/lib/format'

interface PopupFooterProps {
  result: AnalysisResult
  onRecheck: () => void
}

export function PopupFooter({ result, onRecheck }: PopupFooterProps) {
  const { locale } = useExtensionI18n()

  return (
    <div style={{
      padding: '10px 14px',
      borderTop: `1px solid ${T.border}`,
      display: 'flex', gap: 8, alignItems: 'center',
      background: T.bgElev,
    }}>
      <RecheckButton onRecheck={onRecheck} />
      <ReportButton result={result} />
      <span className="tabular" style={{
        fontSize: 10, color: T.textDim,
        fontFamily: FONT_MONO,
        letterSpacing: '0.08em',
      }}>
        {fmtTime(result.analyzedAt, locale)}
      </span>
    </div>
  )
}
