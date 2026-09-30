import type { ExtensionMessage } from '@/src/entities/analysis'
import { analyzeAndStore, mergeDomFeatures, mergeIntelThreat, shouldAnalyze } from '@/src/features/analyze-url'
import { pruneExpiredCache } from '@/src/features/analyze-url/model/cache'
import { getTrustedHosts, normalizeHost, trustHost, untrustHost } from '@/src/shared/lib/allowlist'
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

    if (message.type === 'INTEL_THREAT' && sender.url?.startsWith(browser.runtime.getURL('/')) && !sender.tab) {
      void mergeIntelThreat(message.payload)
    }

    if (message.type === 'TRUST_ACTIVE_SITE') {
      // Only an extension-owned page can authorize permanent trust. Content
      // scripts run beside untrusted page DOM and must never reach this branch.
      if (!sender.url?.startsWith(browser.runtime.getURL('/')) || sender.tab) {
        sendResponse(false)
        return
      }
      void browser.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
        if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) {
          sendResponse(false)
          return
        }
        await trustHost(tab.url)
        await analyzeAndStore(tab.url, tab.id)
        sendResponse(true)
      }).catch(() => sendResponse(false))
      return true
    }

    if (message.type === 'UNTRUST_HOST') {
      if (!sender.url?.startsWith(browser.runtime.getURL('/')) || sender.tab) {
        sendResponse(false)
        return
      }
      void (async () => {
        const host = normalizeHost(message.host)
        if (!host || !(await getTrustedHosts()).includes(host)) return false
        await untrustHost(host)
        const tabs = await browser.tabs.query({})
        for (const tab of tabs) {
          if (!tab.id || !tab.url || !/^https?:\/\//i.test(tab.url) || normalizeHost(tab.url) !== host) continue
          await browser.storage.local.remove(STORAGE_KEYS.cache(tab.url))
          await analyzeAndStore(tab.url, tab.id)
        }
        return true
      })().then(sendResponse).catch(() => sendResponse(false))
      return true
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
