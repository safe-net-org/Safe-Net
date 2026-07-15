import {
  analyzeUrl,
  scoreUrl,
  type AnalysisResult,
  type DomFeatures,
  type ExtensionMessage,
  type IntelThreatPayload,
  type RiskSignal,
} from '@/src/entities/analysis'
import { bumpStats } from '@/src/entities/stats'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'
import { getCached, setCache } from './cache'
import { queryMlService, mergeWithMl } from './ml-service'
import { updateBadge } from './badge'

export function shouldAnalyze(url: string): boolean {
  if (!url) return false
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return false
  if (url.startsWith('about:') || url.startsWith('moz-extension://')) return false
  if (url.startsWith('file://')) return false
  return true
}

async function notifyTab(tabId: number, result: AnalysisResult): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_RESULT',
      result,
    } satisfies ExtensionMessage)
  } catch { /* content script may not be ready */ }
}

export async function analyzeAndStore(url: string, tabId: number): Promise<AnalysisResult> {
  const cached = await getCached(url)
  if (cached) {
    await browser.storage.local.set({ [STORAGE_KEYS.tab(tabId)]: cached })
    await updateBadge(tabId, cached)
    return cached
  }

  const features = analyzeUrl(url)
  const localResult = scoreUrl(url, features)
  await bumpStats(localResult)
  await setCache(url, localResult)
  await browser.storage.local.set({ [STORAGE_KEYS.tab(tabId)]: localResult })
  await updateBadge(tabId, localResult)
  await notifyTab(tabId, localResult)

  void queryMlService(url).then(async (ml) => {
    if (!ml) return
    const enhanced = mergeWithMl(localResult, ml)
    await setCache(url, enhanced)
    await browser.storage.local.set({ [STORAGE_KEYS.tab(tabId)]: enhanced })
    await updateBadge(tabId, enhanced)
    await notifyTab(tabId, enhanced)
  })

  return localResult
}

export async function mergeDomFeatures(
  tabId: number,
  domFeatures: DomFeatures,
): Promise<void> {
  const stored = await browser.storage.local.get(STORAGE_KEYS.tab(tabId))
  const existing = stored[STORAGE_KEYS.tab(tabId)] as AnalysisResult | undefined
  if (!existing) return

  const domSignals: RiskSignal[] = []
  let domScore = 0

  if (domFeatures.hasPasswordOnHttp) {
    domScore += 30
    domSignals.push({ key: 'password_on_http', message: 'Форма ввода пароля на HTTP-странице', severity: 'high' })
  }
  if (domFeatures.hasExternalFormAction) {
    domScore += 25
    domSignals.push({ key: 'external_form', message: 'Форма отправляет данные на сторонний домен', severity: 'high' })
  }
  if (domFeatures.suspiciousBrandLogos.length > 0) {
    domScore += 20
    domSignals.push({
      key: 'brand_logo',
      message: `Логотип бренда на чужом домене: ${domFeatures.suspiciousBrandLogos[0]}`,
      severity: 'high',
    })
  }
  if (domFeatures.hasObfuscatedJs) {
    domScore += 15
    domSignals.push({ key: 'obfuscated_js', message: 'Подозрительная обфускация JavaScript (eval/base64)', severity: 'medium' })
  }
  if (domFeatures.hasClickjacking) {
    domScore += 20
    domSignals.push({ key: 'clickjacking', message: 'Невидимые кликабельные элементы поверх страницы (clickjacking)', severity: 'high' })
  }
  if (domFeatures.hasCryptoDrainer) {
    domScore += 30
    domSignals.push({ key: 'crypto_drainer', message: 'Страница запрашивает seed-фразу / приватный ключ криптокошелька', severity: 'high' })
  }

  const newScore = Math.min(100, existing.score + Math.round(domScore * 0.4))
  const updated: AnalysisResult = {
    ...existing,
    domScore,
    domSignals,
    score: newScore,
    signals: [...existing.signals, ...domSignals],
    level: newScore <= 30 ? 'safe' : newScore <= 70 ? 'suspicious' : 'danger',
  }

  await browser.storage.local.set({ [STORAGE_KEYS.tab(tabId)]: updated })
  await updateBadge(tabId, updated)
  await notifyTab(tabId, updated)
}

export async function mergeIntelThreat(payload: IntelThreatPayload): Promise<void> {
  const { tabId } = payload
  const stored = await browser.storage.local.get(STORAGE_KEYS.tab(tabId))
  const existing = stored[STORAGE_KEYS.tab(tabId)] as AnalysisResult | undefined
  if (!existing) return

  const intelSignals: RiskSignal[] = []
  let bump = 0

  const listed = payload.listings.filter((l: { source: string; listed: boolean }) => l.listed)
  if (listed.length > 0) {
    bump += 25 + listed.length * 10
    intelSignals.push({
      key: 'intel_threat_feed',
      message: `Открытые threat-feeds блокируют домен: ${listed.map((l: { source: string }) => l.source).join(', ')}`,
      severity: 'high',
    })
  }
  if (payload.ageDays !== null && payload.ageDays < 90) {
    bump += 15
    intelSignals.push({
      key: 'intel_new_domain',
      message: `Молодой домен (${payload.ageDays} дн.) — частый признак фишинга`,
      severity: payload.ageDays < 30 ? 'high' : 'medium',
    })
  }

  const vtMal = payload.vtMalicious ?? 0
  const vtSus = payload.vtSuspicious ?? 0
  if (vtMal > 0 || vtSus > 0) {
    // Each flagging engine adds weight; malicious counts double vs suspicious.
    bump += Math.min(45, vtMal * 12 + vtSus * 5)
    intelSignals.push({
      key: 'intel_virustotal',
      message: `VirusTotal: ${vtMal} движков отметили домен как вредоносный${vtSus ? `, ${vtSus} как подозрительный` : ''}`,
      severity: vtMal >= 2 ? 'high' : 'medium',
    })
  }

  if (intelSignals.length === 0) return

  const filtered = existing.signals.filter(
    (s) =>
      s.key !== 'intel_threat_feed' &&
      s.key !== 'intel_new_domain' &&
      s.key !== 'intel_virustotal',
  )
  const newScore = Math.min(100, existing.score + bump)
  const updated: AnalysisResult = {
    ...existing,
    score: newScore,
    level: newScore <= 30 ? 'safe' : newScore <= 70 ? 'suspicious' : 'danger',
    signals: [...filtered, ...intelSignals],
  }

  await browser.storage.local.set({ [STORAGE_KEYS.tab(tabId)]: updated })
  await updateBadge(tabId, updated)
  await notifyTab(tabId, updated)
}
