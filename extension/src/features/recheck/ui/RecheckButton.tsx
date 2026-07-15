import { T } from '@/src/shared/config/tokens'

interface RecheckButtonProps {
  onRecheck: () => void
}

export function RecheckButton({ onRecheck }: RecheckButtonProps) {
  return (
    <button
      onClick={onRecheck}
      style={{
        flex: 1,
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`,
        border: 'none',
        color: T.bg,
        padding: '10px',
        borderRadius: 12,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '-0.01em',
        boxShadow: `0 0 18px oklch(78% 0.17 205 / 0.25)`,
      }}
    >
      ↻ Проверить заново
    </button>
  )
}

export async function recheckCurrentTab(): Promise<void> {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (!activeTab?.id) return
  await browser.storage.local.remove(`tab_${activeTab.id}`)
  await browser.tabs.reload(activeTab.id)
  setTimeout(() => window.close(), 250)
}
