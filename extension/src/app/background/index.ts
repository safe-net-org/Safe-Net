import type { ExtensionMessage } from '@/src/entities/analysis'
import { analyzeAndStore, mergeDomFeatures, mergeIntelThreat, shouldAnalyze } from '@/src/features/analyze-url'
import { pruneExpiredCache } from '@/src/features/analyze-url/model/cache'
import { trustHost } from '@/src/shared/lib/allowlist'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'

export function registerBackground(): void {
  void pruneExpiredCache()

  browser.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return
    const { url, tabId } = details
    if (!shouldAnalyze(url)) return
    await analyzeAndStore(url, tabId)
  })

  // SPA route changes never commit a navigation — without this, the verdict
  // shown would stay frozen on whatever URL the tab first loaded.
  browser.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
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

    if (message.type === 'TRUST_SITE') {
      // The host to trust is derived from the sender tab, not the message
      // payload — a content script can only ever allowlist the page it runs on.
      const tabId = sender.tab?.id
      const url = sender.tab?.url
      if (tabId && url && shouldAnalyze(url)) {
        // Re-analyze right away so the tab's verdict flips to safe and the
        // content script gets the update that clears its warnings.
        void trustHost(url).then(() => analyzeAndStore(url, tabId))
      }
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

  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'toggle-panel') return
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    try {
      await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' })
    } catch {
      /* content script may not be injected on chrome:// / about: pages */
    }
  })
}
