import { T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import type { ExtensionMessageKey } from '@/src/shared/i18n/messages'

export type PopupTab = 'overview' | 'domain' | 'signals' | 'features' | 'stats' | 'settings' | 'about'

interface TabBarProps {
  active: PopupTab
  signalCount: number
  onChange: (tab: PopupTab) => void
}

const TABS: ReadonlyArray<readonly [PopupTab, ExtensionMessageKey]> = [
  ['overview', 'tab.overview'],
  ['domain', 'tab.domain'],
  ['signals', 'tab.signals'],
  ['features', 'tab.features'],
  ['stats', 'tab.stats'],
  ['settings', 'tab.settings'],
  ['about', 'tab.about'],
]

export function TabBar({ active, signalCount, onChange }: TabBarProps) {
  const { t } = useExtensionI18n()

  return (
    <div style={{
      display: 'flex',
      padding: '0 10px',
      gap: 2,
      borderTop: `1px solid ${T.border}`,
      borderBottom: `1px solid ${T.border}`,
      background: T.bgElev,
      overflowX: 'auto',
    }}>
      {TABS.map(([key, labelKey]) => {
        const label = t(labelKey)
        const labelText = key === 'signals' && signalCount > 0 ? `${label} ${signalCount}` : label
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              flex: 'none',
              padding: '10px 11px',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? `2px solid ${T.accent}` : '2px solid transparent',
              color: isActive ? T.text : T.textDim,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.15s',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {labelText}
          </button>
        )
      })}
    </div>
  )
}
