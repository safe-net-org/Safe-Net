import type { ExtensionMessage } from '@/src/entities/analysis'
import { analyzeAndStore, mergeDomFeatures, mergeIntelThreat, shouldAnalyze } from '@/src/features/analyze-url'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'

export function registerBackground(): void {
  browser.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return
    const { url, tabId } = details
    if (!shouldAnalyze(url)) return
    await analyzeAndStore(url, tabId)
  })

  browser.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_RESULT') {
      const tabId = sender.tab?.id
      if (!tabId) { sendResponse(null); return }
      browser.storage.local.get(STORAGE_KEYS.tab(tabId)).then((store) => {
        sendResponse({
          type: 'CURRENT_RESULT',
          result: store[STORAGE_KEYS.tab(tabId)] ?? null,
        } satisfies ExtensionMessage)
      })
      return true
    }

    if (message.type === 'DOM_FEATURES') {
      const tabId = sender.tab?.id
      if (!tabId) return
      void mergeDomFeatures(tabId, message.features)
    }

    if (message.type === 'INTEL_THREAT') {
      void mergeIntelThreat(message.payload)
    }
  })

  browser.tabs.onRemoved.addListener((tabId) => {
    void browser.storage.local.remove(STORAGE_KEYS.tab(tabId))
  })

  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return
    try {
      await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' })
    } catch {
      /* content script may not be injected on chrome:// / about: pages */
    }
  })
}
