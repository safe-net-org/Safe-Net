import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { Pill } from '@/src/shared/ui/Pill'

export function Header() {
  const { locale, setLocale, t } = useExtensionI18n()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: `1px solid ${T.border}`,
      background: `linear-gradient(180deg, ${T.bgElev}, transparent)`,
      position: 'relative',
    }}>
      <div style={{
        width: 36, height: 36,
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentViolet})`,
        borderRadius: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, flexShrink: 0,
        boxShadow: `0 0 24px oklch(78% 0.17 205 / 0.4), inset 0 1px 0 oklch(100% 0 0 / 0.15)`,
      }}>🛡</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          SafeNet Guard
          <span style={{
            fontSize: 9.5, color: T.accentSoft,
            border: `1px solid ${T.border}`,
            padding: '1px 5px', borderRadius: 4,
            fontFamily: FONT_MONO, letterSpacing: '0.1em',
            background: 'oklch(72% 0.12 205 / 0.08)',
          }}>
            PRO
          </span>
        </div>
        <div style={{
          fontSize: 10, color: T.textDim, fontFamily: FONT_MONO,
          letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 2,
        }}>
          {t('header.tagline')}
        </div>
      </div>
      <button
        type="button"
        aria-label={t('locale.label')}
        title={t('locale.label')}
        onClick={() => void setLocale(locale === 'en' ? 'ru' : 'en')}
        style={{
          minWidth: 34, height: 26, padding: '0 8px',
          borderRadius: 999, border: `1px solid ${T.borderStrong}`,
          background: T.surface2, color: T.textMuted,
          fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.08em', cursor: 'pointer',
          transition: 'transform 0.18s cubic-bezier(.22, 1, .36, 1), color 0.18s',
        }}
      >
        {locale.toUpperCase()}
      </button>
      <Pill color={T.ok} bg="oklch(72% 0.18 155 / 0.1)" border="oklch(72% 0.18 155 / 0.3)">
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: T.ok, boxShadow: `0 0 6px ${T.ok}`,
          animation: 'pulse-dot 2s infinite',
        }} />
        {t('header.active')}
      </Pill>
    </div>
  )
}
