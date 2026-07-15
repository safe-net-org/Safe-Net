import type { AnalysisResult } from '@/src/entities/analysis'
import { T } from '@/src/shared/config/tokens'

interface ReportButtonProps {
  result: AnalysisResult
}

export function ReportButton({ result }: ReportButtonProps) {
  const handleClick = async () => {
    const subject = encodeURIComponent(`SafeNet — ложное срабатывание: ${result.url}`)
    const body = encodeURIComponent(
      `URL: ${result.url}\nScore: ${result.score}\nLevel: ${result.level}\n\nКомментарий:\n`,
    )
    await browser.tabs.create({ url: `mailto:report@safenet.local?subject=${subject}&body=${body}` })
  }

  return (
    <button
      onClick={handleClick}
      title="Сообщить о ложном срабатывании"
      style={{
        background: 'transparent',
        border: `1px solid ${T.borderStrong}`,
        color: T.textMuted,
        padding: '10px 12px',
        borderRadius: 12,
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      ⚑
    </button>
  )
}
