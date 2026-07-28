import type { AnalysisResult } from '@/src/entities/analysis'
import { T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'

interface ReportButtonProps {
  result: AnalysisResult
}

export function ReportButton({ result }: ReportButtonProps) {
  const { locale, t } = useExtensionI18n()
  const handleClick = async () => {
    const subject = encodeURIComponent(
      locale === 'ru'
        ? `SafeNet — ложное срабатывание: ${result.url}`
        : `SafeNet — false positive: ${result.url}`,
    )
    const body = encodeURIComponent(
      `URL: ${result.url}\nScore: ${result.score}\nLevel: ${result.level}\n\n`
      + (locale === 'ru' ? 'Комментарий:\n' : 'Comment:\n'),
    )
    await browser.tabs.create({ url: `mailto:report@safenet.local?subject=${subject}&body=${body}` })
  }

  return (
    <button
      onClick={handleClick}
      title={t('footer.report')}
      aria-label={t('footer.report')}
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
