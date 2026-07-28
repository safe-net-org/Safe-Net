import { T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'

export function EmptyState() {
  const { t } = useExtensionI18n()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 240, gap: 14, textAlign: 'center', padding: 28,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentViolet})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, boxShadow: `0 0 32px oklch(78% 0.17 205 / 0.4)`,
      }}>🛡</div>
      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
        {t('empty.title')}
      </span>
      <span style={{ fontSize: 12, color: T.textDim, lineHeight: 1.55, maxWidth: 260 }}>
        {t('empty.body')}
      </span>
    </div>
  )
}
