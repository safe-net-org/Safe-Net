import { T } from '@/src/shared/config/tokens'

export type PopupTab = 'overview' | 'domain' | 'signals' | 'features' | 'stats' | 'settings' | 'about'

interface TabBarProps {
  active: PopupTab
  signalCount: number
  onChange: (tab: PopupTab) => void
}

const TABS: ReadonlyArray<readonly [PopupTab, string]> = [
  ['overview', 'Обзор'],
  ['domain', 'Домен'],
  ['signals', 'Сигналы'],
  ['features', 'URL'],
  ['stats', 'Статистика'],
  ['settings', 'Настройки'],
  ['about', 'О защите'],
]

export function TabBar({ active, signalCount, onChange }: TabBarProps) {
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
      {TABS.map(([key, label]) => {
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
