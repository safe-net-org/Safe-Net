import { T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import type { ExtensionMessageKey } from '@/src/shared/i18n/messages'

// Data-only copy keeps the privacy contract easy to move into EN/RU catalogs.
const ABOUT_ITEMS: ReadonlyArray<readonly [string, ExtensionMessageKey, ExtensionMessageKey]> = [
  ['🔒', 'about.local.title', 'about.local.body'],
  ['◌', 'about.network.title', 'about.network.body'],
  ['⚡', 'about.speed.title', 'about.speed.body'],
  ['🧠', 'about.rules.title', 'about.rules.body'],
  ['✦', 'about.ml.title', 'about.ml.body'],
  ['🌐', 'about.cyrillic.title', 'about.cyrillic.body'],
  ['📖', 'about.open.title', 'about.open.body'],
]

export function AboutTab() {
  const { t } = useExtensionI18n()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ABOUT_ITEMS.map(([icon, titleKey, descKey]) => (
        <div key={titleKey} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '10px 12px',
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.radTile,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5, fontWeight: 600, color: T.text,
              marginBottom: 3, letterSpacing: '-0.01em',
            }}>
              {t(titleKey)}
            </div>
            <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>{t(descKey)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
