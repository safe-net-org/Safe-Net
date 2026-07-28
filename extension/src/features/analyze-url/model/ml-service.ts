import { applyMlBlend } from '@/src/entities/analysis'
import type { AnalysisResult, RiskSignal } from '@/src/entities/analysis'
import { normalizeMlServiceUrl } from '@/src/shared/lib/ml-health'
import { getSettings } from '@/src/shared/lib/settings'
import { sanitizeUrlForMl } from '@/src/shared/lib/url-privacy'

const ML_TIMEOUT_MS = 2000

export interface MlSignal {
  feature: string
  label: string
  value: number
  shap_value: number
  severity: 'high' | 'medium' | 'low'
}

export interface MlResponse {
  score: number
  level: 'safe' | 'suspicious' | 'danger'
  probability: number
  signals: MlSignal[]
  /** Raw neural-net probability, before server-side blending. */
  ml_probability?: number
  rule_score?: number
  method?: string
}

function parseMlResponse(value: unknown): MlResponse | null {
  if (!value || typeof value !== 'object') return null
  const response = value as Partial<MlResponse>
  if (typeof response.score !== 'number'
    || response.score < 0
    || response.score > 100
    || typeof response.probability !== 'number'
    || response.probability < 0
    || response.probability > 1
    || !['safe', 'suspicious', 'danger'].includes(response.level ?? '')
    || !Array.isArray(response.signals)) {
    return null
  }
  if (response.ml_probability !== undefined
    && (typeof response.ml_probability !== 'number'
      || response.ml_probability < 0
      || response.ml_probability > 1)) {
    return null
  }
  const signalsValid = response.signals.every((signal) =>
    signal
    && typeof signal.feature === 'string'
    && typeof signal.label === 'string'
    && typeof signal.value === 'number'
    && typeof signal.shap_value === 'number'
    && ['high', 'medium', 'low'].includes(signal.severity),
  )
  return signalsValid ? response as MlResponse : null
}

export async function queryMlService(url: string): Promise<MlResponse | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    const settings = await getSettings()
    if (!settings.mlEnabled) return null

    const endpoint = normalizeMlServiceUrl(settings.mlServiceUrl)
    const sanitizedUrl = sanitizeUrlForMl(url)
    if (!endpoint || !sanitizedUrl) return null

    const controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: sanitizedUrl }),
      signal: controller.signal,
    })

    if (!response.ok) return null
    return parseMlResponse(await response.json())
  } catch {
    return null
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

export function mergeWithMl(local: AnalysisResult, ml: MlResponse): AnalysisResult {
  const mlSignals: RiskSignal[] = ml.signals
    .filter((s) => Math.abs(s.shap_value) > 0.05)
    .slice(0, 5)
    .map((s) => ({
      key: `ml_${s.feature}`,
      message: `[ML] ${s.label}`,
      severity: s.severity,
    }))

  // Blend with the shared guard-core function, not a second ad-hoc weighting:
  // the ml-service already blends server-side with the same rules, and doing a
  // *different* blend here would double-count them. `ml_probability` is the raw
  // net output; the extension trusts its own local rule score and applies the
  // one canonical blend. Falls back to the pre-blend probability for older
  // service versions that did not return ml_probability.
  const mlProbability = ml.ml_probability ?? ml.probability
  return applyMlBlend(local, mlProbability, mlSignals)
}
