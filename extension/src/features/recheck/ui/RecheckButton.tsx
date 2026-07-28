import { T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'

interface RecheckButtonProps {
  onRecheck: () => void
}

export function RecheckButton({ onRecheck }: RecheckButtonProps) {
  const { t } = useExtensionI18n()

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
      ↻ {t('footer.recheck')}
    </button>
  )
}

export async function recheckCurrentTab(): Promise<void> {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (!activeTab?.id) return
  const keys = [STORAGE_KEYS.tab(activeTab.id)]
  // Drop the URL cache too — a recheck that serves the hour-old cached verdict
  // is not a recheck.
  if (activeTab.url) keys.push(STORAGE_KEYS.cache(activeTab.url))
  await browser.storage.local.remove(keys)
  await browser.tabs.reload(activeTab.id)
  setTimeout(() => window.close(), 250)
}
