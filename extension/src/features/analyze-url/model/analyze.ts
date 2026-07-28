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
import { isTrusted } from '@/src/shared/lib/allowlist'
import { getSettings } from '@/src/shared/lib/settings'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'
import { getCached, setCache } from './cache'
import { queryMlService, mergeWithMl } from './ml-service'
import { updateBadge } from './badge'

const TRUSTED_SIGNAL: RiskSignal = {
  key: 'trusted_host',
  message: 'Сайт в вашем списке доверенных — проверки пропущены',
  severity: 'low',
}

const DOM_WEIGHT = 0.4

/**
 * The verdict is composed from three independent layers that arrive in any
 * order: the base score (rules, later replaced by the rules+ML blend), the DOM
 * scan, and threat intel. Each layer stores its own component and the total is
 * recomputed from scratch — merges used to add onto the running score, so a
 * layer that fired twice counted twice, and a slow ML response overwrote the
 * DOM signals that had landed while it was in flight.
 */
interface ComposedResult extends AnalysisResult {
  baseScore: number
  baseSignals: RiskSignal[]
  intelScore?: number
  intelSignals?: RiskSignal[]
}

function toLevel(score: number): AnalysisResult['level'] {
  if (score <= 30) return 'safe'
  if (score <= 70) return 'suspicious'
  return 'danger'
}

/** Entries written before the component fields existed carry only the total. */
function toComposed(result: AnalysisResult): ComposedResult {
  const partial = result as Partial<ComposedResult>
  if (typeof partial.baseScore === 'number' && Array.isArray(partial.baseSignals)) {
    return result as ComposedResult
  }
  return { ...result, baseScore: result.score, baseSignals: result.signals }
}

function recompose(result: ComposedResult): ComposedResult {
  const dom = Math.round((result.domScore ?? 0) * DOM_WEIGHT)
  const intel = result.intelScore ?? 0
  const score = Math.min(100, result.baseScore + dom + intel)
  return {
    ...result,
    score,
    level: toLevel(score),
    signals: [
      ...result.baseSignals,
      ...(result.domSignals ?? []),
      ...(result.intelSignals ?? []),
    ],
  }
}

async function getStored(tabId: number): Promise<ComposedResult | undefined> {
  const stored = await browser.storage.local.get(STORAGE_KEYS.tab(tabId))
  const existing = stored[STORAGE_KEYS.tab(tabId)] as AnalysisResult | undefined
  return existing ? toComposed(existing) : undefined
}

async function notifyTab(tabId: number, result: AnalysisResult): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_RESULT',
      result,
    } satisfies ExtensionMessage)
  } catch { /* content script may not be ready */ }
}

async function storeAndBroadcast(tabId: number, result: ComposedResult): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.tab(tabId)]: result })
  await updateBadge(tabId, result)
  await notifyTab(tabId, result)
}

export function shouldAnalyze(url: string): boolean {
  if (!url) return false
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return false
  if (url.startsWith('about:') || url.startsWith('moz-extension://')) return false
  if (url.startsWith('file://')) return false
  return true
}

export async function analyzeAndStore(url: string, tabId: number): Promise<AnalysisResult> {
  // Trust wins over cache: the cache may still hold a danger verdict from
  // before the user trusted the host. Trusted results are never cached, so
  // removing a host from the list takes effect on the very next navigation.
  if (await isTrusted(url)) {
    const result: ComposedResult = {
      url,
      score: 0,
      level: 'safe',
      signals: [TRUSTED_SIGNAL],
      features: analyzeUrl(url),
      analyzedAt: Date.now(),
      trusted: true,
      baseScore: 0,
      baseSignals: [TRUSTED_SIGNAL],
    }
    await storeAndBroadcast(tabId, result)
    return result
  }

  const cached = await getCached(url)
  if (cached) {
    // An ML-enhanced entry created before the user opted out must not leak
    // into the local-only experience. It is replaced by a fresh local score.
    const { mlEnabled } = await getSettings()
    if (!cached.mlEnhanced || mlEnabled) {
      const result = toComposed(cached)
      await storeAndBroadcast(tabId, result)
      return result
    }
  }

  const local = scoreUrl(url, analyzeUrl(url))
  const result = toComposed(local)
  await bumpStats(local)
  await setCache(url, result)
  await storeAndBroadcast(tabId, result)

  void queryMlService(url).then(async (ml) => {
    if (!ml) return
    // The user may have switched ML off while the request was in flight.
    if (!(await getSettings()).mlEnabled) return
    const enhanced = mergeWithMl(local, ml)
    // The blend replaces only the base component of whatever the tab holds by
    // now — the DOM scan or intel may have landed while the request was in
    // flight. If the tab moved to another URL meanwhile, drop the response.
    const current = await getStored(tabId)
    if (!current || current.url !== url || current.trusted) return
    await storeAndBroadcast(tabId, recompose({
      ...current,
      baseScore: enhanced.score,
      baseSignals: enhanced.signals,
      mlEnhanced: true,
    }))
  })

  return result
}

export async function mergeDomFeatures(
  tabId: number,
  domFeatures: DomFeatures,
): Promise<void> {
  const existing = await getStored(tabId)
  if (!existing || existing.trusted) return

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

  await storeAndBroadcast(tabId, recompose({ ...existing, domScore, domSignals }))
}

export async function mergeIntelThreat(payload: IntelThreatPayload): Promise<void> {
  const { tabId } = payload
  const existing = await getStored(tabId)
  if (!existing || existing.trusted) return

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

  await storeAndBroadcast(tabId, recompose({ ...existing, intelScore: bump, intelSignals }))
}
